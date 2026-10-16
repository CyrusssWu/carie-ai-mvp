import test from 'node:test'
import assert from 'node:assert/strict'
import { tsModuleUrl } from './helpers/loadTs.mjs'

const { uxStory } = await import(tsModuleUrl('../../src/data/careers.ts'))
const { transitionStory, restoreReflection, restorePassport } = await import(tsModuleUrl('../../src/context/storage.ts'))
const { EXPERIENCE_KEY, restoreExperience, loadExperience, saveCurrentRun, beginStoryRun, updateRunDraft, updateEntry } = await import(tsModuleUrl('../../src/context/experience.ts'))
const { buildShareSections, defaultShareSettings } = await import(tsModuleUrl('../../src/data/share.ts'))
const complete = (state = restoreExperience(null), path = ['a', 'b', 'c', 'a', 'b']) => {
  let storyProgress = state.storyProgress
  uxStory.decisions.forEach((decision, index) => {
    for (const action of [{type:'select',optionId:path[index]}, {type:'confirm'}, {type:'reveal'}, {type:'next'}]) storyProgress = transitionStory(storyProgress, { ...action, decisionId: decision.id })
  })
  return { ...state, storyProgress }
}
const memoryStorage = values => {
  const map = new Map(Object.entries(values ?? {}))
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }
}

test('reflection can be filled, changed and cleared without touching committed decisions', () => {
  const state = complete()
  const filled = updateRunDraft(state, { reflection: { engagingParts: ['分析問題'], difficultOther: '公開討論', furtherExploration: '想再試訪談', interestToContinue: '暫時不想', additionalNotes: '私人筆記' } })
  assert.deepEqual(filled.storyProgress, state.storyProgress)
  assert.equal(restoreExperience(filled).reflection.interestToContinue, '暫時不想')
  assert.deepEqual(updateRunDraft(filled, { reflection: {} }).reflection, {})
  assert.equal(saveCurrentRun(filled).passport[0].reflection.additionalNotes, '私人筆記')
})

test('empty optional draft fields reload without a false corruption warning', () => {
  const state = updateRunDraft(complete(), { reflection: { engagingParts: [], difficultParts: [], additionalNotes: '', difficultOther: '   ' } })
  const storage = memoryStorage({ [EXPERIENCE_KEY]: JSON.stringify(state) })
  assert.deepEqual(state.reflection, {})
  assert.equal(loadExperience(storage).notice, '')
  assert.equal(storage.getItem(EXPERIENCE_KEY + '_recovery'), null)
})

test('failed recovery backup blocks overwriting the original stored data', () => {
  const original = '{damaged but must remain recoverable'
  const loaded = loadExperience({ getItem: () => original, setItem: () => { throw Error('quota exceeded') } })
  assert.equal(loaded.writeBlocked, true)
  assert.ok(loaded.notice)
  assert.deepEqual(loaded.data.passport, [])
})

test('saving snapshots five actual decisions and source-linked evidence, ignoring stale evidence', () => {
  const state = complete()
  state.storyProgress.evidence = [{ behaviour: 'fabricated', evidence: 'not a choice' }]
  const entry = saveCurrentRun(state).passport[0]
  assert.equal(entry.storyRunId, state.storyProgress.storyRunId)
  assert.equal(entry.decisions.length, 5)
  assert.equal(entry.behaviourEvidence.length, 5)
  for (const decision of uxStory.decisions) {
    const chosen = decision.options.find(o => o.id === state.storyProgress.choices[decision.id])
    const record = entry.decisions.find(d => d.decisionId === decision.id)
    assert.equal(record.selectedOptionId, chosen.id)
    assert.equal(record.selectedLabel, chosen.label)
    assert.equal(record.consequence, chosen.consequence)
    assert.equal(entry.behaviourEvidence.find(e => e.sourceDecisionId === decision.id).evidence, chosen.evidence[0].evidence)
  }
  assert.equal(new Set(entry.behaviourEvidence.map(e => e.id)).size, 5)
  const incomplete = restoreExperience(null)
  assert.equal(saveCurrentRun(incomplete), incomplete)
})

test('repeated saves and reload keep one entry; a new run creates an independent entry', () => {
  let saved = saveCurrentRun(complete())
  const original = JSON.parse(JSON.stringify(saved.passport[0]))
  saved = saveCurrentRun(restoreExperience(saveCurrentRun(saved)))
  assert.equal(saved.passport.length, 1)
  assert.deepEqual(JSON.parse(JSON.stringify(saved.passport[0])), original)
  const another = beginStoryRun(saved)
  assert.notEqual(another.storyProgress.storyRunId, saved.storyProgress.storyRunId)
  assert.deepEqual(another.reflection, {})
  assert.deepEqual(another.nextSteps, [])
  saved = saveCurrentRun(complete(another, ['c','c','c','c','c']))
  assert.equal(saved.passport.length, 2)
  assert.deepEqual(JSON.parse(JSON.stringify(saved.passport[1])), original)
})

test('editing one passport entry cannot overwrite another run or resurrect cleared reflection', () => {
  let state = saveCurrentRun(updateRunDraft(complete(), { reflection: { additionalNotes: 'first secret' } }))
  const firstId = state.passport[0].id
  state = saveCurrentRun(updateRunDraft(complete(beginStoryRun(state)), { reflection: { additionalNotes: 'second secret' } }))
  const second = JSON.stringify(state.passport[0])
  state = updateEntry(state, firstId, { reflection: { furtherExploration: '改成研究服務流程' } })
  assert.equal(JSON.stringify(state.passport[0]), second)
  assert.equal(state.reflection.additionalNotes, 'second secret')
  state = updateEntry(state, state.passport[0].id, { reflection: {} })
  assert.deepEqual(state.reflection, {})
  assert.deepEqual(saveCurrentRun(state).passport[0].reflection, {})
  assert.equal(updateEntry(state, 'missing', { reflection: {} }), state)
})

test('next step selection, date and completed/uncompleted status survive reload and editing', () => {
  const step = { id: 'app-observation', title: '觀察 App', description: '寫下想法', completed: true, targetDate: '2026-11-01', completedAt: '2026-10-15T10:00:00Z' }
  let state = saveCurrentRun(updateRunDraft(complete(), { nextSteps: [step] }))
  state = restoreExperience(state)
  assert.deepEqual(state.passport[0].nextSteps, [{ ...step, completedAt: new Date(step.completedAt).toISOString() }])
  state = updateEntry(state, state.passport[0].id, { nextSteps: [{ ...step, completed: false }] })
  assert.equal(state.nextSteps[0].completedAt, undefined)
  assert.equal(restoreExperience(state).passport[0].nextSteps[0].completed, false)
})

test('all 16 sharing combinations exclude every unchecked category and default private reflection/actions', () => {
  const entry = saveCurrentRun(updateRunDraft(complete(), { reflection: { additionalNotes: 'PRIVATE_REFLECTION' }, nextSteps: [{ id:'private-action', title:'PRIVATE_ACTION', completed:false }] })).passport[0]
  assert.deepEqual(defaultShareSettings, { experience:true, evidence:true, reflection:false, next:false })
  for (let mask=0; mask<16; mask++) {
    const settings = Object.fromEntries(Object.keys(defaultShareSettings).map((key,index) => [key, Boolean(mask & 1 << index)]))
    const sections = buildShareSections(entry, 'NICKNAME', settings)
    for (const key of Object.keys(settings)) assert.equal(sections.some(s => s.key === key), settings[key])
    const text = JSON.stringify(sections)
    assert.equal(text.includes('PRIVATE_REFLECTION'), settings.reflection)
    assert.equal(text.includes('PRIVATE_ACTION'), settings.next)
    assert.equal(text.includes('NICKNAME'), settings.experience)
    assert.equal(text.includes(entry.behaviourEvidence[0].evidence), settings.evidence)
  }
})

test('legacy data preserves reflections and actions, never fabricates missing decisions', () => {
  const legacy = { id:uxStory.id, career:uxStory.career, storyTitle:uxStory.title, dateCompleted:'2026-10-14T00:00:00Z', behaviourEvidence:[{behaviour:'User listening',evidence:'舊版原文'}], reflection:{note:'舊記錄筆記',energisedBy:'解決問題'}, nextSteps:['舊版行動'] }
  const store = memoryStorage({ carie_story_progress_v1:JSON.stringify({storyId:uxStory.id,index:0,choices:{}}), carie_reflection_v1:JSON.stringify({note:'未保存的新草稿'}), carie_passport_v1:JSON.stringify([legacy]) })
  const {data} = loadExperience(store)
  assert.equal(data.reflection.additionalNotes, '未保存的新草稿')
  assert.equal(data.passport[0].reflection.additionalNotes, '舊記錄筆記')
  assert.deepEqual(data.passport[0].reflection.engagingParts, ['解決問題'])
  assert.equal(data.passport[0].nextSteps[0].title, '舊版行動')
  assert.deepEqual(data.passport[0].decisions, [])
  assert.equal(data.passport[0].legacyIncomplete, true)
  assert.equal(data.passport[0].behaviourEvidence[0].sourceDecisionId, undefined)
  assert.equal(restoreReflection({ tryAgain:'暫時不想' }).interestToContinue, '暫時不想')
  assert.equal(loadExperience(store).data.storyProgress.storyRunId, data.storyProgress.storyRunId)
})

test('missing/corrupt/partly damaged storage recovers safely and preserves a recovery copy', () => {
  const broken = memoryStorage({ [EXPERIENCE_KEY]:'{broken JSON' })
  const loaded = loadExperience(broken)
  assert.ok(loaded.notice)
  assert.equal(loaded.data.passport.length, 0)
  assert.equal(broken.getItem(EXPERIENCE_KEY+'_recovery'), '{broken JSON')
  for (const raw of [null, 'text', 5, [], { storyProgress:{storyId:'wrong'}, reflection:{additionalNotes:'orphan'}, passport:[null] }]) {
    const restored = restoreExperience(raw)
    assert.equal(restored.storyProgress.completed, false)
    assert.deepEqual(restored.reflection, {})
    assert.deepEqual(restored.passport, [])
  }
  const state = saveCurrentRun(complete())
  const damaged = { ...state, passport:[state.passport[0], null, {...state.passport[0], id:'duplicate'}] }
  assert.equal(restoreExperience(damaged).passport.length, 1)
  assert.doesNotThrow(() => loadExperience({getItem(){throw Error('denied')},setItem(){throw Error('denied')}}))
  const stable = memoryStorage({ [EXPERIENCE_KEY]:JSON.stringify(state) })
  assert.equal(loadExperience(stable).notice, '')
  assert.deepEqual(restorePassport(null), [])
})

test('share summary creation is pure and never calls network or clipboard capabilities', () => {
  const entry = saveCurrentRun(complete()).passport[0]
  const before = JSON.stringify(entry)
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = () => { throw Error('Unexpected network call') }
    assert.ok(buildShareSections(entry, '測試暱稱', defaultShareSettings).length)
    assert.equal(JSON.stringify(entry), before)
  } finally { globalThis.fetch = originalFetch }
})
