import type { CareerStory } from '../../types'

// Resolve committed IDs only. Drafts and missing/invalid IDs never invent a choice.
export function getStoryRecords(story: CareerStory, choices: Record<string, string>) {
  return story.decisions.flatMap((decision, index) => {
    const option = decision.options.find(candidate => candidate.id === choices[decision.id])
    return option ? [{ decision, option, index }] : []
  })
}

export function getIncomingHandoff(story: CareerStory, index: number, choices: Record<string, string>) {
  const previous = story.decisions[index - 1]
  const current = story.decisions[index]
  if (!previous || !current) return undefined
  const option = previous.options.find(candidate => candidate.id === choices[previous.id])
  return option?.handoff.nextDecisionId === current.id ? option.handoff.narrative : undefined
}
