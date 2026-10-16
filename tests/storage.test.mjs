import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { tsModuleUrl } from './helpers/loadTs.mjs'

// Compile pure data and state modules in memory; no browser or services needed.
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const moduleUrl = text => `data:text/javascript;base64,${Buffer.from(text).toString('base64')}`
const { uxStory } = await import(tsModuleUrl('../../src/data/stories/uxCommunitySignup.ts'))
const { getStoryRecords, getIncomingHandoff } = await import(moduleUrl(compile('../src/data/stories/storyRecords.ts')))
const storage = await import(tsModuleUrl('../../src/context/storage.ts'))
const { restoreStory, restoreProfile, restoreReflection, restorePassport, evidenceFor, transitionStory } = storage

test('all 243 story paths restore exactly five choices and their evidence', () => {
  for (let path = 0; path < 3 ** 5; path++) {
    const choices = Object.fromEntries(uxStory.decisions.map((d, i) => [d.id, d.options[Math.floor(path / 3 ** i) % 3].id]))
    const restored = restoreStory({ storyId: uxStory.id, choices, index: 5, completed: true })
    assert.equal(restored.completed, true)
    assert.deepEqual(restored.choices, choices)
    assert.deepEqual(restored.evidence, evidenceFor(choices))
    assert.equal(restored.evidence.length, 5)
    const recap = getStoryRecords(uxStory, restored.choices)
    assert.equal(recap.length, 5)
    recap.forEach(({ decision, option, index }) => {
      assert.equal(option.id, choices[decision.id])
      assert.equal(decision, uxStory.decisions[index])
      assert.equal(option, decision.options.find(candidate => candidate.id === choices[decision.id]))
      if (index < 4) assert.equal(getIncomingHandoff(uxStory, index + 1, restored.choices), option.handoff.narrative)
    })
  }
})

test('every chapter has context and three complete non-scoring branches with valid handoffs', () => {
  assert.equal(uxStory.decisions.length, 5)
  assert.equal(new Set(uxStory.decisions.map(d => d.id)).size, 5)
  for (const [index, decision] of uxStory.decisions.entries()) {
    for (const field of ['phase', 'workplaceContext', 'scenario']) assert.ok(decision[field].trim())
    assert.deepEqual(decision.options.map(o => o.id), ['a', 'b', 'c'])
    assert.equal(new Set(decision.options.map(o => o.consequence)).size, 3)
    assert.equal(new Set(decision.options.map(o => o.handoff.narrative)).size, 3)
    for (const option of decision.options) {
      for (const field of ['label', 'description', 'consequence']) assert.ok(option[field].trim())
      assert.ok(option.evidence.length > 0)
      assert.ok(option.evidence.every(e => e.behaviour.trim() && e.evidence.trim()))
      assert.ok(option.handoff.narrative.trim())
      assert.equal(option.handoff.nextDecisionId, uxStory.decisions[index + 1]?.id ?? null)
    }
  }
  const audit = value => {
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      assert.doesNotMatch(key, /score|points|correct|suitable|career.?fit|competency/i)
      if (typeof child === 'number') assert.ok(['sequence', 'estimatedMinutes'].includes(key), 'Only sequence and duration may be numeric; never scoring')
      audit(child)
    }
  }
  audit(uxStory)
})

test('recap and incoming context never substitute defaults for missing or invalid choices', () => {
  assert.deepEqual(getStoryRecords(uxStory, {}), [])
  assert.deepEqual(getStoryRecords(uxStory, { d1: 'invalid', unknown: 'a' }), [])
  assert.equal(getIncomingHandoff(uxStory, 0, { d1: 'a' }), undefined)
  assert.equal(getIncomingHandoff(uxStory, 1, { d1: 'invalid' }), undefined)
  const draft = restoreStory({ storyId: uxStory.id, choices: {}, stage: 'confirm', selectedOptionId: 'b' })
  assert.deepEqual(getStoryRecords(uxStory, draft.choices), [])
  assert.equal(getIncomingHandoff(uxStory, 1, draft.choices), undefined)
})

test('confirmation drafts survive reload without becoming evidence', () => {
  const progress = restoreStory({ storyId: uxStory.id, choices: {}, index: 0, stage: 'confirm', selectedOptionId: 'b' })
  assert.equal(progress.stage, 'confirm')
  assert.equal(progress.selectedOptionId, 'b')
  assert.deepEqual(progress.evidence, [])
})

test('consequences survive reload, stale evidence is replaced and never duplicated', () => {
  const progress = restoreStory({ storyId: uxStory.id, choices: { d1: 'b' }, index: 0, stage: 'consequence', evidence: [...evidenceFor({ d1: 'a' }), ...evidenceFor({ d1: 'b' })] })
  assert.equal(progress.stage, 'consequence')
  assert.deepEqual(progress.evidence, evidenceFor({ d1: 'b' }))
  assert.deepEqual(restoreStory(progress), progress)
})

test('damaged JSON shapes cannot crash or fabricate completion', () => {
  for (const value of [null, [], 'bad', 42, { index: -7 }, { storyId: 'unknown' }]) {
    assert.equal(restoreStory(value).completed, false)
    assert.deepEqual(restoreProfile(value).selectedIndustries, [])
    assert.deepEqual(restoreReflection(value), {})
    assert.deepEqual(restorePassport(value), [])
  }
  const progress = restoreStory({ storyId: uxStory.id, index: 99, choices: { d1: 'a', d2: 'invalid', d5: 'c' }, completed: true, stage: 'confirm' })
  assert.equal(progress.completed, false)
  assert.equal(progress.index, 1)
  assert.equal(progress.stage, 'decision')
  assert.deepEqual(progress.choices, { d1: 'a' })
})

test('profile drops orphaned fields and invalid answers; reflection remains optional', () => {
  const profile = restoreProfile({ selectedIndustries: ['科技與數碼'], selectedFields: ['UX / UI', 'AI'], explorationAnswers: { q1: 'b', q2: 'invalid' } })
  assert.deepEqual(profile.selectedFields, ['AI'])
  assert.deepEqual(profile.explorationAnswers, { q1: 'b' })
  assert.deepEqual(profile.explorationTags, ['Making', 'Experimenting'])
  assert.deepEqual(restoreReflection({ note: '自己的想法', energisedBy: null }), { additionalNotes: '自己的想法' })
})

test('passport restoration deduplicates entries and drops malformed records', () => {
  const entry = { id: uxStory.id, career: uxStory.career, storyTitle: uxStory.title, dateCompleted: '2026-10-15T00:00:00Z', behaviourEvidence: evidenceFor({ d1: 'a' }), reflection: {}, nextSteps: ['和導師聊聊'] }
  const restored = restorePassport([entry, entry, null, { ...entry, behaviourEvidence: null }])
  assert.equal(restored.length, 1)
  assert.equal(restored[0].storyRunId, `legacy-run:${entry.id}`)
  assert.equal(restored[0].legacyIncomplete, true)
  assert.equal(restored[0].nextSteps[0].title, '和導師聊聊')
  assert.equal(restored[0].behaviourEvidence[0].evidence, entry.behaviourEvidence[0].evidence)
})

test('invalid JSON and denied localStorage reads recover safely', () => {
  try {
    globalThis.localStorage = { getItem: () => '{broken json' }
    assert.equal(storage.readJson('test'), null)
    globalThis.localStorage = { getItem: () => { throw new Error('Storage blocked') } }
    assert.equal(storage.readJson('test'), null)
  } finally { delete globalThis.localStorage }
})

test('a restored consequence always matches the committed choice, not a stale draft', () => {
  const progress = restoreStory({ storyId: uxStory.id, index: 0, stage: 'consequence', choices: { d1: 'a' }, selectedOptionId: 'b' })
  assert.equal(progress.selectedOptionId, 'a')
  assert.deepEqual(progress.evidence, uxStory.decisions[0].options[0].evidence)
})

test('legacy committed choices resume their consequence without reopening the decision', () => {
  const progress = restoreStory({ storyId: uxStory.id, index: 0, choices: { d1: 'c' } })
  assert.equal(progress.stage, 'consequence')
  assert.equal(progress.selectedOptionId, 'c')
})

test('all 243 paths traverse every stage, allow changes, reload safely and reject repeated events', () => {
  const reload = state => restoreStory(JSON.parse(JSON.stringify(state)))
  for (let path = 0; path < 3 ** 5; path++) {
    let state = restoreStory(null)
    const expectedChoices = {}
    for (const [index, decision] of uxStory.decisions.entries()) {
      const send = (type, extra = {}) => { state = transitionStory(state, { type, decisionId: decision.id, ...extra }) }
      assert.equal(state.index, index)
      assert.equal(state.stage, 'decision')
      const chosen = decision.options[Math.floor(path / 3 ** index) % 3]
      const abandoned = decision.options[(decision.options.indexOf(chosen) + 1) % 3]
      send('select', { optionId: abandoned.id })
      state = reload(state)
      assert.equal(state.selectedOptionId, abandoned.id)
      send('confirm')
      state = reload(state)
      assert.equal(state.stage, 'confirm')
      assert.equal(state.evidence.length, index)
      send('change')
      send('select', { optionId: chosen.id })
      send('confirm')
      state = reload(state)
      assert.equal(state.selectedOptionId, chosen.id)
      send('reveal')
      expectedChoices[decision.id] = chosen.id
      assert.equal(state.stage, 'consequence')
      assert.deepEqual(state.choices, expectedChoices)
      assert.deepEqual(state.evidence, uxStory.decisions.slice(0, index + 1).flatMap(d => d.options.find(o => o.id === expectedChoices[d.id]).evidence))
      const committed = state
      send('reveal')
      assert.equal(state, committed)
      send('change')
      assert.equal(state, committed)
      send('select', { optionId: abandoned.id })
      assert.equal(state, committed)
      state = reload(state)
      assert.equal(state.stage, 'consequence')
      assert.equal(state.selectedOptionId, chosen.id)
      assert.equal(state.evidence.length, index + 1)
      send('next')
      const advanced = state
      send('next')
      send('reveal')
      assert.equal(state, advanced)
      state = reload(state)
      assert.equal(state.index, index + 1)
    }
    assert.equal(state.completed, true)
    assert.deepEqual(state.choices, expectedChoices)
    assert.equal(state.evidence.length, 5)
    assert.equal(transitionStory(state, {type:'select', decisionId:'d5', optionId:'a'}), state)
  }
})

test('unselected, invalid, premature and wrong-decision actions cannot advance the story', () => {
  const initial = restoreStory(null)
  for (const type of ['confirm', 'change', 'reveal', 'next']) {
    assert.equal(transitionStory(initial, { type, decisionId: 'd1' }), initial)
  }
  assert.equal(transitionStory(initial, { type: 'select', decisionId: 'd1', optionId: 'invalid' }), initial)
  assert.equal(transitionStory(initial, { type: 'select', decisionId: 'd2', optionId: 'a' }), initial)
  const selected = transitionStory(initial, { type: 'select', decisionId: 'd1', optionId: 'a' })
  assert.equal(transitionStory(selected, { type: 'reveal', decisionId: 'd1' }), selected)
  const confirm = transitionStory(selected, { type: 'confirm', decisionId: 'd1' })
  assert.equal(transitionStory(confirm, { type: 'next', decisionId: 'd1' }), confirm)
  assert.equal(transitionStory(confirm, { type: 'select', decisionId: 'd1', optionId: 'b' }), confirm)
})
