import type { AcademicStartingPoint, PlanStatus } from './education'
export type StartingPoint =
  | '完全不知道自己想做什麼'
  | '有幾個想法，但不確定'
  | '知道一些感興趣的方向'
  | '已經有方向，想了解怎樣實現'

export interface StudentProfile {
  academicStartingPoint?: AcademicStartingPoint
  nickname: string
  avatar?: string
  startingPoint?: StartingPoint
  selectedIndustries: string[]
  selectedFields: string[]
  explorationAnswers: Record<string, string>
  explorationTags: string[]
  suggestedCareers: string[]
}

export interface BehaviourEvidence {
  behaviour: string
  evidence: string
}

export interface ContentEvidence extends BehaviourEvidence {
  id: string
  sourceDecisionId: string
  sourceOptionId: string
}
export interface Vocabulary { id: string; term: string; zh: string; explanation: string; example: string }
export interface Career {
  id: string; slug: string; title: string; titleZh: string; industry: string
  description: string; tags: string[]; storyIds: string[]
  why: string; experience: string
}
export interface ActionSuggestion { id: string; title: string; description: string; category: string }

export interface DecisionOption {
  id: string
  label: string
  description: string
  consequence: string
  evidence: ContentEvidence[]
  handoff: { nextDecisionId: string | null; narrative: string }
}

export interface Decision {
  id: string
  sequence: number
  phase: string
  workplaceContext: string
  scenario: string
  options: DecisionOption[]
  vocabulary?: Vocabulary[]
}

export interface CareerStory {
  id: string
  version: string
  titleZh: string
  estimatedMinutes: number
  learningObjectives: string[]
  vocabulary: Vocabulary[]
  nextStepSuggestions: ActionSuggestion[]
  careerId: string
  career: string
  title: string
  role: string
  context: string
  mission: string
  presentation: {
    settingLabel: string
    confirmationImage: string
    consequenceImage: string
    avatarImage: string
  }
  decisions: Decision[]
}

export interface StoryProgress {
  storyRunId: string
  completedAt?: string
  storyId: string
  storyVersion: string
  index: number
  choices: Record<string, string>
  evidence: BehaviourEvidence[]
  completed: boolean
  stage: 'decision' | 'confirm' | 'consequence'
  selectedOptionId?: string
}

export interface ReflectionData {
  engagingParts?: string[]
  difficultParts?: string[]
  difficultOther?: string
  furtherExploration?: string
  interestToContinue?: string
  additionalNotes?: string
}

export interface NextStep {
  id: string
  title: string
  description?: string
  completed: boolean
  targetDate?: string
  completedAt?: string
  relatedCareerId?: string
  relatedPathwayId?: string
  status?: PlanStatus
  createdAt?: string
  officialSourceUrl?: string
}

export interface SavedDecision {
  decisionId: string
  selectedOptionId: string
  scenario: string
  selectedLabel: string
  consequence: string
  phase: string
}

export interface SavedEvidence extends BehaviourEvidence {
  id: string
  sourceDecisionId?: string
  sourceOptionId?: string
}

export interface PassportEntry {
  id: string
  storyRunId: string
  storyId: string
  storyVersion?: string
  careerId: string
  career: string
  storyTitle: string
  dateCompleted: string
  decisions: SavedDecision[]
  behaviourEvidence: SavedEvidence[]
  reflection: ReflectionData
  nextSteps: NextStep[]
  legacyIncomplete?: boolean
}

export interface ExperienceState {
  schemaVersion: 2
  storyProgress: StoryProgress
  reflection: ReflectionData
  nextSteps: NextStep[]
  passport: PassportEntry[]
  suspendedRuns?: { storyProgress: StoryProgress; reflection: ReflectionData; nextSteps: NextStep[] }[]
}

// One browser-local owner; this random identifier is not a school/student ID.
export interface StudentData {
  schemaVersion: 3
  localProfileId: string
  revision: string
  profile: StudentProfile
  experience: ExperienceState
  pendingCleanup?: boolean
}

// Consent is session-only, never persisted with student records.
export type ShareSettings = { experience: boolean; evidence: boolean; reflection: boolean; next: boolean }
export interface ShareSelection { entryId: string; settings: ShareSettings }
