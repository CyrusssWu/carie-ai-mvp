import { useApp } from '../context/AppContext'
import { helpOptions, schoolLevels, supportSubjects } from '../data/education/planning'
import { SecondaryButton } from './UI'
import type { AcademicStartingPoint as StartingPoint } from '../types/education'

export function AcademicStartingPoint() {
  const { profile, setProfile, storageError } = useApp()
  const value = profile.academicStartingPoint
  const update = (patch: Partial<StartingPoint>) => setProfile(p => ({ ...p, academicStartingPoint: { supportSubjects: [], ...p.academicStartingPoint, ...patch } }))
  return <details className="carie-card rounded-3xl p-5"><summary className="min-h-11 cursor-pointer font-bold">我的學業起點（可跳過）</summary>
    <p className="my-3 text-sm leading-6 text-slate-600">這是你主動選擇的支持需要，不用填成績。完全不填也能建立計劃。只存於這個瀏覽器，可修改或刪除。</p>
    <label className="block text-sm font-bold">目前階段<select aria-label="目前階段" className="my-2 min-h-11 w-full rounded-xl border p-3" value={value?.schoolLevel ?? ''} onChange={e => update({ schoolLevel: e.target.value as StartingPoint['schoolLevel'] || undefined })}><option value="">暫不填寫</option>{Object.entries(schoolLevels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <fieldset><legend className="my-2 font-bold">想獲得支持的科目（0–3 項）</legend>{supportSubjects.map(subject => <label key={subject} className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={value?.supportSubjects.includes(subject) ?? false} disabled={!value?.supportSubjects.includes(subject) && (value?.supportSubjects.length ?? 0) >= 3} onChange={e => update({ supportSubjects: e.target.checked ? [...(value?.supportSubjects ?? []), subject] : value?.supportSubjects.filter(s => s !== subject) ?? [] })}/>{subject}</label>)}</fieldset>
    <label className="mt-4 block text-sm font-bold">什麼最能幫助我？<select aria-label="什麼最能幫助我？" className="my-2 min-h-11 w-full rounded-xl border p-3" value={value?.helpWith ?? ''} onChange={e => update({ helpWith: e.target.value || undefined })}><option value="">暫不填寫</option>{helpOptions.map(help => <option key={help}>{help}</option>)}</select></label>
    <SecondaryButton className="mt-3" onClick={() => setProfile(p => { const next = { ...p }; delete next.academicStartingPoint; return next })}>刪除學業起點資料</SecondaryButton>
    <p role="status" className="mt-3 text-sm text-slate-600">{storageError ? '目前未能保存，請使用頁首的重試功能。' : value ? '你的選填資料已保存在此瀏覽器。' : '未保存學業起點；你可以繼續探索。'}</p>
  </details>
}
