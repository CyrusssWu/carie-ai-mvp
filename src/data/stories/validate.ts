import type { Career, CareerStory } from '../../types'

// Content validation runs in tests/build; no student data or network access.
export function validateContent(careers: readonly Career[], stories: readonly CareerStory[]): string[] {
  const errors: string[] = []
  const check = (ok: unknown, message: string) => { if (!ok) errors.push(message) }
  const text = (v: unknown) => typeof v === 'string' && !!v.trim()
  const fields = (value: object, keys: string[], path: string) => keys.forEach(k => check(text((value as Record<string, unknown>)[k]), `${path}.${k}: required text`))
  const unique = (ids: string[], path: string) => check(ids.length === new Set(ids).size, `${path}: duplicate ID`)
  unique(careers.map(c => c.id), 'careers'); unique(careers.map(c => c.slug), 'career slugs')
  unique(stories.map(s => s.id), 'stories')
  for (const c of careers) {
    fields(c, ['id', 'slug', 'title', 'titleZh', 'industry', 'description', 'why', 'experience'], c.id)
    check(c.tags.length && c.tags.every(text), `${c.id}: tags required`)
    unique(c.storyIds, `${c.id}.storyIds`)
    for (const id of c.storyIds) check(stories.some(s => s.id === id && s.careerId === c.id), `${c.id}: invalid story reference ${id}`)
  }
  for (const s of stories) {
    fields(s, ['id', 'careerId', 'career', 'version', 'title', 'titleZh', 'role', 'context', 'mission'], s.id)
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id), `${s.id}: unsafe route ID`)
    check(/^\d+\.\d+\.\d+$/.test(s.version), `${s.id}: use semantic version`)
    check(Number.isFinite(s.estimatedMinutes) && s.estimatedMinutes > 0, `${s.id}: duration required`)
    check(s.learningObjectives.length && s.learningObjectives.every(text), `${s.id}: objectives required`)
    check(careers.some(c => c.id === s.careerId && c.storyIds.includes(s.id)), `${s.id}: career reference missing`)
    fields(s.presentation, ['settingLabel', 'confirmationImage', 'consequenceImage', 'avatarImage'], `${s.id}.presentation`)
    check(s.decisions.length === 5, `${s.id}: exactly five decisions required`)
    unique(s.decisions.map(d => d.id), `${s.id}.decisions`)
    unique(s.vocabulary.map(v => v.id), `${s.id}.vocabulary`)
    s.vocabulary.forEach(v => fields(v, ['id', 'term', 'zh', 'explanation', 'example'], `${s.id}.vocabulary`))
    const evidenceIds: string[] = []
    for (const [i, d] of s.decisions.entries()) {
      const path = `${s.id}.${d.id}`
      fields(d, ['id', 'phase', 'workplaceContext', 'scenario'], path)
      check(d.sequence === i + 1, `${path}: sequence mismatch`)
      check(d.options.length >= 3, `${path}: at least three options required`)
      unique(d.options.map(o => o.id), `${path}.options`)
      unique(d.options.map(o => o.label), `${path}.labels`)
      unique(d.options.map(o => o.consequence), `${path}.consequences`)
      for (const v of d.vocabulary ?? []) check(s.vocabulary.some(item => JSON.stringify(item) === JSON.stringify(v)), `${path}: invalid vocabulary reference ${v.id}`)
      for (const o of d.options) {
        fields(o, ['id', 'label', 'description', 'consequence'], `${path}.${o.id}`)
        check(o.handoff?.nextDecisionId === (s.decisions[i + 1]?.id ?? null), `${path}.${o.id}: invalid next decision`)
        check(text(o.handoff?.narrative), `${path}.${o.id}: narrative required`)
        check(o.evidence.length, `${path}.${o.id}: evidence required`)
        for (const e of o.evidence) {
          fields(e, ['id', 'behaviour', 'evidence', 'sourceDecisionId', 'sourceOptionId'], `${path}.${o.id}.evidence`)
          evidenceIds.push(e.id)
          check(e.sourceDecisionId === d.id && e.sourceOptionId === o.id, `${path}.${o.id}: evidence source mismatch`)
        }
      }
    }
    unique(evidenceIds, `${s.id}.evidence`)
    unique(s.nextStepSuggestions.map(a => a.id), `${s.id}.actions`)
    s.nextStepSuggestions.forEach(a => fields(a, ['id', 'title', 'description', 'category'], `${s.id}.actions`))
  }
  const safety = (value: unknown, path = 'content') => {
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      check(!/score|points|correct|suitable|career.?fit|competency/i.test(key), `${path}.${key}: prohibited scoring field`)
      if (typeof child === 'number') check(key === 'sequence' || key === 'estimatedMinutes', `${path}.${key}: unexpected numeric field`)
      if (typeof child === 'string') check(!/career\s*fit\s*\d|communication score|hidden competency|your choice is wrong|you failed this job|you are unsuitable|適配度\s*\d|能力分數|正確答案|錯誤答案/i.test(child), `${path}.${key}: judgement/scoring copy`)
      safety(child, `${path}.${key}`)
    }
  }
  safety(stories)
  return errors
}
