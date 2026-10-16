import type { ExperienceState, NextStep, PassportEntry, ReflectionData } from '../types'
import { uxStory } from '../data/careers'
import { findStory, storyForRun } from '../data/stories/catalog'
import { getStoryRecords } from '../data/stories/storyRecords'
import { createStoryRun, restoreNextSteps, restorePassport, restoreReflection, restoreStory } from './storage'

export const EXPERIENCE_KEY = 'carie_experiences_v2'
const object = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}
const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, value]) => value !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, value]) => [k, canonical(value)])) : v

export function restoreExperience(value: unknown): ExperienceState {
  const raw = object(value)
  const storyProgress = restoreStory(raw.storyProgress)
  // A missing/invalid run must not inherit an orphaned draft.
  const hasRun = !!findStory(object(raw.storyProgress).storyId)
  const suspendedRuns = (Array.isArray(raw.suspendedRuns) ? raw.suspendedRuns : []).flatMap(item => {
    const r = object(item), p = object(r.storyProgress)
    if (!findStory(p.storyId, p.storyVersion ?? '1.0.0') || p.storyId === storyProgress.storyId) return []
    return [{ storyProgress: restoreStory(p), reflection: restoreReflection(r.reflection), nextSteps: restoreNextSteps(r.nextSteps) }]
  }).filter((r, i, all) => all.findIndex(other => other.storyProgress.storyId === r.storyProgress.storyId) === i)
  return { schemaVersion: 2, storyProgress, reflection: hasRun ? restoreReflection(raw.reflection) : {}, nextSteps: hasRun ? restoreNextSteps(raw.nextSteps) : [], passport: restorePassport(raw.passport), ...(suspendedRuns.length ? { suspendedRuns } : {}) }
}

export function loadExperience(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  let notice = ''
  let raw: string | null = null
  try {
    raw = storage.getItem(EXPERIENCE_KEY)
    if (raw !== null) {
      let parsed: unknown
      try { parsed = JSON.parse(raw) } catch { parsed = null }
      const data = restoreExperience(parsed)
      const source = object(parsed)
      if (source.schemaVersion !== 2 || !Array.isArray(source.passport) || JSON.stringify(canonical(parsed)) !== JSON.stringify(canonical(data))) {
        notice = '部分本地資料不完整，已恢復可讀取的記錄。請檢查你的 Passport。'
        storage.setItem(`${EXPERIENCE_KEY}_recovery`, raw)
      }
      return { data, notice }
    }
    const read = (key: string) => {
      const text = storage.getItem(key)
      if (!text) return null
      try { return JSON.parse(text) } catch { notice = '部分舊版本地資料無法讀取，其他可用記錄已保留。'; return null }
    }
    const legacyReflection = read('carie_reflection_v1')
    const data = restoreExperience({ storyProgress: read('carie_story_progress_v1'), reflection: legacyReflection, passport: read('carie_passport_v1'), nextSteps: [] })
    // If the old run already has a saved entry, use its editable data as the source.
    const saved = data.passport.find(e => e.storyRunId === data.storyProgress.storyRunId)
    if (saved) { if (legacyReflection === null) data.reflection = saved.reflection; data.nextSteps = saved.nextSteps }
    return { data, notice }
  } catch {
    return { data: raw ? restoreExperience(safeParse(raw)) : restoreExperience(null), notice: '這部裝置暫時無法完整讀寫本地資料。請勿依賴重新載入來保存這次修改。', writeBlocked: true }
  }
}
const safeParse = (text: string): unknown => { try { return JSON.parse(text) } catch { return null } }

export function beginStoryRun(state: ExperienceState, storyId = uxStory.id): ExperienceState {
  return activateStory(state, storyId, true)
}

// One draft per story, moved (not copied) between active and suspended slots.
export function activateStory(state: ExperienceState, storyId: string, restart = false): ExperienceState {
  if (!findStory(storyId)) return state
  if (!restart && state.storyProgress.storyId === storyId) return state
  const previous = state.suspendedRuns?.find(r => r.storyProgress.storyId === storyId)
  const suspendedRuns = (state.suspendedRuns ?? []).filter(r => r.storyProgress.storyId !== storyId)
  if (state.storyProgress.storyId !== storyId) suspendedRuns.push({ storyProgress: state.storyProgress, reflection: state.reflection, nextSteps: state.nextSteps })
  const { suspendedRuns: _old, ...rest } = state
  return { ...rest, ...(restart || !previous ? { storyProgress: createStoryRun(storyId), reflection: {}, nextSteps: [] } : previous), ...(suspendedRuns.length ? { suspendedRuns } : {}) }
}

export function updateEntry(state: ExperienceState, entryId: string, patch: { reflection?: ReflectionData; nextSteps?: NextStep[] }): ExperienceState {
  const entry = state.passport.find(e => e.id === entryId)
  if (!entry) return state
  const updated = { ...entry, ...(patch.reflection !== undefined ? { reflection: restoreReflection(patch.reflection) } : {}), ...(patch.nextSteps !== undefined ? { nextSteps: restoreNextSteps(patch.nextSteps) } : {}) }
  return { ...state, passport: state.passport.map(e => e.id === entryId ? updated : e), ...(state.suspendedRuns ? { suspendedRuns: state.suspendedRuns.map(r => r.storyProgress.storyRunId === entry.storyRunId ? { ...r, reflection: updated.reflection, nextSteps: updated.nextSteps } : r) } : {}), ...(entry.storyRunId === state.storyProgress.storyRunId ? { reflection: updated.reflection, nextSteps: updated.nextSteps } : {}) }
}

export function updateRunDraft(state: ExperienceState, patch: { reflection?: ReflectionData; nextSteps?: NextStep[] }): ExperienceState {
  const normalized = {
    ...(patch.reflection !== undefined ? { reflection: restoreReflection(patch.reflection) } : {}),
    ...(patch.nextSteps !== undefined ? { nextSteps: restoreNextSteps(patch.nextSteps) } : {}),
  }
  const updated = { ...state, ...normalized }
  const saved = state.passport.find(e => e.storyRunId === state.storyProgress.storyRunId)
  return saved ? updateEntry(updated, saved.id, normalized) : updated
}

export function saveCurrentRun(state: ExperienceState, now = new Date().toISOString()): ExperienceState {
  const story = storyForRun(state.storyProgress)
  if (!state.storyProgress.completed || !story) return state
  const records = getStoryRecords(story, state.storyProgress.choices)
  if (records.length !== story.decisions.length) return state
  const existing = state.passport.find(e => e.storyRunId === state.storyProgress.storyRunId)
  if (existing && !existing.legacyIncomplete) return updateEntry(state, existing.id, { reflection: state.reflection, nextSteps: state.nextSteps })
  const entry: PassportEntry = {
    id: existing?.id ?? `entry-${state.storyProgress.storyRunId}`, storyRunId: state.storyProgress.storyRunId, storyId: story.id, storyVersion: story.version, careerId: story.careerId, career: story.career, storyTitle: story.title,
    dateCompleted: existing?.dateCompleted ?? state.storyProgress.completedAt ?? now,
    decisions: records.map(({ decision, option }) => ({ decisionId: decision.id, selectedOptionId: option.id, scenario: decision.scenario, selectedLabel: option.label, consequence: option.consequence, phase: decision.phase })),
    behaviourEvidence: records.flatMap(({ decision, option }) => option.evidence.map((e, i) => ({ ...e, id: `${decision.id}:${option.id}:${i}`, sourceDecisionId: decision.id }))),
    reflection: restoreReflection(state.reflection), nextSteps: restoreNextSteps(state.nextSteps),
  }
  return { ...state, passport: [entry, ...state.passport.filter(e => e.storyRunId !== entry.storyRunId)] }
}
