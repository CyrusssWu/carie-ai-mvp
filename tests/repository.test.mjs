import test from 'node:test'
import assert from 'node:assert/strict'
import { tsModuleUrl } from './helpers/loadTs.mjs'
const { LocalStudentDataRepository: Repository, STUDENT_DATA_KEY: KEY } = await import(tsModuleUrl('../../src/repositories/LocalStudentDataRepository.ts'))
const { saveCurrentRun, beginStoryRun, updateRunDraft } = await import(tsModuleUrl('../../src/context/experience.ts'))
const { transitionStory, restoreNextSteps, restorePassport, restoreStory } = await import(tsModuleUrl('../../src/context/storage.ts'))
const { uxStory } = await import(tsModuleUrl('../../src/data/careers.ts'))
const { findStory, storyCatalog } = await import(tsModuleUrl('../../src/data/stories/catalog.ts'))
const memory = () => {
  const map = new Map()
  return { map, failWrite:false, failRemove:false,
    get length() { return map.size }, key: index => [...map.keys()][index] ?? null,
    getItem: key => map.get(key) ?? null,
    setItem(key,value) { if(this.failWrite) throw Error('quota'); map.set(key,value) },
    removeItem(key) { if(this.failRemove) throw Error('denied'); map.delete(key) },
  }
}
const finish = data => {
  let experience = data.experience
  let storyProgress = experience.storyProgress
  for (const decision of uxStory.decisions) for (const action of [{type:'select',optionId:'b'},{type:'confirm'},{type:'reveal'},{type:'next'}]) storyProgress = transitionStory(storyProgress,{...action,decisionId:decision.id})
  experience = updateRunDraft({...experience,storyProgress},{reflection:{additionalNotes:'PRIVATE_TEST_NOTE'},nextSteps:[{id:'action',title:'測試行動',completed:false}]})
  return {...data,experience:saveCurrentRun(experience)}
}
const fixture = () => { const store=memory(); const repo=new Repository(()=>store); const data=repo.load().data; return {store,repo,data} }

test('repository persists one validated document with stable profile/run IDs and repeat save identity', () => {
  const {store,repo,data}=fixture()
  const saved=repo.save(finish(data))
  assert.equal(saved.ok,true)
  assert.equal(repo.save({...saved.data,experience:saveCurrentRun(saved.data.experience)}).data.experience.passport.length,1)
  const reloaded=new Repository(()=>store).load()
  assert.equal(reloaded.ok,true); assert.equal(reloaded.notice,'')
  assert.equal(reloaded.data.localProfileId,data.localProfileId)
  assert.equal(reloaded.data.experience.passport[0].storyRunId,data.experience.storyProgress.storyRunId)
  assert.equal(reloaded.data.experience.passport[0].reflection.additionalNotes,'PRIVATE_TEST_NOTE')
})
test('JSON export matches persisted content, is explicit and excludes unsaved changes', () => {
  const {store,repo,data}=fixture(); const saved=repo.save(finish(data))
  const exported=repo.exportData(); assert.equal(exported.ok,true)
  const json=JSON.parse(exported.json)
  assert.deepEqual(json.experience,JSON.parse(store.getItem(KEY)).experience)
  assert.equal(json.schemaVersion,3); assert.ok(Number.isFinite(Date.parse(json.exportedAt)))
  store.failWrite=true
  assert.equal(repo.save({...saved.data,profile:{...saved.data.profile,nickname:'UNSAVED'}}).ok,false)
  assert.equal(JSON.parse(repo.exportData().json).profile.nickname,'')
  assert.equal(json.experience.passport[0].decisions.length,5)
})
test('deleting an older entry preserves the other run, reflection and next steps and removes old copies', () => {
  const {store,repo,data}=fixture(); const first=repo.save(finish(data)).data
  const second=repo.save(finish({...first,experience:beginStoryRun(first.experience)})).data
  store.setItem('carie_passport_v1',JSON.stringify(first.experience.passport))
  store.setItem(KEY+'_recovery_previous','private old copy'); store.setItem('unrelated','keep')
  const removed=repo.deleteEntry(second,second.experience.passport[1].id)
  assert.equal(removed.ok,true); assert.deepEqual(removed.data.experience.passport,[second.experience.passport[0]])
  assert.deepEqual(removed.data.experience.reflection,second.experience.reflection)
  assert.equal(store.getItem('carie_passport_v1'),null); assert.equal(store.getItem(KEY+'_recovery_previous'),null)
  assert.equal(store.getItem('unrelated'),'keep')
  assert.equal(new Repository(()=>store).load().data.experience.passport.length,1)
})
test('deleting the active saved run clears its draft so saving or refresh cannot resurrect it', () => {
  const {store,repo,data}=fixture(); const saved=repo.save(finish(data)).data
  const removed=repo.deleteEntry(saved,saved.experience.passport[0].id)
  assert.equal(removed.ok,true); assert.deepEqual(removed.data.experience.reflection,{})
  assert.deepEqual(removed.data.experience.nextSteps,[])
  assert.notEqual(removed.data.experience.storyProgress.storyRunId,saved.experience.storyProgress.storyRunId)
  assert.equal(saveCurrentRun(new Repository(()=>store).load().data.experience).passport.length,0)
})
test('clear all removes private profile, drafts, passport, legacy and recovery data without touching unrelated keys', () => {
  const {store,repo,data}=fixture(); repo.save({...finish(data),profile:{...data.profile,nickname:'Synthetic'}})
  store.setItem('carie_reflection_v1','private');store.setItem('carie_profile_v1_recovery_old','private');store.setItem('unrelated','keep')
  const cleared=repo.clearAll();assert.equal(cleared.ok,true)
  assert.equal(cleared.data.profile.nickname,'');assert.deepEqual(cleared.data.experience.passport,[])
  assert.deepEqual([...store.map.keys()].sort(),[KEY,'unrelated'].sort())
  assert.equal(store.getItem(KEY).includes('PRIVATE_TEST_NOTE'),false)
  const reload=new Repository(()=>store).load();assert.equal(reload.ok,true);assert.deepEqual(reload.data.experience.reflection,{})
})
test('quota failure preserves saved data and failed destructive operations remove nothing', () => {
  const {store,repo,data}=fixture();const saved=repo.save(finish(data)).data
  const original=store.getItem(KEY); store.setItem('carie_legacy','keep');store.failWrite=true
  assert.equal(repo.deleteEntry(saved,saved.experience.passport[0].id).ok,false)
  assert.equal(repo.clearAll().ok,false)
  assert.equal(store.getItem(KEY),original);assert.equal(store.getItem('carie_legacy'),'keep')
  store.failWrite=false;assert.equal(repo.save(saved).ok,true)
})
test('partial deletion keeps a cleanup marker and reports failure until all old copies are removed', () => {
  const {store,repo,data}=fixture(); const saved=repo.save(finish(data)).data
  store.setItem('carie_old','private');store.failRemove=true
  const partial=repo.deleteEntry(saved,saved.experience.passport[0].id)
  assert.equal(partial.ok,false);assert.equal(partial.data.pendingCleanup,true)
  assert.deepEqual(partial.data.experience.passport,[]);assert.equal(store.getItem('carie_old'),'private')
  store.failRemove=false
  const retry=repo.save(partial.data);assert.equal(retry.ok,true);assert.equal(retry.data.pendingCleanup,undefined)
  assert.equal(store.getItem('carie_old'),null)
})
test('stale tab cannot save deleted data or clear newer edits', () => {
  const {store,repo,data}=fixture();repo.save(finish(data))
  const other=new Repository(()=>store);const stale=other.load().data
  assert.equal(repo.clearAll().ok,true)
  assert.equal(other.save(stale).conflict,true);assert.equal(other.clearAll().conflict,true)
  assert.equal(JSON.parse(store.getItem(KEY)).experience.passport.length,0)
  assert.equal(other.load().ok,true)
  assert.equal(other.save(stale).conflict,true,'Loading latest must not allow an older caller snapshot to overwrite it')
})
test('v2 migration preserves completed runs and old reflections, shows a notice and retains original keys', () => {
  const {store,data}=fixture();store.removeItem(KEY)
  const old=finish(data).experience;store.setItem('carie_experiences_v2',JSON.stringify(old));store.setItem('carie_profile_v1',JSON.stringify({...data.profile,nickname:'Alex'}))
  const loaded=new Repository(()=>store).load()
  assert.equal(loaded.ok,true);assert.ok(loaded.notice)
  assert.equal(loaded.data.experience.passport[0].id,old.passport[0].id)
  assert.equal(loaded.data.profile.nickname,'Alex');assert.ok(store.getItem('carie_experiences_v2'))
})
test('corrupt/partial documents preserve the original in recovery before normalizing', () => {
  const store=memory();store.setItem(KEY,'{broken')
  const repo=new Repository(()=>store);const recovered=repo.load()
  assert.equal(recovered.ok,true);assert.ok(recovered.notice)
  assert.ok([...store.map.entries()].some(([k,v])=>k.startsWith(KEY+'_recovery_')&&v==='{broken'))
  const raw={...recovered.data,experience:{...recovered.data.experience,passport:[null],reflection:{additionalNotes:55}}}
  store.setItem(KEY,JSON.stringify(raw));const normalized=new Repository(()=>store).load()
  assert.equal(normalized.ok,true);assert.deepEqual(normalized.data.experience.passport,[]);assert.ok(normalized.notice)
})
test('backup failure and future schema do not overwrite source; confirmed clear can replace future schema', () => {
  const store=memory();store.setItem(KEY,'{broken');store.failWrite=true
  const repo=new Repository(()=>store);assert.equal(repo.load().ok,false);assert.equal(store.getItem(KEY),'{broken')
  store.failWrite=false;store.setItem(KEY,JSON.stringify({schemaVersion:99,private:'future'}))
  const future=new Repository(()=>store);const loaded=future.load();assert.equal(loaded.ok,false)
  assert.equal(future.save(loaded.data).ok,false);assert.ok(store.getItem(KEY).includes('future'))
  assert.equal(future.clearAll().ok,true)
})
test('invalid saves are rejected, denied reads recover safely, inherited story IDs cannot crash restoration', () => {
  const {store,repo,data}=fixture();const original=store.getItem(KEY)
  assert.equal(repo.save({...data,experience:{...data.experience,passport:[null]}}).ok,false);assert.equal(store.getItem(KEY),original)
  assert.equal(new Repository(()=>{throw Error('denied')}).load().ok,false)
  assert.equal(findStory('__proto__'),undefined)
  store.setItem(KEY,JSON.stringify({...data,experience:{...data.experience,storyProgress:{storyId:'__proto__'}}}))
  assert.doesNotThrow(()=>new Repository(()=>store).load())
})

test('timestamps normalize to ISO UTC and impossible target dates are rejected', () => {
  const {data}=fixture();const entry=finish(data).experience.passport[0]
  assert.equal(restorePassport([{...entry,dateCompleted:'2026-10-15T17:00:00+08:00'}])[0].dateCompleted,'2026-10-15T09:00:00.000Z')
  const steps=restoreNextSteps([{id:'test',title:'Action',completed:true,completedAt:'2026-10-15T17:00:00+08:00',targetDate:'2026-02-30'}])
  assert.equal(steps[0].completedAt,'2026-10-15T09:00:00.000Z');assert.equal(steps[0].targetDate,undefined)
})

test('domain helpers use the registered story ID and decision count without a second data model', () => {
  const story={...uxStory,id:'test-only-story',careerId:'test-only-career',decisions:uxStory.decisions.slice(0,2)}
  storyCatalog[story.id]=story
  try {
    const {data}=fixture();let experience=beginStoryRun(data.experience,story.id)
    for(const decision of story.decisions) for(const action of [{type:'select',optionId:'c'},{type:'confirm'},{type:'reveal'},{type:'next'}]) experience={...experience,storyProgress:transitionStory(experience.storyProgress,{...action,decisionId:decision.id})}
    assert.equal(restoreStory(experience.storyProgress).completed,true)
    const entry=saveCurrentRun(experience).passport[0]
    assert.equal(entry.storyId,story.id);assert.equal(entry.careerId,story.careerId)
    assert.equal(entry.decisions.length,2);assert.equal(restorePassport([entry])[0].legacyIncomplete,undefined)
  } finally { delete storyCatalog[story.id] }
})
