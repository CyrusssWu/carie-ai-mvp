import { useId } from 'react'
import { changeStepStatus, stepStatusLabel } from '../data/education/planning'
import type { NextStep, ActionSuggestion } from '../types'
import { nextStepSuggestions } from '../data/nextSteps'
import { Card, Tag } from './UI'

export function NextStepsEditor({ value, onChange, suggestions = nextStepSuggestions }: { suggestions?: readonly ActionSuggestion[]; value: NextStep[]; onChange: (steps: NextStep[]) => void }) {
  const id = useId()
  const choices = [...suggestions, ...value.filter(s => !suggestions.some(c => c.id === s.id)).map(s => ({ ...s, category: '已保存的行動' }))]
  const update = (stepId: string, patch: Partial<NextStep>) => onChange(value.map(s => s.id === stepId ? { ...s, ...patch } : s))
  return <div className="space-y-4">{choices.map(s => {
    const selected = value.find(step => step.id === s.id)
    return <Card key={s.id}><Tag>{s.category}</Tag><label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3"><input type="checkbox" className="h-5 w-5 shrink-0 accent-indigo-600" checked={!!selected} onChange={e => onChange(e.target.checked ? [...value, { id: s.id, title: s.title, description: s.description, completed: false }] : value.filter(step => step.id !== s.id))} /><span className="font-bold">{s.title}</span></label><p className="mt-2 text-sm leading-6 text-slate-600">{s.description}</p>
      {selected && <div className="mt-3 space-y-2 border-t border-slate-100 pt-3"><label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={selected.completed} onChange={e => update(s.id, changeStepStatus(selected, e.target.checked ? 'completed' : 'not_started'))} aria-label={`${s.title}：已完成`} /><span>{stepStatusLabel(selected)}</span></label><label htmlFor={`${id}-${s.id}`} className="block text-sm text-slate-600">預計完成日期（可選）<input id={`${id}-${s.id}`} type="date" aria-label={`${s.title}：預計完成日期`} value={selected.targetDate ?? ''} onInput={e => update(s.id, { targetDate: e.currentTarget.value || undefined })} onChange={e => update(s.id, { targetDate: e.target.value || undefined })} className="mt-2 block min-h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white p-2" /></label>{selected.completedAt && <p className="text-xs text-slate-500">完成於 {new Date(selected.completedAt).toLocaleDateString('zh-HK')}</p>}</div>}
    </Card>
  })}</div>
}
