import type { EducationPathway, EducationProgramme, EducationSource, CareerPathwayRelationship } from '../../types/education'
export function validateEducation(sources: EducationSource[], programmes: EducationProgramme[], pathways: EducationPathway[], relationships: CareerPathwayRelationship[], careerIds: string[]) {
  const errors: string[] = []
  const unique = (values: { id: string }[], label: string) => { if (new Set(values.map(v => v.id)).size !== values.length || values.some(v => !v.id)) errors.push(`${label}: duplicate/empty ID`) }
  unique(sources, 'sources'); unique(programmes, 'programmes'); unique(pathways, 'pathways')
  const refs = (ids: string[], label: string) => { if (!ids.length || ids.some(id => !sources.some(s => s.id === id))) errors.push(`${label}: missing source`) }
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  for (const source of sources) {
    if (!/^https:\/\//.test(source.url) || !validDate(source.accessedAt) || !source.verificationNotes || !source.organisation) errors.push(`${source.id}: incomplete source metadata`)
  }
  for (const programme of programmes) {
    refs(programme.sourceIds, programme.id)
    if (!sources.some(s => s.url === programme.officialUrl && programme.sourceIds.includes(s.id))) errors.push(`${programme.id}: unregistered official URL`)
    if (!/^20\d{2}\/\d{2}$/.test(programme.admissionYear) || Number(programme.admissionYear.slice(-2)) !== (Number(programme.admissionYear.slice(0, 4)) + 1) % 100) errors.push(`${programme.id}: invalid admission year`)
    if (!validDate(programme.lastVerifiedAt) || !validDate(programme.reviewBy) || programme.reviewBy < programme.lastVerifiedAt || Date.parse(programme.reviewBy) - Date.parse(programme.lastVerifiedAt) > 90 * 86_400_000) errors.push(`${programme.id}: invalid review window`)
    for (const requirement of [programme.generalEntranceRequirements, programme.programmeSpecificRequirements, programme.otherConditions]) {
      if (requirement.admissionYear !== programme.admissionYear) errors.push(`${programme.id}: requirement year mismatch`)
      refs(requirement.sourceIds, programme.id)
      if (requirement.verificationStatus === 'verified' && (!requirement.text?.trim() || requirement.sourceIds.some(id => sources.find(s => s.id === id)?.accessStatus !== 'read'))) errors.push(`${programme.id}: unverified requirement marked verified`)
      if (programme.verificationStatus === 'verified' && requirement.verificationStatus !== 'verified') errors.push(`${programme.id}: partial record marked verified`)
    }
  }
  for (const pathway of pathways) {
    refs(pathway.sourceIds, pathway.id)
    if (pathway.relatedCareerIds.some(id => !careerIds.includes(id)) || pathway.relatedProgrammeIds.some(id => !programmes.some(p => p.id === id))) errors.push(`${pathway.id}: dangling relationship`)
  }
  const keys = relationships.map(r => r.careerId + ':' + r.pathwayId)
  if (new Set(keys).size !== keys.length) errors.push('Duplicate career/pathway relationship')
  for (const relationship of relationships) {
    refs(relationship.sourceIds, relationship.pathwayId)
    if (!careerIds.includes(relationship.careerId) || !pathways.some(p => p.id === relationship.pathwayId && p.relatedCareerIds.includes(relationship.careerId)) || relationship.relationshipType !== 'editorial_study_connection') errors.push('Invalid career/pathway relationship')
  }
  return errors
}
