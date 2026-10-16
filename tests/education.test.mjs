import test from 'node:test'
import assert from 'node:assert/strict'
import { tsModuleUrl } from './helpers/loadTs.mjs'
const registry = await import(tsModuleUrl('../../src/data/education/registry.ts'))
const planning = await import(tsModuleUrl('../../src/data/education/planning.ts'))
const { validateEducation } = await import(tsModuleUrl('../../src/data/education/validate.ts'))
const { restoreProfile, restoreNextSteps, transitionStory } = await import(tsModuleUrl('../../src/context/storage.ts'))
const { LocalStudentDataRepository: Repository } = await import(tsModuleUrl('../../src/repositories/LocalStudentDataRepository.ts'))
const { saveCurrentRun, beginStoryRun, updateEntry } = await import(tsModuleUrl('../../src/context/experience.ts'))
const { findStory } = await import(tsModuleUrl('../../src/data/stories/catalog.ts'))
const { buildShareSections, defaultShareSettings } = await import(tsModuleUrl('../../src/data/share.ts'))
const careers = ['ux-designer', 'logistics-coordinator', 'community-programme-coordinator']
const { educationSources: sources, educationProgrammes: programmes, educationPathways: pathways, careerPathwayRelationships: relationships } = registry
const validate = (s = sources, p = programmes, ps = pathways, r = relationships) => validateEducation(s,p,ps,r,careers)
const clone = value => structuredClone(value)
const asOf = new Date('2026-10-16T12:00:00Z')
test('education graph: three careers, five route types, sourced programmes and truthful mappings', () => {
  assert.deepEqual(validate(), [])
  for (const career of careers) { const paths=registry.pathwaysForCareer(career); assert.equal(paths.length,5); assert.equal(new Set(paths.map(p=>p.pathway.pathwayType)).size,5) }
  assert.equal(registry.pathwaysForCareer(careers[0]).flatMap(p=>p.programmes).length,1)
  assert.equal(registry.pathwaysForCareer(careers[1]).flatMap(p=>p.programmes).length,0)
  assert.deepEqual(registry.pathwaysForCareer('missing'),[])
  for (const source of sources) assert.ok(new URL(source.url).protocol==='https:')
})
test('publication guard rejects missing sources, duplicate IDs, false verification, mismatched years and unsupported careers', () => {
  assert.ok(validate([...sources,sources[0]]).length)
  assert.ok(validate(sources, [{...programmes[0],sourceIds:['missing']}]).length)
  const damaged=clone(programmes); damaged[0].generalEntranceRequirements.admissionYear='2026/27'
  assert.ok(validate(sources,damaged).some(e=>e.includes('year mismatch')))
  damaged[0].generalEntranceRequirements.text=null
  assert.ok(validate(sources,damaged).some(e=>e.includes('unverified')))
  assert.ok(validate(sources,programmes,pathways,[{...relationships[0],careerId:'invented'}]).length)
  assert.ok(validate(sources,[{...programmes[0],reviewBy:'2027-10-16'}]).length)
})
test('runtime verification expires at review deadline and after the actual intake, never renews itself', () => {
  const p=programmes[0]; assert.equal(registry.programmeStatus(p,asOf),'verified')
  assert.equal(registry.programmeStatus(p,new Date('2026-11-16T00:00:00Z')),'outdated')
  assert.equal(registry.programmeStatus({...p,lastVerifiedAt:'2027-08-30',reviewBy:'2027-09-29'},new Date('2027-09-01')),'outdated')
  assert.equal(registry.programmeStatus({...p,lastVerifiedAt:'2026-10-17'},asOf),'needs_review')
  assert.equal(registry.programmeStatus({...p,verificationStatus:'needs_review'},asOf),'needs_review')
  assert.equal(registry.programmeStatus({...p,reviewBy:'invalid'},asOf),'needs_review')
  assert.equal(registry.programmeStatus(p,new Date('2026-10-15T16:01:00Z')),'verified')
  assert.equal(registry.programmeStatus(p,new Date('2026-11-15T15:59:59Z')),'verified')
  assert.equal(registry.programmeStatus(p,new Date('2026-11-15T16:00:00Z')),'outdated')
  assert.equal(registry.programmeStatus({...p,reviewBy:'2026-02-30'},asOf),'needs_review')
})
test('missing or unverified requirements cannot inherit an overall verified label', () => {
  for (const patch of [{text:null},{verificationStatus:'needs_review'},{sourceIds:['missing']},{sourceIds:['vtc']},{admissionYear:'2026/27'}]) {
    const p=clone(programmes[0]); Object.assign(p.generalEntranceRequirements,patch)
    assert.equal(registry.programmeStatus(p,asOf),'needs_review')
  }
})
test('academic answers optional, whitelisted, unique and limited to three; no marks or school names retained', () => {
  assert.equal(restoreProfile({}).academicStartingPoint,undefined)
  assert.equal(planning.restoreAcademic(null),undefined)
  const academic=planning.restoreAcademic({schoolLevel:'S5',supportSubjects:['數學','英文','數學','科學','中文','made-up'],helpWith:planning.helpOptions[2],marks:1,school:'PRIVATE'})
  assert.deepEqual(academic.supportSubjects,['數學','英文','科學'])
  assert.equal(academic.schoolLevel,'S5'); assert.equal(academic.marks,undefined);assert.equal(academic.school,undefined)
  assert.equal(planning.restoreAcademic({schoolLevel:'__proto__'}).schoolLevel,undefined)
})
test('pathway actions normalize without losing provenance/status and remain compatible with legacy completion controls', () => {
  let step=planning.createPlanStep(careers[0],'hk-bachelor','requirements',programmes[0].officialUrl)
  assert.deepEqual(restoreNextSteps([step]),[{...step,targetDate:undefined,completedAt:undefined}])
  step=planning.changeStepStatus(step,'in_progress');assert.equal(restoreNextSteps([step])[0].status,'in_progress')
  step=planning.changeStepStatus(step,'completed');assert.ok(step.completedAt);assert.equal(step.completed,true)
  step=planning.changeStepStatus(step,'not_started');assert.equal(step.completedAt,undefined)
  assert.equal(restoreNextSteps([{...step,completed:true}])[0].status,'completed')
  assert.equal(restoreNextSteps([{...step,officialSourceUrl:'javascript:alert(1)'}])[0].officialSourceUrl,undefined)
  assert.equal(planning.createPlanStep('invented','hk-bachelor','requirements'),undefined)
  assert.equal(restoreNextSteps([step,step]).length,1)
  assert.equal(restoreNextSteps([{id:'legacy',title:'Old',completed:false}])[0].status,undefined)
})
const completed = (data, storyId) => {
  let experience=beginStoryRun(data.experience,storyId), storyProgress=experience.storyProgress
  for (const d of findStory(storyId).decisions) for (const a of [{type:'select',optionId:'a'},{type:'confirm'},{type:'reveal'},{type:'next'}]) storyProgress=transitionStory(storyProgress,{...a,decisionId:d.id})
  return {...data,experience:saveCurrentRun({...experience,storyProgress})}
}
test('repository persists optional academic data and per-experience plan across refresh; legacy schema remains 3', () => {
  const map=new Map(); const store={get length(){return map.size},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}
  let repo=new Repository(()=>store),data=repo.load().data
  data=completed(data,'ux-community-signup');data=completed(data,'logistics-delivery-dilemma')
  const [logistics,ux]=data.experience.passport
  const step=planning.createPlanStep(careers[0],'hk-higher_diploma','compare')
  data={...data,profile:{...data.profile,academicStartingPoint:{supportSubjects:['數學']}},experience:updateEntry(data.experience,ux.id,{nextSteps:[step]})}
  assert.equal(repo.save(data).ok,true)
  repo=new Repository(()=>store);const loaded=repo.load();assert.equal(loaded.ok,true);assert.equal(loaded.notice,'')
  assert.equal(loaded.data.schemaVersion,3);assert.deepEqual(loaded.data.profile.academicStartingPoint.supportSubjects,['數學'])
  assert.equal(loaded.data.experience.passport.find(e=>e.id===ux.id).nextSteps[0].relatedPathwayId,'hk-higher_diploma')
  assert.equal(loaded.data.experience.passport.find(e=>e.id===logistics.id).nextSteps.length,0)
  const profile={...loaded.data.profile};delete profile.academicStartingPoint
  store.setItem('carie_student_data_v3_recovery_test','academic private copy')
  assert.equal(repo.save({...loaded.data,profile,pendingCleanup:true}).ok,true)
  assert.equal(store.getItem('carie_student_data_v3_recovery_test'),null)
  assert.equal(new Repository(()=>store).load().data.profile.academicStartingPoint,undefined)
})
test('mentor summary has explicit independent selections; academic support never drives admissions judgments', () => {
  const entry={career: 'UX Designer',careerId:careers[0],storyTitle:'Test Story',behaviourEvidence:[{behaviour:'Evidence',evidence:'EVIDENCE_PRIVATE'}],reflection:{additionalNotes:'REFLECTION_PRIVATE'},nextSteps:[planning.createPlanStep(careers[0],'hk-bachelor','requirements')]}
  const academic={schoolLevel:'S5',supportSubjects:['數學'],helpWith:'改善某一科的學習方法'}
  assert.equal(planning.mentorSummary(entry,academic,planning.defaultMentorSelection),'')
  for(let mask=0;mask<32;mask++) {
    const keys=['experience','evidence','plan','academic','reflection'],selection=Object.fromEntries(keys.map((k,i)=>[k,!!(mask&(1<<i))]))
    const text=planning.mentorSummary(entry,academic,selection)
    assert.equal(text.includes('Test Story'),selection.experience)
    assert.equal(text.includes('EVIDENCE_PRIVATE'),selection.evidence)
    assert.equal(text.includes('學士學位'),selection.plan)
    assert.equal(text.includes('數學'),selection.academic)
    assert.equal(text.includes('REFLECTION_PRIVATE'),selection.reflection)
    assert.doesNotMatch(text,/不適合|錄取概率|guaranteed offer|ineligible|%/i)
  }
  const share=buildShareSections({...entry,dateCompleted:'2026-10-16'},'Alex',defaultShareSettings)
  assert.ok(!JSON.stringify(share).includes('數學'))
})
