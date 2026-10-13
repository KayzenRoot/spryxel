/** Spryxel Control Tower R0: no network, no agents, no writes, no merge. */
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const SHA=/^[\da-f]{40}$/i, statuses=new Set(['PLANNING','DRAFT','BLOCKED','COMPLETE','ADMITTED_FOR_EXECUTION']), risks=new Set(['LOW','STANDARD','ELEVATED','HIGH_ASSURANCE']);
function guard(c,m){if(!c)throw Error(m)}
function owns(p){return typeof p==='string'&&p.length>0&&!p.includes('*')&&!p.includes('\\')&&!p.startsWith('/')&&p.split('/').every(x=>x&&x!=='.'&&x!=='..')}
function overlaps(a,b){const sa=a.split('/'),sb=b.split('/');return (sa.length<=sb.length&&sa.every((x,i)=>x===sb[i]))||(sb.length<=sa.length&&sb.every((x,i)=>x===sa[i]))}
const protectedPaths=['.engineering','.gef','.github/workflows','package.json','package-lock.json'];
function collision(a,b){return a.risk==='HIGH_ASSURANCE'||b.risk==='HIGH_ASSURANCE'||a.exclusiveLocks.some(x=>b.exclusiveLocks.includes(x))||a.ownsPaths.some(x=>b.ownsPaths.some(y=>overlaps(x,y)))}
export function planBatch(m){
 guard(m&&m.schemaVersion===1,'schemaVersion must equal 1');
 guard(m.repository==='KayzenRoot/spryxel','wrong repository');
 guard(SHA.test(m.baseSha||''),'invalid base SHA');
 guard(Number.isInteger(m.maxParallel)&&m.maxParallel>=1&&m.maxParallel<=4,'maxParallel must be 1..4');
 guard(Number.isSafeInteger(m.maxBatchTokens)&&m.maxBatchTokens>0,'invalid maxBatchTokens');
 guard(Array.isArray(m.workOrders)&&Array.isArray(m.completedWorkOrders||[]),'invalid task arrays');
 const map=new Map(), done=new Set(), blocked=[], waves=[];
 for(const r of m.completedWorkOrders||[]){
  guard(r&&typeof r.id==='string'&&SHA.test(r.evidenceSha||'')&&r.verdict==='APPROVED'&&r.postMerge==='PASS','invalid prior approval receipt');
  guard(!done.has(r.id),'duplicate approval receipt');done.add(r.id);
 }
 for(const w of m.workOrders){
  guard(w&&typeof w.id==='string'&&w.id.length>0&&!map.has(w.id)&&!done.has(w.id),'duplicate/invalid WO id');
  guard(Number.isInteger(w.issue)&&w.issue>0,'invalid issue');
  guard(statuses.has(w.status)&&risks.has(w.risk),'invalid status/risk');
  guard(SHA.test(w.baseSha||'')&&['FRESH','STALE','MISSING'].includes(w.contextLock),'invalid source SHA/context lock');
  guard(Array.isArray(w.dependsOn)&&w.dependsOn.every(x=>typeof x==='string')&&new Set(w.dependsOn).size===w.dependsOn.length,'invalid dependencies');
  guard(Array.isArray(w.ownsPaths)&&w.ownsPaths.length>0&&w.ownsPaths.every(owns),'invalid owned path');
  guard(new Set(w.ownsPaths).size===w.ownsPaths.length,'duplicate owned paths');
  guard(Array.isArray(w.exclusiveLocks)&&w.exclusiveLocks.every(x=>typeof x==='string'&&x.length>0),'invalid locks');
  guard(Number.isSafeInteger(w.tokenBudget)&&w.tokenBudget>0,'invalid tokenBudget');
  guard(Number.isInteger(w.estimatedMinutes)&&w.estimatedMinutes>0,'invalid estimatedMinutes');
  guard(Number.isInteger(w.priority)&&w.priority>=1&&w.priority<=5,'invalid priority');
  if(w.risk==='HIGH_ASSURANCE')guard(w.exclusiveLocks.includes('HIGH_ASSURANCE'),'missing HIGH_ASSURANCE lock');
  if(w.ownsPaths.some(p=>protectedPaths.some(q=>overlaps(p,q))))guard(w.exclusiveLocks.includes('GOVERNANCE'),'missing GOVERNANCE lock');
  map.set(w.id,w);
 }
 for(const w of map.values())for(const dep of w.dependsOn)guard(map.has(dep)||done.has(dep),'unknown/unverified dependency: '+dep);
 const active=new Set(),seen=new Set();
 function visit(id){if(done.has(id)||seen.has(id))return;guard(!active.has(id),'dependency cycle at '+id);active.add(id);for(const x of map.get(id).dependsOn)visit(x);active.delete(id);seen.add(id)}
 for(const id of map.keys())visit(id);
 let eligible=[...map.values()].filter(w=>{
  const reasons=[];
  if(w.status!=='ADMITTED_FOR_EXECUTION')reasons.push('status:'+w.status);
  if(w.contextLock!=='FRESH')reasons.push('contextLock:'+w.contextLock);
  if(w.baseSha!==m.baseSha)reasons.push('BASE_SHA_STALE');
  if(w.tokenBudget>m.maxBatchTokens)reasons.push('TOKEN_BUDGET_EXCEEDS_CAP');
  if(reasons.length)blocked.push({id:w.id,issue:w.issue,reasons});
  return reasons.length===0;
 });
 let altered;
 do{altered=false;const live=new Set(eligible.map(w=>w.id));eligible=eligible.filter(w=>{
  const pending=w.dependsOn.filter(d=>!done.has(d)&&!live.has(d));
  if(!pending.length)return true;
  blocked.push({id:w.id,issue:w.issue,reasons:['DEPENDENCY_NOT_ADMITTED:'+pending.join(',')]});altered=true;return false;
 })}while(altered);
 const waiting=new Map(eligible.map(w=>[w.id,w]));
 function remaining(id,trail=[]){if(trail.includes(id))return 0;return map.get(id).estimatedMinutes+Math.max(0,...[...waiting.values()].filter(w=>w.dependsOn.includes(id)).map(w=>remaining(w.id,[...trail,id])))}
 while(waiting.size){
  const possible=[...waiting.values()].filter(w=>w.dependsOn.every(d=>done.has(d)));
  guard(possible.length>0,'blocked dependency graph');
  possible.sort((a,b)=>a.priority-b.priority||remaining(b.id)-remaining(a.id)||a.id.localeCompare(b.id));
  const group=[];let tokens=0;
  for(const w of possible){if(group.length>=m.maxParallel||tokens+w.tokenBudget>m.maxBatchTokens||group.some(x=>collision(x,w)))continue;group.push(w);tokens+=w.tokenBudget}
  guard(group.length>0,'batch budget prevents scheduling');
  waves.push({wave:waves.length+1,mode:'DRY_RUN_ONLY',estimatedConcurrentMinutes:Math.max(...group.map(w=>w.estimatedMinutes)),tokenBudgetCeiling:tokens,tasks:group.map(w=>({id:w.id,issue:w.issue,risk:w.risk,paths:w.ownsPaths,locks:w.exclusiveLocks,dependsOn:w.dependsOn}))});
  for(const w of group){done.add(w.id);waiting.delete(w.id)}
 }
 return {schemaVersion:1,mode:'DRY_RUN_ONLY',dispatchEnabled:false,mergeEnabled:false,checkpointPromotionEnabled:false,repository:m.repository,baseSha:m.baseSha,waves,blocked:blocked.sort((a,b)=>a.id.localeCompare(b.id)),totals:{planned:m.workOrders.length,schedulable:waves.reduce((v,w)=>v+w.tasks.length,0),blocked:blocked.length,simulatedSequentialMinutes:eligible.reduce((v,w)=>v+w.estimatedMinutes,0),simulatedWaveMinutes:waves.reduce((v,w)=>v+w.estimatedConcurrentMinutes,0),tokenBudgetCeiling:waves.reduce((v,w)=>v+w.tokenBudgetCeiling,0)},warning:'SIMULATION ONLY. No external dispatch, verified current GitHub checks, merge or promotion. Estimates are unmeasured.'};
}
async function main(){if(!process.argv[2])throw Error('Usage: node planner.mjs <manifest.json>');console.log(JSON.stringify(planBatch(JSON.parse(await readFile(process.argv[2],'utf8'))),null,2))}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error('CONTROL_TOWER_BLOCKED:',e.message);process.exitCode=2});
