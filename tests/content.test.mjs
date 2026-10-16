import test from 'node:test'
import assert from 'node:assert/strict'
import { tsModuleUrl } from './helpers/loadTs.mjs'
const registry = await import(tsModuleUrl('../../src/data/stories/catalog.ts'))
const { validateContent } = await import(tsModuleUrl('../../src/data/stories/validate.ts'))
const { createStoryRun, restoreStory, transitionStory, restorePassport } = await import(tsModuleUrl('../../src/context/storage.ts'))
const { activateStory, beginStoryRun, restoreExperience, saveCurrentRun, updateEntry } = await import(tsModuleUrl('../../src/context/experience.ts'))
const { getStoryRecords, getIncomingHandoff } = await import(tsModuleUrl('../../src/data/stories/storyRecords.ts'))
const { LocalStudentDataRepository: Repository, STUDENT_DATA_KEY } = await import(tsModuleUrl('../../src/repositories/LocalStudentDataRepository.ts'))
const stories = Object.values(registry.storyCatalog)
const roundTrip = s => restoreExperience(JSON.parse(JSON.stringify(s)))
function complete(state, path = 0) {
  for (const [i,d] of registry.storyForRun(state.storyProgress).decisions.entries()) {
    for (const action of [{type:'select',optionId:d.options[Math.floor(path / 3 ** i) % 3].id},{type:'confirm'},{type:'reveal'},{type:'next'}]) state={...state,storyProgress:transitionStory(state.storyProgress,{...action,decisionId:d.id})}
  }
  return state
}

test('registry exposes three playable careers, five decisions each, and an explicit coming-soon career', () => {
  assert.equal(stories.length,3)
  assert.deepEqual(validateContent(registry.allCareers(),stories),[])
  stories.forEach(s => {assert.equal(s.decisions.length,5);assert.equal(registry.findStory(s.id,s.version),s);assert.equal(registry.storiesForCareer(s.careerId)[0],s);assert.equal(registry.careerForStory(s.id).id,s.careerId);assert.ok(registry.canStartStory(s.id))})
  assert.equal(registry.canStartStory('unknown'),false);assert.equal(registry.findStory('__proto__'),undefined)
  assert.deepEqual(registry.storiesForCareer('service-designer'),[])
})

test('validation rejects missing fields, duplicate IDs, invalid vocabulary, evidence, routes and scoring', () => {
  const mutations=[
    (c,s)=>c.push(c[0]), (c,s)=>s.push(s[0]), (c,s)=>s[0].version='',
    (c,s)=>s[0].decisions.pop(), (c,s)=>s[0].decisions[0].options.pop(),
    (c,s)=>s[0].decisions[1].id='d1', (c,s)=>s[0].decisions[0].options[1].id='a',
    (c,s)=>s[0].decisions[0].options[0].consequence='',
    (c,s)=>s[0].decisions[0].options[0].evidence[0].sourceOptionId='b',
    (c,s)=>c[0].storyIds=['not-a-story'], (c,s)=>s[0].decisions[0].vocabulary[0].id='unknown',
    (c,s)=>s[0].decisions[0].options[0].handoff.nextDecisionId='missing',
    (c,s)=>s[0].decisions[0].options[0].hiddenPoints=5,
    (c,s)=>s[0].decisions[0].options[0].label='Career Fit 85%',
    (c,s)=>s[0].id='../invalid',
  ]
  for(const mutate of mutations){const c=structuredClone(registry.allCareers()),s=structuredClone(stories);mutate(c,s);assert.ok(validateContent(c,s).length,mutate.toString())}
})

for(const story of stories) test(`${story.career}: all 243 paths change/confirm/reveal/refresh, accurate recap and five source-linked evidence records`,()=>{
  for(let path=0;path<243;path++){
    let progress=createStoryRun(story.id)
    for(const [i,d] of story.decisions.entries()){
      const selected=d.options[Math.floor(path / 3 ** i)%3]
      const send=(type,optionId)=>{progress=transitionStory(progress,{type,decisionId:d.id,optionId})}
      send('select',d.options[(d.options.indexOf(selected)+1)%3].id);send('confirm');send('change');send('select',selected.id);send('confirm')
      progress=restoreStory(JSON.parse(JSON.stringify(progress)));assert.equal(progress.stage,'confirm');assert.equal(progress.evidence.length,i)
      send('reveal');send('reveal');progress=restoreStory(progress)
      assert.equal(progress.evidence.length,i+1);assert.equal(progress.choices[d.id],selected.id)
      assert.ok(progress.evidence.every(e=>e.sourceOptionId===progress.choices[e.sourceDecisionId]))
      if(i<4)assert.equal(getIncomingHandoff(story,i+1,progress.choices),selected.handoff.narrative)
      send('next');progress=restoreStory(progress)
    }
    assert.equal(progress.completed,true)
    const records=getStoryRecords(story,progress.choices);assert.equal(records.length,5)
    records.forEach(r=>assert.equal(r.option.id,progress.choices[r.decision.id]))
    assert.equal(getIncomingHandoff(story,1,{}),undefined) // UI always renders current workplace context as fallback.
    const saved=saveCurrentRun({...restoreExperience(null),storyProgress:progress}).passport[0]
    assert.deepEqual(saved.decisions.map(d=>d.selectedLabel),records.map(r=>r.option.label))
    assert.equal(saved.storyVersion,story.version)
  }
})

test('switching careers retains independent confirmation drafts, reflection and actions across refresh',()=>{
  let state=restoreExperience(null)
  const ids=[]
  for(const story of stories){state=activateStory(state,story.id);ids.push(state.storyProgress.storyRunId);state={...state,reflection:{additionalNotes:story.id},nextSteps:[{id:story.id,title:'下一步',completed:false}],storyProgress:transitionStory(transitionStory(state.storyProgress,{type:'select',decisionId:'d1',optionId:'b'}),{type:'confirm',decisionId:'d1'})};state=roundTrip(state)}
  for(const [i,story] of stories.entries()){state=roundTrip(activateStory(state,story.id));assert.equal(state.storyProgress.storyRunId,ids[i]);assert.equal(state.storyProgress.stage,'confirm');assert.equal(state.storyProgress.selectedOptionId,'b');assert.equal(state.reflection.additionalNotes,story.id);assert.equal(state.nextSteps[0].id,story.id)}
})

test('three careers coexist, replay creates a new run, repeat save is idempotent and suspended entry edits stay synchronized',()=>{
  let state=restoreExperience(null)
  for(const story of stories){state=complete(beginStoryRun(state,story.id));state=roundTrip(saveCurrentRun(saveCurrentRun(state)))}
  assert.equal(state.passport.length,3);assert.equal(new Set(state.passport.map(e=>e.careerId)).size,3)
  const ux=state.passport.find(e=>e.careerId==='ux-designer')
  state=updateEntry(state,ux.id,{reflection:{additionalNotes:'edited while suspended'}})
  state=activateStory(state,ux.storyId);assert.equal(state.reflection.additionalNotes,'edited while suspended')
  state=saveCurrentRun(complete(beginStoryRun(state,ux.storyId),242));assert.equal(state.passport.length,4)
  assert.notEqual(state.passport[0].storyRunId,ux.storyRunId)
  assert.deepEqual(state.passport.find(e=>e.id===ux.id).decisions,ux.decisions)
})

test('old UX snapshots survive content updates; active runs stay pinned to their published version',()=>{
  const ux=stories[0];let state=saveCurrentRun(complete(beginStoryRun(restoreExperience(null),ux.id)))
  const old=structuredClone(state.passport[0]);delete old.storyVersion
  registry.storyCatalog[ux.id]={...ux,version:'2.0.0',title:'Future wording'}
  try{assert.equal(registry.storyForRun(state.storyProgress).title,ux.title);assert.equal(createStoryRun(ux.id).storyVersion,'2.0.0');assert.equal(restoreStory(state.storyProgress).storyVersion,'1.0.0');assert.deepEqual(restorePassport([old])[0].decisions,old.decisions);assert.equal(saveCurrentRun(state).passport[0].storyTitle,ux.title)}finally{registry.storyCatalog[ux.id]=ux}
})

test('unavailable published version blocks overwriting data; deleting suspended saved run cannot resurrect it',()=>{
  const map=new Map();const port={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),key:i=>[...map.keys()][i]??null,get length(){return map.size}}
  let repo=new Repository(()=>port);let data=repo.load().data
  let experience=data.experience
  for(const s of stories)experience=saveCurrentRun(complete(beginStoryRun(experience,s.id)))
  data=repo.save({...data,experience}).data;const removed=data.experience.passport.at(-1)
  data=repo.deleteEntry(data,removed.id).data
  assert.ok(!data.experience.suspendedRuns.some(r=>r.storyProgress.storyRunId===removed.storyRunId))
  assert.equal(activateStory(data.experience,removed.storyId).storyProgress.completed,false)
  data.experience.storyProgress.storyVersion='99.0.0';port.setItem(STUDENT_DATA_KEY,JSON.stringify(data));const original=port.getItem(STUDENT_DATA_KEY)
  repo=new Repository(()=>port);const result=repo.load();assert.equal(result.ok,false);assert.equal(repo.save(result.data).ok,false);assert.equal(port.getItem(STUDENT_DATA_KEY),original)
})
