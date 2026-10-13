/**
 * Control Tower R0: event-driven virtual-time scheduler.
 * Read-only simulation. Manifest admission claims are NOT GitHub-verified.
 * Refill a free worker slot as soon as a dependency-safe task can start.
 */
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {planBatch} from './planner.mjs';
function guard(ok,msg){if(!ok)throw Error(msg)}
function overlaps(a,b){const sa=a.split('/'),sb=b.split('/');return (sa.length<=sb.length&&sa.every((x,i)=>x===sb[i]))||(sb.length<=sa.length&&sb.every((x,i)=>x===sa[i]))}
function collision(a,b){return a.risk==='HIGH_ASSURANCE'||b.risk==='HIGH_ASSURANCE'||a.exclusiveLocks.some(x=>b.exclusiveLocks.includes(x))||a.ownsPaths.some(x=>b.ownsPaths.some(y=>overlaps(x,y)))}
export function simulateContinuousDispatch(manifest){
 const baseline=planBatch(manifest); // deterministic full safety preflight
 const allowed=new Set(baseline.waves.flatMap(w=>w.tasks.map(t=>t.id)));
 const tasks=new Map(manifest.workOrders.filter(x=>allowed.has(x.id)).map(x=>[x.id,x]));
 const all=[...tasks.values()];
 // R0 budgets in planBatch are *per wave*. Real dispatcher must also enforce per-prompt absolute caps.
 {
  guard(Number.isSafeInteger(manifest.maxTotalTokenBudget)&&manifest.maxTotalTokenBudget>0,'invalid maxTotalTokenBudget');
  guard(all.reduce((v,t)=>v+t.tokenBudget,0)<=manifest.maxTotalTokenBudget,'TOTAL_TOKEN_BUDGET_EXCEEDED; adjust tasks or admission');
 }
 const completed=new Set((manifest.completedWorkOrders||[]).map(x=>x.id));
 const waiting=new Set(tasks.keys()),running=[],entries=[];
 let now=0,peakParallel=0;
 const children=new Map([...tasks.keys()].map(id=>[id,[]]));
 for(const t of all)for(const d of t.dependsOn)if(children.has(d))children.get(d).push(t.id);
 const tailMemo=new Map();
 function tail(id){if(tailMemo.has(id))return tailMemo.get(id);const v=tasks.get(id).estimatedMinutes+Math.max(0,...children.get(id).map(tail));tailMemo.set(id,v);return v}
 while(waiting.size||running.length){
  const options=[...waiting].map(x=>tasks.get(x)).filter(t=>t.dependsOn.every(d=>completed.has(d)));
  options.sort((a,b)=>a.priority-b.priority||tail(b.id)-tail(a.id)||a.id.localeCompare(b.id));
  let reserved=running.reduce((v,x)=>v+x.task.tokenBudget,0);
  for(const task of options){
   if(running.length>=manifest.maxParallel)break;
   if(reserved+task.tokenBudget>manifest.maxBatchTokens)continue;
   if(running.some(x=>collision(x.task,task)))continue;
   entries.push({id:task.id,issue:task.issue,priority:task.priority,risk:task.risk,startMinute:now,finishMinute:now+task.estimatedMinutes,estimatedMinutes:task.estimatedMinutes,tokenBudgetCeiling:task.tokenBudget,dependsOn:task.dependsOn,ownsPaths:task.ownsPaths});
   running.push({task,end:now+task.estimatedMinutes});
   waiting.delete(task.id);reserved+=task.tokenBudget;
  }
  peakParallel=Math.max(peakParallel,running.length);
  guard(running.length>0,'NO_READY_TASK: invalid wait graph or budget');
  now=Math.min(...running.map(x=>x.end));
  for(let i=running.length-1;i>=0;i--)if(running[i].end===now){
   completed.add(running[i].task.id);running.splice(i,1);
  }
 }
 entries.sort((a,b)=>a.startMinute-b.startMinute||a.id.localeCompare(b.id));
 const total=all.reduce((n,t)=>n+t.estimatedMinutes,0);
 return {schemaVersion:1,mode:'VIRTUAL_TIME_DRY_RUN_ONLY',dispatchEnabled:false,verifiedAdmission:false,mergeEnabled:false,baseSha:manifest.baseSha,comparison:{
   estimatedSerialMinutes:total,estimatedSynchronizedWaveMinutes:baseline.totals.simulatedWaveMinutes,
   estimatedContinuousMinutes:now,estimatedSlotIdleMinutes:Math.max(0,now*manifest.maxParallel-total),
   maxParallelConfigured:manifest.maxParallel,peakParallelProjected:peakParallel,
   estimatedWaveVsContinuousMinutes:baseline.totals.simulatedWaveMinutes-now,
   estimatedSerialVsContinuousMinutes:total-now
  },timeline:entries,blocked:baseline.blocked,limitations:[
   'All durations/tokens are unverified user estimates; not real Codex performance.',
   'Tasks simulated as indivisible; no worktree, git, token accounting, security or CI integration exists.',
   'Risk, file paths and Context Lock are from UNTRUSTED manifest; real GitHub source verifier is required before execution.',
   'HIGH_ASSURANCE isolation and exclusive path/semantic locks can reduce parallel speed.',
   'This planner does not waive ANY approved Work Order test or mandatory CI/merge gate.'
  ]};
}
async function main(){if(!process.argv[2])throw Error('Usage: node continuous-scheduler.mjs <manifest.json>');console.log(JSON.stringify(simulateContinuousDispatch(JSON.parse(await readFile(process.argv[2],'utf8'))),null,2))}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error('CONTROL_TOWER_BLOCKED:',e.message);process.exitCode=2});
