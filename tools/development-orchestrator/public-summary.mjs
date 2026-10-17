const count=(v)=>Number.isSafeInteger(v)&&v>=0?v:0;
export function publicPlanSummary(result){
 return {
  schemaVersion:1,
  mode:'DRY_RUN_ONLY',
  dispatchEnabled:false,
  mergeEnabled:false,
  checkpointPromotionEnabled:false,
  verdict:'SIMULATION_ONLY_NOT_ADMISSION',
  waves:count(result.waves?.length),
  schedulableTasks:count(result.totals?.schedulable),
  blockedTasks:count(result.totals?.blocked),
  plannedTasks:count(result.totals?.planned),
  warning:'Read-only simulation. Manifest content is untrusted and not printed.'
 };
}
export function publicScheduleSummary(result){
 return {
  schemaVersion:1,
  mode:'VIRTUAL_TIME_DRY_RUN_ONLY',
  dispatchEnabled:false,
  mergeEnabled:false,
  verdict:'SIMULATION_ONLY_NOT_ADMISSION',
  timelineEntries:count(result.timeline?.length),
  blockedTasks:count(result.blocked?.length),
  warning:'Read-only simulation. Manifest content is untrusted and not printed.'
 };
}
