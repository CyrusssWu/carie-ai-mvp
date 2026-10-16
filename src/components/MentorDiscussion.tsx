import { useState } from 'react'
import type { PassportEntry } from '../types'
import type { AcademicStartingPoint } from '../types/education'
import { defaultMentorSelection, mentorSummary, type MentorSelection } from '../data/education/planning'
import { BottomSheet, PrimaryButton, SecondaryButton } from './UI'

const labels: Record<keyof MentorSelection, string> = { experience: '職業體驗', evidence: '行為證據', plan: '探索計劃及討論問題', academic: '選填學業起點', reflection: '反思（預設不包含）' }
export function MentorDiscussion({ entry, academic }: { entry: PassportEntry; academic?: AcademicStartingPoint }) {
  const [selection, setSelection] = useState(defaultMentorSelection)
  const [confirmed, setConfirmed] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const text = mentorSummary(entry, academic, selection)
  const consentKey = JSON.stringify({ selection, text })
  const ready = confirmed === consentKey && !!text
  return <div className="space-y-4"><p className="text-sm leading-6">你可以問：「我可以如何比較不同升學路線？」或「哪些要求需要向院校再確認？」先選擇你願意包含的內容，再確認摘要。這裡不會聯絡或傳送資料給導師。</p>
    <fieldset><legend className="mb-2 font-bold">我願意包含</legend>{Object.entries(labels).map(([key, label]) => <label key={key} className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={selection[key as keyof MentorSelection]} onChange={e => { setSelection(s => ({ ...s, [key]: e.target.checked })); setConfirmed(null); setNotice('') }}/>{label}</label>)}</fieldset>
    <div data-mentor-preview className="whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm leading-6">{text || '尚未選擇摘要內容。'}</div>
    <PrimaryButton disabled={!text} onClick={() => { setConfirmed(consentKey); setNotice('已確認內容。你可自行複製，系統沒有傳送任何資料。') }}>確認摘要內容</PrimaryButton>
    {ready && <><label className="block text-sm">可手動複製的已確認摘要<textarea aria-label="可手動複製的已確認摘要" readOnly value={text} rows={7} className="mt-2 w-full rounded-xl border p-3"/></label><SecondaryButton onClick={async () => { try { await navigator.clipboard.writeText(text); setNotice('已複製到剪貼板。尚未傳送給任何人。') } catch { setNotice('無法使用剪貼板，請在文字框中手動選取複製。') } }}>複製已確認摘要</SecondaryButton></>}
    <p role="status" className="text-sm text-slate-600">{notice}</p>
  </div>
}
export function MentorDiscussionButton({ entry, academic }: { entry: PassportEntry; academic?: AcademicStartingPoint }) {
  const [open, setOpen] = useState(false)
  return <><SecondaryButton onClick={() => setOpen(true)}>和老師或導師討論</SecondaryButton><BottomSheet open={open} onClose={() => setOpen(false)} title="準備與老師或導師討論" centered>{open && <MentorDiscussion entry={entry} academic={academic}/>}</BottomSheet></>
}
