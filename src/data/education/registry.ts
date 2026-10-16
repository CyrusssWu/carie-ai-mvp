import type { EducationProgramme, EducationRequirement, VerificationStatus } from '../../types/education'
import { educationSources } from './sources'
import { educationPathways, careerPathwayRelationships, programmeCareers } from './pathways'
import { educationProgrammes } from './programmes'
export { educationSources, educationPathways, careerPathwayRelationships, educationProgrammes }
export const verificationLabels: Record<VerificationStatus, string> = { verified: '已核對官方來源（摘要）', needs_review: '資料待核實', outdated: '請查看最新官方要求' }
const date = (value: string) => {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(value + 'T00:00:00Z') : NaN
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value ? parsed : NaN
}
export function programmeStatus(programme: EducationProgramme, now = new Date()): VerificationStatus {
  const reviewed = date(programme.lastVerifiedAt), expires = date(programme.reviewBy)
  if (!Number.isFinite(now.getTime())) return 'needs_review'
  // Review dates and Hong Kong intake dates are calendar days in UTC+8, not UTC instants.
  const today = date(new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10))
  if (!Number.isFinite(reviewed) || !Number.isFinite(expires) || reviewed > today || expires < reviewed || expires - reviewed > 90 * 86_400_000 || !/^20\d{2}\/\d{2}$/.test(programme.admissionYear) || Number(programme.admissionYear.slice(-2)) !== (Number(programme.admissionYear.slice(0, 4)) + 1) % 100) return 'needs_review'
  const entryYear = Number(programme.admissionYear.slice(0, 4))
  // After the named intake starts, requirements are historical, never a current-cycle recommendation.
  if (today >= Date.UTC(entryYear, 8, 1) || today > expires || programme.verificationStatus === 'outdated') return 'outdated'
  const requirements = [programme.generalEntranceRequirements, programme.programmeSpecificRequirements, programme.otherConditions]
  if (programme.verificationStatus !== 'verified' || !programme.sourceIds.length || requirements.some(r => requirementStatus(r, programme) !== 'verified')) return 'needs_review'
  if (programme.sourceIds.some(id => educationSources.find(s => s.id === id)?.accessStatus !== 'read')) return 'needs_review'
  return 'verified'
}
export function requirementStatus(requirement: EducationRequirement, programme: EducationProgramme): VerificationStatus {
  if (!requirement.text?.trim() || requirement.admissionYear !== programme.admissionYear || !requirement.sourceIds.length || requirement.sourceIds.some(id => educationSources.find(s => s.id === id)?.accessStatus !== 'read')) return 'needs_review'
  return requirement.verificationStatus
}
export function pathwaysForCareer(careerId: string) {
  return careerPathwayRelationships.filter(r => r.careerId === careerId).flatMap(relationship => {
    const pathway = educationPathways.find(p => p.id === relationship.pathwayId)
    return pathway ? [{ pathway, relationship, programmes: educationProgrammes.filter(p => pathway.relatedProgrammeIds.includes(p.id) && programmeCareers[p.id]?.includes(careerId)) }] : []
  })
}
export function isOfficialEducationUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return educationSources.some(s => s.url === value)
}
