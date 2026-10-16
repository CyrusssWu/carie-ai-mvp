import { explorationQuestions, industries, uxStory } from '../data/careers'
import { findStory, storyForRun } from '../data/stories/catalog'
import { restoreAcademic, restorePlanFields } from '../data/education/planning'
import type { NextStep, PassportEntry, ReflectionData, SavedDecision, SavedEvidence, StoryProgress, StudentProfile } from '../types'

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : []

export function createStoryRun(storyId = uxStory.id): StoryProgress {
  const story = findStory(storyId)
  if (!story) throw new Error('Unknown story ID')
  return { storyRunId: crypto.randomUUID(), storyId, storyVersion: story.version, index: 0, choices: {}, evidence: [], completed: false, stage: 'decision' }
}
export const initialStory = createStoryRun()

// Evidence is always derived from committed choices, never accumulated separately.
export function evidenceFor(choices: Record<string, string>, storyId = uxStory.id, version?: string) {
  return findStory(storyId, version)?.decisions.flatMap(d => d.options.find(o => o.id === choices[d.id])?.evidence ?? []) ?? []
}

export function restoreStory(value: unknown): StoryProgress {
  const raw = record(value)
  const story = findStory(raw.storyId, raw.storyVersion ?? '1.0.0')
  if (!story) return createStoryRun()
  const choices: Record<string, string> = {}
  for (const d of story.decisions) {
    const id = record(raw.choices)[d.id]
    if (!d.options.some(o => o.id === id)) break
    choices[d.id] = id as string
  }
  const completed = raw.completed === true && Object.keys(choices).length === story.decisions.length
  const index = completed ? story.decisions.length : Math.max(0, Math.min(
    Number.isInteger(raw.index) ? raw.index as number : 0, Object.keys(choices).length, story.decisions.length - 1,
  ))
  // Discard inconsistent future choices from stale or damaged storage.
  for (const d of story.decisions.slice(index + 1)) delete choices[d.id]
  const decision = story.decisions[index]
  // A committed choice is authoritative, including legacy saves without a stage.
  // Never let an old draft show a different consequence than the recap/evidence.
  const committed = choices[decision?.id]
  const selectedOptionId = committed ?? decision?.options.find(o => o.id === raw.selectedOptionId)?.id
  const stage = committed ? 'consequence'
    : raw.stage === 'confirm' && selectedOptionId ? 'confirm' : 'decision'
  return { storyRunId: typeof raw.storyRunId === 'string' && raw.storyRunId ? raw.storyRunId : `legacy-run:${story.id}`, completedAt: completed && validDate(raw.completedAt) ? new Date(raw.completedAt).toISOString() : undefined, storyId: story.id, storyVersion: story.version, index, choices, evidence: evidenceFor(choices, story.id, story.version), completed, stage, selectedOptionId }
}

export type StoryAction = { decisionId: string } & (
  | { type: 'select'; optionId: string }
  | { type: 'confirm' | 'change' | 'reveal' | 'next' }
)

// One transition boundary for the player. A decision ID also rejects stale events.
export function transitionStory(progress: StoryProgress, action: StoryAction): StoryProgress {
  const story = storyForRun(progress)
  const decision = story?.decisions[progress.index]
  if (progress.completed || !story || !decision || action.decisionId !== decision.id) return progress
  const selected = decision.options.find(o => o.id === progress.selectedOptionId)
  switch (action.type) {
    case 'select':
      return progress.stage === 'decision' && decision.options.some(o => o.id === action.optionId)
        ? { ...progress, selectedOptionId: action.optionId } : progress
    case 'confirm':
      return progress.stage === 'decision' && selected ? { ...progress, stage: 'confirm' } : progress
    case 'change':
      return progress.stage === 'confirm' ? { ...progress, stage: 'decision' } : progress
    case 'reveal': {
      if (progress.stage !== 'confirm' || !selected) return progress
      const choices = { ...progress.choices, [decision.id]: selected.id }
      return { ...progress, choices, evidence: evidenceFor(choices, story.id, story.version), stage: 'consequence' }
    }
    case 'next': {
      if (progress.stage !== 'consequence' || !story.decisions.slice(0, progress.index + 1)
        .every(d => d.options.some(o => o.id === progress.choices[d.id]))) return progress
      const index = progress.index + 1
      return { ...progress, index, completed: index === story.decisions.length, completedAt: index === story.decisions.length ? new Date().toISOString() : undefined, stage: 'decision', selectedOptionId: undefined }
    }
  }
}

export function restoreProfile(value: unknown): StudentProfile {
  const raw = record(value)
  const selectedIndustries = [...new Set(strings(raw.selectedIndustries))].filter(x => industries.some(i => i.name === x)).slice(0, 3)
  const fields = industries.filter(i => selectedIndustries.includes(i.name)).flatMap(i => i.fields)
  const explorationAnswers: Record<string, string> = {}
  for (const q of explorationQuestions) {
    const option = q.options.find(o => o.id === record(raw.explorationAnswers)[q.id])
    if (option) explorationAnswers[q.id] = option.id
  }
  const startingPoints = ['完全不知道自己想做什麼', '有幾個想法，但不確定', '知道一些感興趣的方向', '已經有方向，想了解怎樣實現']
  return {
    nickname: typeof raw.nickname === 'string' ? raw.nickname : '',
    avatar: typeof raw.avatar === 'string' ? raw.avatar : undefined,
    startingPoint: startingPoints.includes(raw.startingPoint as string) ? raw.startingPoint as StudentProfile['startingPoint'] : undefined,
    selectedIndustries, selectedFields: strings(raw.selectedFields).filter(x => fields.includes(x)),
    explorationAnswers,
    explorationTags: [...new Set(explorationQuestions.flatMap(q => q.options.find(o => o.id === explorationAnswers[q.id])?.tags ?? []))],
    suggestedCareers: strings(raw.suggestedCareers),
    ...(raw.academicStartingPoint !== undefined ? { academicStartingPoint: restoreAcademic(raw.academicStartingPoint) } : {}),
  }
}

export function restoreReflection(value: unknown): ReflectionData {
  const raw = record(value)
  const result: ReflectionData = {}
  for (const [key, legacy] of [['engagingParts', 'energisedBy'], ['difficultParts', 'drainedBy']] as const) {
    const values = [...new Set(Array.isArray(raw[key]) ? strings(raw[key]) : typeof raw[legacy] === 'string' ? [raw[legacy] as string] : [])].filter(x => x.trim())
    if (values.length) result[key] = values
  }
  for (const [key, legacy] of [['difficultOther', 'difficultOther'], ['furtherExploration', 'deeperTry'], ['interestToContinue', 'tryAgain'], ['additionalNotes', 'note']] as const) {
    const value = raw[key] ?? raw[legacy]
    if (typeof value === 'string' && value.trim()) result[key] = value
  }
  return result
}

const validDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value))

export function restoreNextSteps(value: unknown): NextStep[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item, i): NextStep[] => {
    if (typeof item === 'string') return [{ id: `legacy-action-${i}`, title: item, completed: false }]
    const s = record(item)
    if (typeof s.id !== 'string' || !s.id || typeof s.title !== 'string' || !s.title.trim()) return []
    return [{ ...restorePlanFields(s), id: s.id, title: s.title, description: typeof s.description === 'string' ? s.description : undefined, completed: s.completed === true,
      targetDate: typeof s.targetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.targetDate) && validDate(s.targetDate) && new Date(s.targetDate).toISOString().slice(0, 10) === s.targetDate ? s.targetDate : undefined,
      completedAt: s.completed === true && validDate(s.completedAt) ? new Date(s.completedAt).toISOString() : undefined }]
  }).filter((s, i, all) => all.findIndex(other => other.id === s.id) === i)
}

export function restorePassport(value: unknown): PassportEntry[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry): PassportEntry[] => {
    const e = record(entry)
    if (typeof e.id !== 'string' || !e.id || typeof e.career !== 'string' || typeof e.storyTitle !== 'string' || !validDate(e.dateCompleted) || !Array.isArray(e.behaviourEvidence)) return []
    const decisions = (Array.isArray(e.decisions) ? e.decisions : []).flatMap((item): SavedDecision[] => {
      const d = record(item)
      if (!['decisionId', 'selectedOptionId', 'scenario', 'selectedLabel', 'consequence', 'phase'].every(k => typeof d[k] === 'string')) return []
      return [{ decisionId: d.decisionId as string, selectedOptionId: d.selectedOptionId as string, scenario: d.scenario as string, selectedLabel: d.selectedLabel as string, consequence: d.consequence as string, phase: d.phase as string }]
    }).filter((d, i, all) => all.findIndex(other => other.decisionId === d.decisionId) === i)
    const behaviourEvidence = e.behaviourEvidence.flatMap((item, i): SavedEvidence[] => {
      const b = record(item)
      if (typeof b.behaviour !== 'string' || typeof b.evidence !== 'string') return []
      return [{ id: typeof b.id === 'string' ? b.id : `legacy-evidence-${i}`, behaviour: b.behaviour, evidence: b.evidence, sourceOptionId: typeof b.sourceOptionId === 'string' ? b.sourceOptionId : undefined, sourceDecisionId: typeof b.sourceDecisionId === 'string' ? b.sourceDecisionId : undefined }]
    }).filter((b, i, all) => all.findIndex(other => other.sourceDecisionId === b.sourceDecisionId && other.behaviour === b.behaviour && other.evidence === b.evidence) === i)
    return [{ id: e.id, storyRunId: typeof e.storyRunId === 'string' && e.storyRunId ? e.storyRunId : `legacy-run:${e.id}`, storyId: typeof e.storyId === 'string' ? e.storyId : e.id,
      storyVersion: typeof e.storyVersion === 'string' ? e.storyVersion : undefined, careerId: typeof e.careerId === 'string' ? e.careerId : e.career === uxStory.career ? uxStory.careerId : '', career: e.career, storyTitle: e.storyTitle, dateCompleted: new Date(e.dateCompleted).toISOString(),
      decisions, behaviourEvidence, reflection: restoreReflection(e.reflection), nextSteps: restoreNextSteps(e.nextSteps), legacyIncomplete: e.legacyIncomplete === true || decisions.length !== (findStory(e.storyId ?? e.id)?.decisions.length ?? decisions.length) || !decisions.length || undefined }]
  }).filter((e, i, all) => all.findIndex(other => other.storyRunId === e.storyRunId || other.id === e.id) === i)
}

export function readJson(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') } catch { return null }
}
