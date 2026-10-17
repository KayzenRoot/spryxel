import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
const run=promisify(execFile);
const MARKER='CONFIDENTIAL-MARKER-7f3a';
const FAKE_TOKEN='ghp_FAKE_0000000000000000000000000000000000';
const hostile={
 schemaVersion:1,
 repository:`KayzenRoot/spryxel\n${MARKER}\x1b[31mRED\x1b[0m`,
 baseSha:'a'.repeat(40),
 maxParallel:2,
 maxBatchTokens:5000,
 completedWorkOrders:[],
 token:FAKE_TOKEN,
 password:`${MARKER}-pw`,
 workOrders:[{id:`${MARKER}\r\n../../etc`,issue:1,status:'ADMITTED_FOR_EXECUTION',risk:'STANDARD',baseSha:'a'.repeat(40),contextLock:'FRESH',dependsOn:[],ownsPaths:['apps/web/x'],exclusiveLocks:[],priority:1,estimatedMinutes:10,tokenBudget:100,secret:FAKE_TOKEN}]
};
const file=join('tools','development-orchestrator','.hostile-manifest.json');
const assertClean=(text)=>{
 assert.ok(!text.includes(MARKER),'marker leaked');
 assert.ok(!text.includes(FAKE_TOKEN),'token leaked');
 assert.ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\x1b]/.test(text),'control characters leaked');
};
for(const cli of ['planner.mjs','continuous-scheduler.mjs']){
 test(`${cli} rejects hostile manifest without echoing content`,async()=>{
  await writeFile(file,JSON.stringify(hostile));
  try{
   const out=await run(process.execPath,[join('tools','development-orchestrator',cli),file]).catch(e=>e);
   const text=`${out.stdout??''}${out.stderr??''}`;
   assertClean(text);
   assert.equal(out.code,2);
   assert.match(out.stderr,/CONTROL_TOWER_BLOCKED: manifest unavailable or invalid/);
  }finally{await rm(file,{force:true})}
 });
 test(`${cli} rejects a path outside the repository with constant message`,async()=>{
  const out=await run(process.execPath,[join('tools','development-orchestrator',cli),'../../outside.json']).catch(e=>e);
  assert.notEqual(out.code,0);
  assertClean(`${out.stdout??''}${out.stderr??''}`);
  assert.match(out.stderr,/CONTROL_TOWER_BLOCKED: manifest unavailable or invalid/);
 });
}
