import { useState } from 'react'
import { changeStepStatus, stepStatusLabel } from '../data/education/planning'
import { pathwaysForCareer } from '../data/education/registry'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Card, Page, PrimaryButton, SecondaryButton, Tag } from '../components/UI'
import { ReflectionSummary } from '../components/ReflectionSummary'
import { ReflectionForm } from '../components/ReflectionForm'
import { NextStepsEditor } from '../components/NextStepsEditor'
import { useApp } from '../context/AppContext'
import { storyForRun, actionsForStory, findStory } from '../data/stories/catalog'
import { DataManagement, DeleteExperienceButton } from '../components/DataManagement'

export default function Passport() {
  const nav = useNavigate()
  const location = useLocation()
  const { passport, storageError, editPassportEntry, storyProgress, startNewStory } = useApp()
  const [editingReflection, setEditingReflection] = useState<string | null>(null)
  const [editingActions, setEditingActions] = useState<string | null>(null)
  const story = storyForRun(storyProgress)!
  const start = () => { if (storyProgress.completed && !startNewStory(story.id)) return; nav('/story/setup/' + story.careerId) }
  return <Page><AppHeader back title="Career Passport" />
    {location.state?.saved && !storageError && <p role="status" className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">已存入 Career Passport，記錄只保留在這部裝置。</p>}
    <h1 className="text-3xl font-black">Career Passport</h1><p className="mt-2 text-slate-600">你嘗試過什麼，比一個標籤更重要。</p>
    {passport.length === 0 ? <Card className="mt-6 text-center"><p className="mb-4 text-slate-600">你的 Passport 還是空的。</p><PrimaryButton onClick={start}>開始第一次職業體驗</PrimaryButton></Card> :
      <div className="mt-6 space-y-4">{passport.map((entry, index) => <details key={entry.id} data-entry-id={entry.id} className="carie-card rounded-3xl p-5">
        <summary className="min-h-11 cursor-pointer rounded-lg"><span className="text-xs font-bold text-indigo-600">{entry.career} · 第 {passport.length - index} 次體驗</span><h2 className="mt-2 text-xl font-black">{entry.storyTitle}</h2><p className="mt-1 text-xs text-slate-500">{new Date(entry.dateCompleted).toLocaleDateString('zh-HK')}</p><div className="mt-3 flex flex-wrap gap-2">{Array.from(new Set(entry.behaviourEvidence.map(e => e.behaviour))).map(t => <Tag key={t}>{t}</Tag>)}</div><p className="mt-3 text-sm text-slate-600">下一步：{entry.nextSteps.length ? `${entry.nextSteps.filter(s => s.completed).length} / ${entry.nextSteps.length} 項已完成` : '尚未選擇行動'}</p></summary>
        <div className="mt-5 space-y-5">
          <section><h3 className="font-bold">這次的真實選擇</h3>{entry.legacyIncomplete && <p className="mt-2 text-sm text-amber-800">這是舊版記錄，未完整保存逐項選擇。已保留原有證據與反思，不會替你補造決定。</p>}
            <ol className="mt-3 space-y-4">{entry.decisions.map((d, i) => <li key={d.decisionId} data-saved-decision={d.decisionId}><p className="text-sm font-semibold">Decision {i + 1} · {d.phase}</p><p className="mt-1 text-sm">{d.scenario}</p><p className="mt-2 text-sm text-slate-600">你的選擇：{d.selectedLabel}</p><p className="mt-2 text-sm text-slate-600">發生了：{d.consequence}</p></li>)}</ol>
          </section>
          <section><h3 className="font-bold">Behaviour Evidence</h3><div className="mt-3 space-y-3">{entry.behaviourEvidence.map(e => <div key={e.id}><b className="text-sm">{e.behaviour}</b><p className="mt-1 text-sm text-slate-600">{e.evidence}</p>{entry.decisions.some(d => d.decisionId === e.sourceDecisionId) && <p className="text-xs text-slate-500">來自 Decision {entry.decisions.findIndex(d => d.decisionId === e.sourceDecisionId) + 1}</p>}</div>)}</div></section>
          <section><h3 className="font-bold">我的反思</h3>{editingReflection === entry.id ? <><div className="mt-3"><ReflectionForm value={entry.reflection} onChange={reflection => editPassportEntry(entry.id, { reflection })} /></div><button type="button" className="mt-3 w-full py-3 text-sm text-indigo-700" onClick={() => editPassportEntry(entry.id, { reflection: {} })}>清除這條記錄的反思</button><SecondaryButton className="mt-3" onClick={() => setEditingReflection(null)}>完成反思修改</SecondaryButton></> : <><ReflectionSummary reflection={entry.reflection} /><SecondaryButton className="mt-3" onClick={() => setEditingReflection(entry.id)}>修改反思</SecondaryButton></>}</section>
          <section><h3 className="font-bold">我想再探索</h3>{editingActions === entry.id ? <><div className="mt-3"><NextStepsEditor suggestions={actionsForStory(entry.storyId, entry.storyVersion)} value={entry.nextSteps} onChange={nextSteps => editPassportEntry(entry.id, { nextSteps })} /></div><SecondaryButton className="mt-3" onClick={() => setEditingActions(null)}>完成行動修改</SecondaryButton></> : <><div className="mt-2 space-y-3">{entry.nextSteps.map(s => <div key={s.id}><label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 shrink-0 accent-indigo-600" aria-label={s.title + '：已完成'} checked={s.completed} onChange={e => editPassportEntry(entry.id, { nextSteps: entry.nextSteps.map(step => step.id === s.id ? changeStepStatus(step, e.target.checked ? 'completed' : 'not_started') : step) })} /><span className="text-sm">{s.title} · {stepStatusLabel(s)}</span></label>{s.targetDate && <p className="text-xs text-slate-500">預計完成：{s.targetDate}</p>}{s.completedAt && <p className="text-xs text-slate-500">完成於 {new Date(s.completedAt).toLocaleDateString('zh-HK')}</p>}</div>)}</div>{!entry.nextSteps.length && <p className="mt-2 text-sm text-slate-500">你可以稍後選擇下一步。</p>}<SecondaryButton className="mt-3" onClick={() => setEditingActions(entry.id)}>選擇或修改行動</SecondaryButton></>}</section>
          {(editingReflection === entry.id || editingActions === entry.id) && <p role="status" className="text-sm text-slate-500">{storageError ? '目前未能儲存，請保留此頁。' : '修改會自動保存在這條記錄。'}</p>}
          {pathwaysForCareer(entry.careerId).length > 0 && <SecondaryButton onClick={() => nav('/pathways/' + entry.careerId + '?entry=' + encodeURIComponent(entry.id))}>探索升學路線</SecondaryButton>}
          <PrimaryButton onClick={() => nav('/share?entry=' + encodeURIComponent(entry.id))}>預覽分享這次體驗</PrimaryButton>
          {findStory(entry.storyId) && <SecondaryButton onClick={() => { if (startNewStory(entry.storyId)) nav('/story/setup/' + entry.careerId) }}>再次體驗這個故事</SecondaryButton>}
          <DeleteExperienceButton entryId={entry.id} title={entry.storyTitle} />
        </div>
      </details>)}</div>}
    {passport.length > 0 && <SecondaryButton className="mt-6" onClick={start}>{storyProgress.completed ? '開始另一次職業體驗' : '繼續目前體驗'}</SecondaryButton>}
    <SecondaryButton className="mt-3" onClick={() => nav('/ideas')}>探索其他職業</SecondaryButton>
    <DataManagement />
    <p className="my-6 text-sm text-slate-500">這些記錄只保存在目前的瀏覽器。清除網站資料後將無法恢復。</p>
  </Page>
}


