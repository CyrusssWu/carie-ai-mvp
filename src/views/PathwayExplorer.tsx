import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { BottomSheet, Card, Page, PrimaryButton, SecondaryButton, Tag } from '../components/UI'
import { AcademicStartingPoint } from '../components/AcademicStartingPoint'
import { MentorDiscussionButton } from '../components/MentorDiscussion'
import { useApp } from '../context/AppContext'
import { findCareer } from '../data/stories/catalog'
import { educationPathways, educationProgrammes, pathwaysForCareer, programmeStatus, requirementStatus, verificationLabels } from '../data/education/registry'
import { sourceById } from '../data/education/sources'
import { changeStepStatus, createPlanStep, planStatusLabels, planTemplates } from '../data/education/planning'
import type { EducationProgramme, PlanStatus } from '../types/education'
import type { NextStep } from '../types'

function SourceLinks({ ids }: { ids: string[] }) {
  return <ul className="space-y-2">{[...new Set(ids)].map(id => { const source = sourceById(id); return source ? <li key={id} className="text-sm"><a className="inline-flex min-h-11 items-center break-words text-indigo-700 underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><p className="text-xs leading-5 text-slate-500">{source.organisation} · 查閱 {source.accessedAt}{source.accessStatus === 'unavailable' ? ' · 本次未能讀取；資料待核實，可由教育局索引再查。' : ''}</p></li> : <li key={id}>資料待核實</li> })}</ul>
}
function ProgrammeDetails({ programme }: { programme: EducationProgramme }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(timer) }, [])
  const status = programmeStatus(programme, now)
  return <div className="space-y-4 text-sm leading-6"><Tag>{verificationLabels[status]}</Tag><h2 className="break-words text-xl font-bold">{programme.programmeName}</h2>
    <dl className="space-y-2">{[['院校', programme.institution], ['課程編號', programme.officialProgrammeCode ?? '不適用／待核實'], ['學歷類別', programme.qualificationLevel], ['申請渠道', programme.applicationChannel], ['適用入學學年', programme.admissionYear], ['最後核對日期', programme.lastVerifiedAt], ['下次覆核期限', programme.reviewBy]].map(([label, value]) => <div key={label}><dt className="font-bold">{label}</dt><dd>{value}</dd></div>)}</dl>
    {status === 'outdated' && <p role="status" className="rounded-xl bg-amber-50 p-3">請查看最新官方要求。以下是已超過覆核期限或入學周期的歷史摘要，不能當作當前要求。</p>}
    {(['generalEntranceRequirements', 'programmeSpecificRequirements', 'otherConditions'] as const).map((key, index) => { const requirement = programme[key]; const fieldStatus = requirementStatus(requirement, programme); return <section key={key}><h3 className="font-bold">{['一般入學要求', '課程特定要求', '其他條件'][index]} · {requirement.admissionYear}</h3><p>{fieldStatus === 'needs_review' ? '尚未核實，請參閱官方網站。' : requirement.text}</p><p className="text-xs text-slate-500">{verificationLabels[status === 'outdated' ? 'outdated' : fieldStatus]}</p><SourceLinks ids={requirement.sourceIds}/></section> })}
    <p>以上為編輯摘要，並非院校正式譯本或完整招生章程。</p><p className="font-semibold">符合最低入學要求不代表保證獲取錄。</p><p>請以院校及招生機構公布的最新資料為準。</p><SourceLinks ids={programme.sourceIds}/>
  </div>
}
function PlanEditor({ step, onChange, onDelete }: { step: NextStep; onChange: (step: NextStep) => void; onDelete: () => void }) {
  const [title, setTitle] = useState(step.title), [description, setDescription] = useState(step.description ?? '')
  useEffect(() => { setTitle(step.title); setDescription(step.description ?? '') }, [step.title, step.description])
  return <Card><p className="mb-3 text-xs text-indigo-700">{educationPathways.find(p => p.id === step.relatedPathwayId)?.titleZh ?? '升學探索'} · 已連結這次體驗</p><label className="block text-sm font-bold">行動名稱<input aria-label="行動名稱" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} className="my-2 min-h-11 w-full rounded-xl border p-3"/></label><label className="block text-sm">行動說明<textarea aria-label="行動說明" value={description} maxLength={600} onChange={e => setDescription(e.target.value)} className="my-2 w-full rounded-xl border p-3"/></label>
    <PrimaryButton disabled={!title.trim()} onClick={() => onChange({ ...step, title: title.trim(), description: description.trim() || undefined })}>儲存行動修改</PrimaryButton>
    <label className="mt-3 block text-sm font-bold">行動狀態<select aria-label="行動狀態" className="my-2 min-h-11 w-full rounded-xl border p-3" value={step.status ?? 'not_started'} onChange={e => onChange(changeStepStatus(step, e.target.value as PlanStatus))}>{Object.entries(planStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    {step.officialSourceUrl && <a href={step.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-indigo-700 underline">查閱這項行動的官方資料 ↗</a>}
    <SecondaryButton onClick={onDelete}>移除此行動</SecondaryButton>
  </Card>
}

export default function PathwayExplorer() {
  const { careerId = '' } = useParams(), [search] = useSearchParams()
  const { passport, profile, editPassportEntry, storageError } = useApp()
  const career = findCareer(careerId), paths = pathwaysForCareer(careerId)
  const entryId = search.get('entry'), entry = passport.find(e => e.id === entryId && e.careerId === careerId)
  const [programmeId, setProgrammeId] = useState<string | null>(null)
  const [pathwayId, setPathwayId] = useState('hk-bachelor'), [templateId, setTemplateId] = useState('requirements')
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const tick = () => setNow(new Date()); const timer = window.setInterval(tick, 60_000); window.addEventListener('focus', tick); return () => { window.clearInterval(timer); window.removeEventListener('focus', tick) } }, [])
  const programme = educationProgrammes.find(p => p.id === programmeId)
  const routeKey = careerId + ':' + entryId
  useEffect(() => { setProgrammeId(null); setPathwayId('hk-bachelor'); setTemplateId('requirements'); setNotice('') }, [routeKey])
  if (!career || !paths.length || (entryId && !entry)) return <Page><AppHeader back title="探索升學路線"/><Card><h1 className="text-xl font-bold">找不到對應的體驗或升學路線</h1><p className="my-4">記錄可能已刪除，或連結不完整。請從 Passport 選擇一條已保存的體驗。</p><Link to="/passport" className="inline-flex min-h-11 items-center text-indigo-700 underline">返回 Career Passport</Link></Card></Page>
  if (!entry) return <Page><AppHeader back title="探索升學路線"/><h1 className="text-2xl font-bold">選擇一條 {career.title} 體驗</h1><p className="my-4">探索計劃會儲存在你選定的體驗中。</p>{passport.filter(e => e.careerId === careerId).map(e => <Link key={e.id} className="my-3 block rounded-2xl border p-4" to={`/pathways/${careerId}?entry=${encodeURIComponent(e.id)}`}>{e.storyTitle} · {new Date(e.dateCompleted).toLocaleDateString('zh-HK')}</Link>)}<Link to="/passport" className="inline-flex min-h-11 items-center underline">返回 Passport，先保存一次體驗</Link></Page>
  const saveSteps = (nextSteps: NextStep[]) => setNotice(editPassportEntry(entry.id, { nextSteps }) ? '探索計劃已存入這次 Career Passport 體驗。' : '目前未能保存，請保留此頁並重試。')
  const ownSteps = entry.nextSteps.filter(s => s.relatedCareerId === careerId && s.relatedPathwayId)
  return <Page className="space-y-5"><AppHeader back title="探索升學路線"/><h1 className="text-3xl font-black">探索我的升學路線</h1>
    <Card><Tag>{entry.career}</Tag><h2 className="mt-3 text-xl font-bold">{entry.storyTitle}</h2><p className="mt-3 text-sm">你在這次故事中曾嘗試：</p><ul className="mt-2 space-y-3 text-sm leading-6">{entry.behaviourEvidence.map(e => <li key={e.id}><b>{e.behaviour}</b>：{e.evidence}</li>)}</ul>{!entry.behaviourEvidence.length && <p>這條舊記錄未保存行為證據；仍可探索路線。</p>}</Card>
    <p className="text-sm leading-6 text-slate-600">以下是值得了解的選項，你可以自由比較。修讀相關學科不代表必然獲得某項工作，也不表示系統判定你適合哪條路線。</p>
    <h2 className="text-xl font-bold">可以探索的路線</h2>
    {paths.map(({ pathway, relationship, programmes }) => <Card key={pathway.id}><h3 className="text-xl font-bold">{pathway.titleZh}</h3><p className="mt-1 text-xs text-slate-500">{pathway.title}</p><p className="my-3 text-sm leading-6">{pathway.description}</p><details><summary className="min-h-11 cursor-pointer py-3 font-semibold text-indigo-700">了解這條路線</summary><div className="space-y-3 text-sm leading-6"><p>可能的下一階段：{pathway.progressionOptions.join(' ')}</p><p>學習查詢方向：{relationship.fields.join('、')}</p><p className="text-slate-600">{relationship.explanation}</p><p className="rounded-xl bg-amber-50 p-3">路線類別參考教育局資料；具體課程與銜接條件須逐項核實。{!programmes.length && '目前沒有已核實的當屆具體課程，請使用官方入口查詢。'}</p><SourceLinks ids={pathway.sourceIds}/>{programmes.map(p => <div key={p.id} className="space-y-2 rounded-xl border p-3"><Tag>{verificationLabels[programmeStatus(p, now)]}</Tag><p className="break-words font-bold">{p.programmeName}</p><p>{p.institution} · {p.admissionYear}</p><SecondaryButton onClick={() => setProgrammeId(p.id)}>查看課程要求</SecondaryButton></div>)}</div></details></Card>)}
    <details className="carie-card rounded-3xl p-5"><summary className="min-h-11 cursor-pointer font-bold">官方查詢入口與資料狀態</summary><SourceLinks ids={['edb-links', 'edb-study', 'jupas', 'vtc', 'ipass', 'eapp', 'enavigator']}/><p className="mt-3 text-sm">連結會開啟外部官方網站；Carie 不會把你的選填資料附加到網址。外部網站有自己的私隱政策。</p></details>
    <AcademicStartingPoint/>
    <section className="space-y-4" aria-label="我的探索計劃"><h2 className="text-xl font-bold">建立我的探索計劃</h2><p className="text-sm text-slate-600">只儲存你主動選擇的行動。請勿填寫真實姓名、學校或其他敏感資料。</p>
      <label className="block text-sm font-bold">想先了解的路線<select aria-label="想先了解的路線" className="mt-2 min-h-11 w-full rounded-xl border p-3" value={pathwayId} onChange={e => setPathwayId(e.target.value)}>{paths.map(p => <option key={p.pathway.id} value={p.pathway.id}>{p.pathway.titleZh}</option>)}</select></label>
      <label className="block text-sm font-bold">我的下一步<select aria-label="我的下一步" className="mt-2 min-h-11 w-full rounded-xl border p-3" value={templateId} onChange={e => setTemplateId(e.target.value)}>{planTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      <p className="text-sm">{planTemplates.find(t => t.id === templateId)?.description}</p>
      <PrimaryButton onClick={() => { const path = paths.find(p => p.pathway.id === pathwayId); const source = path?.programmes[0]?.officialUrl ?? sourceById(path?.pathway.sourceIds[0] ?? '')?.url; const step = createPlanStep(careerId, pathwayId, templateId, source); if (!step) return; if (entry.nextSteps.some(s => s.id === step.id)) { setNotice('這項行動已在這次體驗中，請在下方修改。'); return } saveSteps([...entry.nextSteps, step]) }}>將行動存入 Passport</PrimaryButton>
      <p role="status" className="text-sm text-slate-600">{storageError ? '目前有未保存的修改，請使用頁首的重試功能。' : notice}</p>
      {!ownSteps.length && <p className="text-sm text-slate-500">尚未選擇升學探索行動。你可以稍後再回來。</p>}
      {ownSteps.map(step => <PlanEditor key={step.id} step={step} onChange={updated => saveSteps(entry.nextSteps.map(s => s.id === step.id ? updated : s))} onDelete={() => saveSteps(entry.nextSteps.filter(s => s.id !== step.id))}/>)}</section>
    <MentorDiscussionButton key={routeKey} entry={entry} academic={profile.academicStartingPoint}/>
    <Link to="/passport" className="flex min-h-11 items-center justify-center rounded-2xl border bg-white p-3 font-bold">返回 Career Passport</Link>
    <BottomSheet open={!!programme} onClose={() => setProgrammeId(null)} title="課程要求與官方來源">{programme && <ProgrammeDetails programme={programme}/>}</BottomSheet>
  </Page>
}
