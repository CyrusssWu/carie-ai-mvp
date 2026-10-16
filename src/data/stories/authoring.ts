import type { CareerStory, Decision, DecisionOption } from '../../types'

// Authoring shorthand only: output is the same schema consumed by every player.
export function option(id: string, label: string, description: string, consequence: string, behaviour: string, evidence: string, narrative: string): DecisionOption {
  return { id, label, description, consequence, evidence: [{ id: '', sourceDecisionId: '', sourceOptionId: id, behaviour, evidence }], handoff: { nextDecisionId: null, narrative } }
}
export function chapter(id: string, phase: string, workplaceContext: string, scenario: string, options: DecisionOption[]): Decision {
  return { id, sequence: 0, phase, workplaceContext, scenario, options }
}
export function defineStory(story: CareerStory): CareerStory {
  return { ...story, decisions: story.decisions.map((d, index) => ({ ...d, sequence: index + 1,
    options: d.options.map(o => ({ ...o, evidence: o.evidence.map((e, i) => ({ ...e, id: `${story.id}:${d.id}:${o.id}:${i}`, sourceDecisionId: d.id, sourceOptionId: o.id })), handoff: { ...o.handoff, nextDecisionId: story.decisions[index + 1]?.id ?? null } })),
  })) }
}
