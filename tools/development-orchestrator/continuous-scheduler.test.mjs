import {test} from 'node:test';
import assert from 'node:assert/strict';
import {simulateContinuousDispatch} from './continuous-scheduler.mjs';
const sha='a'.repeat(40);
const t=(id,estimatedMinutes=20,opts={})=>({id,issue:200,status:'ADMITTED_FOR_EXECUTION',risk:'STANDARD',baseSha:sha,contextLock:'FRESH',dependsOn:[],ownsPaths:['test/'+id],exclusiveLocks:[],priority:2,estimatedMinutes,tokenBudget:1000,...opts});
const manifest=arr=>({schemaVersion:1,repository:'KayzenRoot/spryxel',baseSha:sha,maxParallel:2,maxBatchTokens:4000,maxTotalTokenBudget:10000,completedWorkOrders:[],workOrders:arr});
test('event-driven refill avoids synchronized wave barrier',()=>{
 const m=manifest([t('a',100),t('b',10),t('c',80),t('d',80,{dependsOn:['b']})]);
 const x=simulateContinuousDispatch(m);
 assert.equal(x.comparison.estimatedSynchronizedWaveMinutes,180);
 assert.equal(x.comparison.estimatedContinuousMinutes,170);
 assert.equal(x.timeline.find(y=>y.id==='c').startMinute,10);
 assert.equal(x.dispatchEnabled,false);
});
test('dependent work starts only after predecessor finishes',()=>{
 const x=simulateContinuousDispatch(manifest([t('a',40),t('b',25,{dependsOn:['a']})]));
 assert.equal(x.timeline.find(y=>y.id==='b').startMinute,40);
});
test('shared owned subtree prevents overlap',()=>{
 const x=simulateContinuousDispatch(manifest([t('a',100,{ownsPaths:['apps/web']}),t('b',10,{ownsPaths:['apps/web/page']})]));
 assert.equal(x.comparison.estimatedContinuousMinutes,110);
 assert.notEqual(x.timeline[0].startMinute,x.timeline[1].startMinute);
});
test('exclusive semantic lock prevents overlap',()=>{
 const x=simulateContinuousDispatch(manifest([t('a',30,{exclusiveLocks:['CONTRACT']}),t('b',20,{exclusiveLocks:['CONTRACT']})]));
 assert.equal(x.comparison.estimatedContinuousMinutes,50);
});
test('HIGH_ASSURANCE is isolated from all other tasks',()=>{
 const x=simulateContinuousDispatch(manifest([t('a',30,{risk:'HIGH_ASSURANCE',exclusiveLocks:['HIGH_ASSURANCE']}),t('b',20)]));
 assert.equal(x.comparison.estimatedContinuousMinutes,50);
});
test('total cross-wave token budget stops runaway batches',()=>{
 const m=manifest([t('a'),t('b'),t('c')]);m.maxTotalTokenBudget=2000;
 assert.throws(()=>simulateContinuousDispatch(m),/TOTAL_TOKEN_BUDGET_EXCEEDED/);
});
test('valid total prompt token budget allows bounded simulation',()=>{
 const m=manifest([t('a'),t('b')]);m.maxTotalTokenBudget=2000;
 assert.equal(simulateContinuousDispatch(m).comparison.estimatedContinuousMinutes,20);
});
test('unknown manifest approval cannot bypass R0 status gate',()=>{
 const x=simulateContinuousDispatch(manifest([t('a',20,{status:'PLANNING'}),t('b')]));
 assert.deepEqual(x.timeline.map(y=>y.id),['b']);assert.equal(x.blocked.length,1);
});
test('base SHA/context freshness required',()=>{
 const x=simulateContinuousDispatch(manifest([t('a',20,{baseSha:'b'.repeat(40)}),t('b',20,{contextLock:'MISSING'})]));
 assert.equal(x.timeline.length,0);assert.equal(x.blocked.length,2);
});
test('same input yields deterministic timeline',()=>{
 const m=manifest([t('z',50),t('a',30),t('b',60)]);assert.deepEqual(simulateContinuousDispatch(m),simulateContinuousDispatch(m));
});
