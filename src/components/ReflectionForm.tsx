import { useId } from 'react'
import type { ReflectionData } from '../types'
import { difficultOptions, engagingOptions, interestOptions } from '../data/reflection'
import { Card } from './UI'

export function ReflectionForm({ value, onChange }: { value: ReflectionData; onChange: (value: ReflectionData) => void }) {
  const id = useId()
  const textClass = 'mt-2 w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 focus:border-indigo-400'
  const chip = (selected: boolean) => `min-h-11 rounded-2xl px-3 py-2 text-sm ${selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`
  const multi = (key: 'engagingParts' | 'difficultParts', option: string) => {
    const selected = value[key] ?? []
    const next = selected.includes(option) ? selected.filter(x => x !== option) : option === '沒有特別感覺' ? [option] : [...selected.filter(x => x !== '沒有特別感覺'), option]
    onChange({ ...value, [key]: next })
  }
  return <div className="space-y-5">
    {([
      ['engagingParts', '哪一部分最讓你投入？', engagingOptions],
      ['difficultParts', '哪一部分最讓你感到困難或消耗精力？', difficultOptions],
    ] as const).map(([key, title, options]) => <Card key={key}><fieldset><legend className="font-bold">{title}</legend><p className="mt-2 text-xs text-slate-500">可選多項，也可以不選。</p><div className="mt-3 flex flex-wrap gap-2">{[...new Set([...options, ...(value[key] ?? [])])].map(option => <button type="button" key={option} aria-pressed={value[key]?.includes(option) ?? false} onClick={() => multi(key, option)} className={chip(value[key]?.includes(option) ?? false)}>{option}</button>)}</div>
      {key === 'difficultParts' && <label className="mt-4 block text-sm" htmlFor={`${id}-other`}>其他感受（可選）<textarea id={`${id}-other`} value={value.difficultOther ?? ''} onChange={e => onChange({ ...value, difficultOther: e.target.value })} rows={2} maxLength={2000} className={textClass} /></label>}
    </fieldset></Card>)}
    <Card><label className="block font-bold" htmlFor={`${id}-further`}>如果重新體驗這份工作，你會想更深入嘗試什麼？</label><p className="mt-2 text-xs text-slate-500">可寫一句話，也可以跳過。</p><textarea id={`${id}-further`} value={value.furtherExploration ?? ''} onChange={e => onChange({ ...value, furtherExploration: e.target.value })} rows={3} maxLength={2000} className={textClass} /></Card>
    <Card><fieldset><legend className="font-bold">你還想進一步探索這個職業嗎？</legend><div className="mt-3 flex flex-wrap gap-2">{[...new Set([...interestOptions, ...(value.interestToContinue ? [value.interestToContinue] : [])])].map(option => <button type="button" key={option} aria-pressed={value.interestToContinue === option} className={chip(value.interestToContinue === option)} onClick={() => onChange({ ...value, interestToContinue: value.interestToContinue === option ? undefined : option })}>{option}</button>)}</div></fieldset></Card>
    <Card><label className="block font-bold" htmlFor={`${id}-notes`}>還有什麼想記下來的嗎？</label><p className="mt-2 text-xs text-slate-500">可選。只記錄你想留下的體驗感受。</p><textarea id={`${id}-notes`} value={value.additionalNotes ?? ''} onChange={e => onChange({ ...value, additionalNotes: e.target.value })} rows={3} maxLength={2000} className={textClass} /></Card>
  </div>
}
