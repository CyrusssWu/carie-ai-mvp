import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Card, Page, PrimaryButton, Tag } from '../components/UI'
import { storyForRun } from '../data/stories/catalog'
import { getStoryRecords } from '../data/stories/storyRecords'
import { useApp } from '../context/AppContext'

export default function Recap() {
  const nav = useNavigate()
  const { storyProgress } = useApp()
  const story = storyForRun(storyProgress)!
  const records = getStoryRecords(story, storyProgress.choices)
  const evidence = records.flatMap(({ option }) => option.evidence)
  const unique = Array.from(new Map(evidence.map(e => [e.behaviour + '|' + e.evidence, e])).values())
  return <Page>
    <AppHeader back title="故事回顧" />
    <h1 className="text-3xl font-black">你完成了一次職業體驗。</h1>
    <p className="mt-2 text-slate-600">{story.career} · {story.title}</p>
    <div className="mt-6 space-y-3">{records.map(({ decision, option, index }) =>
      <Card key={decision.id}>
        <article data-decision-id={decision.id} data-option-id={option.id}>
          <div className="text-xs font-bold text-indigo-600">Decision {index + 1} · {decision.phase}</div>
          <p className="mt-2 font-bold">{decision.scenario}</p>
          <p className="mt-3 text-sm text-slate-600"><b>你的選擇：</b><span data-recap-choice>{option.label}</span></p>
          <p className="mt-2 text-sm text-slate-500"><b>發生了：</b>{option.consequence}</p>
          <p className="mt-2 text-sm text-slate-500"><b>{option.handoff.nextDecisionId ? '故事接著：' : '這輪交接：'}</b>{option.handoff.narrative}</p>
        </article>
      </Card>
    )}</div>
    <h2 className="mt-8 text-xl font-black">這次故事中，你嘗試過的工作方式</h2>
    <div className="mt-4 space-y-3">{unique.map(e => <Card key={e.behaviour + '|' + e.evidence}><Tag>{e.behaviour}</Tag><p className="mt-3 text-sm leading-6 text-slate-600">{e.evidence}</p></Card>)}</div>
    <div className="my-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">這些只是來自一次體驗的觀察，不代表你的固定能力。<br /><b>One story is not a verdict.</b></div>
    <PrimaryButton onClick={() => nav(`/story/${story.id}/reflection`)}>想想你的感受</PrimaryButton>
  </Page>
}
