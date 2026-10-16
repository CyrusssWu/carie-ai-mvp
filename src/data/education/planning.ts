import type { NextStep, PassportEntry } from '../../types'
import type { AcademicStartingPoint, PlanStatus } from '../../types/education'
import { reflectionLines } from '../reflection'
import { educationPathways, isOfficialEducationUrl } from './registry'
export const schoolLevels = { S4: '中四 S4', S5: '中五 S5', S6: '中六 S6', prefer_not_to_say: '不想透露' }
export const supportSubjects = ['中文', '英文', '數學', '科學', '商業／經濟', '人文', '其他']
export const helpOptions = ['了解不同升學路線', '查詢課程要求', '改善某一科的學習方法', '找到短期探索活動', '與老師或導師討論']
export const planStatusLabels: Record<PlanStatus, string> = { not_started: '未開始', in_progress: '進行中', completed: '已完成' }
export function restoreAcademic(value: unknown): AcademicStartingPoint | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const raw = value as Record<string, unknown>
  return {
    schoolLevel: typeof raw.schoolLevel === 'string' && Object.hasOwn(schoolLevels, raw.schoolLevel) ? raw.schoolLevel as AcademicStartingPoint['schoolLevel'] : undefined,
    supportSubjects: [...new Set(Array.isArray(raw.supportSubjects) ? raw.supportSubjects.filter((s): s is string => typeof s === 'string' && supportSubjects.includes(s)) : [])].slice(0, 3),
    helpWith: typeof raw.helpWith === 'string' && helpOptions.includes(raw.helpWith) ? raw.helpWith : undefined,
  }
}
export function restorePlanFields(raw: Record<string, unknown>): Partial<NextStep> {
  const pathway = educationPathways.find(p => p.id === raw.relatedPathwayId && p.relatedCareerIds.includes(raw.relatedCareerId as string))
  if (!pathway || typeof raw.createdAt !== 'string' || !Number.isFinite(Date.parse(raw.createdAt))) return {}
  return { relatedCareerId: raw.relatedCareerId as string, relatedPathwayId: pathway.id, createdAt: new Date(raw.createdAt).toISOString(),
    status: raw.completed === true ? 'completed' : raw.status === 'in_progress' ? 'in_progress' : 'not_started',
    officialSourceUrl: isOfficialEducationUrl(raw.officialSourceUrl) ? raw.officialSourceUrl : undefined }
}
export function stepStatusLabel(step: NextStep) { return step.completed ? '已完成' : step.status === 'in_progress' ? '進行中' : step.status ? '未開始' : '未完成' }
export function changeStepStatus(step: NextStep, status: PlanStatus): NextStep {
  return { ...step, ...(step.relatedPathwayId ? { status } : {}), completed: status === 'completed', completedAt: status === 'completed' ? step.completedAt ?? new Date().toISOString() : undefined }
}
export const planTemplates = [
  { id: 'requirements', title: '查看官方入學要求', description: '記下適用學年，分開核對一般要求與課程特定要求。' },
  { id: 'compare', title: '比較兩種升學路線', description: '比較課程內容、學習方式和下一階段；把未清楚的地方帶去問老師。' },
  { id: 'support', title: '和老師討論學習準備', description: '自己選擇想談的科目或問題，一起想一個可以嘗試的小步驟。' },
  { id: 'activity', title: '查詢體驗活動或校園開放日', description: '從官方網站查核活動日期、參加條件及報名方式。' },
  { id: 'progression', title: '了解高級文憑的進修路線', description: '核實個別銜接課程的要求、學分及申請渠道。' },
]
export function createPlanStep(careerId: string, pathwayId: string, templateId: string, officialSourceUrl?: string): NextStep | undefined {
  const template = planTemplates.find(t => t.id === templateId)
  const pathway = educationPathways.find(p => p.id === pathwayId && p.relatedCareerIds.includes(careerId))
  if (!template || !pathway) return undefined
  return { id: `pathway:${careerId}:${pathwayId}:${templateId}`, title: template.title, description: template.description, relatedCareerId: careerId, relatedPathwayId: pathwayId,
    completed: false, status: 'not_started', createdAt: new Date().toISOString(), officialSourceUrl: isOfficialEducationUrl(officialSourceUrl) ? officialSourceUrl : undefined }
}
export type MentorSelection = { experience: boolean; evidence: boolean; plan: boolean; academic: boolean; reflection: boolean }
export const defaultMentorSelection: MentorSelection = { experience: false, evidence: false, plan: false, academic: false, reflection: false }
export function mentorSummary(entry: PassportEntry, academic: AcademicStartingPoint | undefined, selection: MentorSelection): string {
  const lines: string[] = []
  if (selection.experience) lines.push(`我想討論這次 ${entry.career} 體驗：${entry.storyTitle}`)
  if (selection.evidence) lines.push('我曾嘗試的行為：', ...entry.behaviourEvidence.map(e => `${e.behaviour}：${e.evidence}`))
  if (selection.plan) {
    const actions = entry.nextSteps.filter(s => s.relatedCareerId === entry.careerId && s.relatedPathwayId)
    lines.push('我的探索計劃：', ...(actions.length ? actions.map(s => `${s.title}（${stepStatusLabel(s)}）${s.description ? '：' + s.description : ''}`) : ['尚未選擇行動。']))
    for (const id of new Set(actions.map(s => s.relatedPathwayId))) {
      const pathway = educationPathways.find(p => p.id === id)
      if (pathway) lines.push(`我想了解「${pathway.titleZh}」與其他路線的分別，以及需要向院校核實什麼？`)
    }
  }
  if (selection.academic) {
    lines.push('我自願提供的學業起點：')
    if (!academic) lines.push('尚未填寫。')
    else {
      if (academic.schoolLevel) lines.push(`目前階段：${schoolLevels[academic.schoolLevel]}`)
      if (academic.helpWith) lines.push(`我想獲得的幫助：${academic.helpWith}`)
      if (academic.supportSubjects.length) lines.push(`我想就${academic.supportSubjects.join('、')}尋求學習支持，可以和老師一起訂下什麼小步驟？`)
    }
  }
  if (selection.reflection) lines.push('我選擇分享的反思：', ...reflectionLines(entry.reflection))
  return lines.join('\n')
}
