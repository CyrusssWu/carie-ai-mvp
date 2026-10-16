import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Card, Page, PrimaryButton, SecondaryButton } from '../components/UI'
import { useApp } from '../context/AppContext'
import type { PassportEntry } from '../types'
import { buildShareSections, defaultShareSettings } from '../data/share'

function ShareContent({ entry, nickname }: { entry: PassportEntry; nickname: string }) {
  const [settings, setSettings] = useState({ ...defaultShareSettings })
  const [generated, setGenerated] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState('')
  const text = useRef<HTMLTextAreaElement>(null)
  const sections = buildShareSections(entry, nickname, settings)
  const copy = async () => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      setCopyStatus('已複製摘要。你可以自行決定要不要傳給任何人。')
    } catch {
      setCopyStatus('無法自動複製。請選取下方文字，使用裝置的複製功能。')
      text.current?.focus(); text.current?.select()
    }
  }
  return <>
    <Card className="mt-6"><fieldset><legend className="font-bold">選擇摘要內容</legend><div className="mt-3 space-y-3">{([['experience', 'Career Experience'], ['evidence', 'Behaviour Evidence'], ['reflection', 'Reflection'], ['next', 'Next Steps']] as const).map(([key, label]) => <label key={key} className="flex min-h-11 cursor-pointer items-center justify-between gap-4"><span>{label}</span><input type="checkbox" checked={settings[key]} onChange={e => { setSettings(s => ({ ...s, [key]: e.target.checked })); setGenerated(null); setCopyStatus('') }} className="h-5 w-5 shrink-0 accent-indigo-600" /></label>)}</div></fieldset></Card>
    <h2 className="mt-6 mb-3 font-bold">分享摘要預覽</h2><Card><div data-share-preview className="space-y-4 whitespace-pre-wrap break-words">{sections.length ? sections.map(s => <section key={s.key} data-share-section={s.key}><h3 className="font-bold">{s.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{s.text}</p></section>) : <p className="text-sm text-slate-500">尚未選擇任何內容。</p>}</div></Card>
    <PrimaryButton className="mt-6" disabled={!sections.length} onClick={() => { setGenerated(sections.map(s => s.label + '\n' + s.text).join('\n\n')); setCopyStatus('') }}>建立分享摘要</PrimaryButton>
    {generated !== null && <Card className="mt-4"><h2 className="font-bold">最終預覽卡片</h2><p role="status" className="my-3 text-sm text-emerald-800">摘要已建立，只在這部裝置顯示，尚未傳送。</p><label htmlFor="final-share-text" className="text-sm font-medium">可手動選取的摘要文字</label><textarea ref={text} id="final-share-text" readOnly value={generated} rows={10} className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm" /><SecondaryButton className="mt-3" onClick={copy}>複製摘要</SecondaryButton>{copyStatus && <p role="status" className="mt-3 text-sm text-slate-600">{copyStatus}</p>}</Card>}
  </>
}

export default function SharePreview() {
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const { profile, passport } = useApp()
  const requested = params.get('entry')
  const entry = requested ? passport.find(e => e.id === requested) : passport[0]
  return <Page><AppHeader back title="分享預覽" /><h1 className="text-3xl font-black">分享之前，由你決定。</h1><p className="mt-3 text-slate-600">Carie 不會自動把你的資料傳送給老師或導師。</p>
    {!entry ? <Card className="mt-6"><p>{requested ? '找不到這條體驗記錄，請返回 Passport 重新選擇。' : '還沒有可分享的 Career Passport 記錄。'}</p></Card> : <>
      <label htmlFor="share-entry" className="mt-6 block font-bold">選擇要分享的體驗</label><select id="share-entry" value={entry.id} onChange={e => setParams({ entry: e.target.value })} className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3">{passport.map((e, i) => <option key={e.id} value={e.id}>{e.career} · 第 {passport.length - i} 次體驗 · {new Date(e.dateCompleted).toLocaleDateString('zh-HK')}</option>)}</select>
      <ShareContent key={entry.id} entry={entry} nickname={profile.nickname} />
    </>}
    <SecondaryButton className="mt-3" onClick={() => nav('/passport')}>返回修改</SecondaryButton><p className="mt-5 text-xs leading-5 text-slate-500">分享內容完全由你決定。只有按下「複製摘要」才會使用剪貼板；本版本沒有寄送或上傳功能。</p>
  </Page>
}



