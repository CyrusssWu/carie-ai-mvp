import type { CareerStory } from '../../types'
import { uxStory } from './uxCommunitySignup'
import { logisticsStory } from './logisticsDelivery'
import { communityStory } from './communityEvent'
import { careers } from '../careerMetadata'
import { nextStepSuggestions } from '../nextSteps'

export const publishedStories = [uxStory, logisticsStory, communityStory]
// Retain every published version here. The last version of each ID is current.
export const storyCatalog: Readonly<Record<string, CareerStory>> = Object.fromEntries(publishedStories.map(s => [s.id, s]))
export function findStory(id: unknown, version?: unknown): CareerStory | undefined {
  if (typeof id !== 'string' || !Object.hasOwn(storyCatalog, id)) return undefined
  const current = storyCatalog[id]
  if (version === undefined || version === current.version) return current
  return publishedStories.find(s => s.id === id && s.version === version)
}
export const allCareers = () => careers
export const findCareer = (id: unknown) => careers.find(c => c.id === id)
export const storiesForCareer = (id: unknown) => (findCareer(id)?.storyIds ?? []).flatMap(id => { const s = findStory(id); return s ? [s] : [] })
export const canStartStory = (id: unknown) => !!findStory(id)
export const careerForStory = (id: unknown) => findCareer(findStory(id)?.careerId)
export const storyForRun = (run: { storyId: string; storyVersion?: string }) => findStory(run.storyId, run.storyVersion ?? '1.0.0')
export const actionsForStory = (id: unknown, version?: string) => findStory(id, version)?.nextStepSuggestions.length ? findStory(id, version)!.nextStepSuggestions : nextStepSuggestions
