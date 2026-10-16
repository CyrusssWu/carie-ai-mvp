export type VerificationStatus = 'verified' | 'needs_review' | 'outdated'
export type PathwayType = 'bachelor' | 'associate' | 'higher_diploma' | 'vocational' | 'other'
export interface EducationSource {
  id: string; organisation: string; title: string; url: string; accessedAt: string
  applicableYear?: string; verificationNotes: string; accessStatus: 'read' | 'unavailable'
}
export interface EducationRequirement {
  text: string | null; admissionYear: string; sourceIds: string[]; verificationStatus: VerificationStatus
}
export interface EducationProgramme {
  id: string; officialProgrammeCode?: string; programmeName: string; institution: string
  qualificationLevel: string; applicationChannel: string; admissionYear: string
  generalEntranceRequirements: EducationRequirement; programmeSpecificRequirements: EducationRequirement
  otherConditions: EducationRequirement; officialUrl: string; sourceIds: string[]
  lastVerifiedAt: string; reviewBy: string; verificationStatus: VerificationStatus
}
export interface EducationPathway {
  id: string; title: string; titleZh: string; pathwayType: PathwayType; description: string
  progressionOptions: string[]; relatedCareerIds: string[]; relatedProgrammeIds: string[]; sourceIds: string[]
}
export interface CareerPathwayRelationship {
  careerId: string; pathwayId: string; explanation: string; sourceIds: string[]
  relationshipType: 'editorial_study_connection'; fields: string[]
}
export type AcademicStartingPoint = {
  schoolLevel?: 'S4' | 'S5' | 'S6' | 'prefer_not_to_say'
  supportSubjects: string[]; helpWith?: string
}
export type PlanStatus = 'not_started' | 'in_progress' | 'completed'
