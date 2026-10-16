import type { PassportEntry, ShareSettings } from '../types'
import { reflectionLines } from './reflection'
import { stepStatusLabel } from './education/planning'

export type { ShareSettings } from '../types'
export const defaultShareSettings: ShareSettings = { experience: true, evidence: true, reflection: false, next: false }
export function buildShareSections(entry: PassportEntry, nickname: string, settings: ShareSettings) {
  const sections: { key: keyof ShareSettings; label: string; text: string }[] = []
  if (settings.experience) sections.push({ key: 'experience', label: 'Career Experience', text: `${nickname.trim() || '這位學生'} 完成了一次 ${entry.career} 職業體驗。\n${entry.storyTitle}\n完成日期：${new Date(entry.dateCompleted).toLocaleDateString('zh-HK')}` })
  if (settings.evidence) sections.push({ key: 'evidence', label: 'Behaviour Evidence', text: entry.behaviourEvidence.map(e => `${e.behaviour}：${e.evidence}`).join('\n') || '這條記錄沒有保存行為證據。' })
  if (settings.reflection) sections.push({ key: 'reflection', label: 'Reflection', text: reflectionLines(entry.reflection).join('\n') || '這次沒有記錄特定感受。' })
  if (settings.next) sections.push({ key: 'next', label: 'Next Steps', text: entry.nextSteps.map(s => `${s.title} — ${stepStatusLabel(s)}${s.targetDate ? `（預計 ${s.targetDate}）` : ''}`).join('\n') || '目前沒有選定下一步行動。' })
  return sections
}
