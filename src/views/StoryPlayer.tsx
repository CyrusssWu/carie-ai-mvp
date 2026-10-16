import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BottomSheet, Card, Page, PrimaryButton, SecondaryButton } from '../components/UI'
import { storyForRun } from '../data/stories/catalog'
import { getIncomingHandoff } from '../data/stories/storyRecords'
import { useApp } from '../context/AppContext'
import { transitionStory, type StoryAction } from '../context/storage'
import type { CareerStory } from '../types'
import './StoryPlayer.css'

const asset = (name: string) => `/assets/story/${name}`
const stateLabels = { decision: 'Make a decision', confirm: 'Your choice', consequence: 'What happened' }

function StoryIllustration({ story, consequence = false }: { story: CareerStory; consequence?: boolean }) {
  return <div className={`story-illustration ${consequence ? 'story-illustration--consequence' : ''}`}>
    <img className="story-setting" src={consequence ? story.presentation.consequenceImage : story.presentation.confirmationImage} alt="" />
    <img className="story-avatar" src={story.presentation.avatarImage} alt="" />
  </div>
}

export default function StoryPlayer() {
  const nav = useNavigate()
  const { storyProgress, setStoryProgress, storageError } = useApp()
  const story = storyForRun(storyProgress)!
  const [pause, setPause] = useState(false)
  const [vocab, setVocab] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const { stage } = storyProgress
  const index = Math.min(storyProgress.index, story.decisions.length - 1)
  const decision = story.decisions[index]
  const isLast = index === story.decisions.length - 1
  const existing = storyProgress.choices[decision.id]
  const option = decision.options.find(o => o.id === (stage === 'consequence' ? existing : storyProgress.selectedOptionId)) ?? null
  const vocabulary = decision.vocabulary ?? []
  const incomingHandoff = getIncomingHandoff(story, index, storyProgress.choices)
  const dispatch = (action: StoryAction) => setStoryProgress(p => transitionStory(p, action))
  useEffect(() => {
    window.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
  }, [storyProgress.index, stage])

  if (storyProgress.completed) return <Navigate to={`/story/${story.id}/recap`} replace />

  return <div className="story-surface"><Page className="story-player">
    <header className="story-navigation"><span className="story-brand">carie ai</span><span className="story-context">{stateLabels[stage]}</span></header>
    <div className="story-content">
      <div className="story-progress" role="progressbar" aria-label="故事進度" aria-valuemin={1} aria-valuemax={story.decisions.length} aria-valuenow={index + 1} aria-valuetext={`Decision ${index + 1} / ${story.decisions.length}`}>
        <p>Decision {index + 1} / {story.decisions.length}</p>
        <div className="story-progress-segments" aria-hidden="true">{story.decisions.map((d, i) => <span key={d.id} className={i <= index ? 'is-active' : ''} />)}</div>
      </div>
      {stage === 'decision' && <>
        <h1 ref={heading} tabIndex={-1}>{decision.scenario}</h1>
        <span className="story-context">{story.title} · {story.career}</span>
        <section aria-label="工作情境" className="space-y-3">
          <h2 className="font-semibold">{decision.phase}</h2>
          {incomingHandoff && <p className="story-caption" data-story-incoming>{incomingHandoff}</p>}
          <p className="story-body">{decision.workplaceContext}</p>
        </section>
        <div className="story-options" role="group" aria-label="選擇你的下一步">
          {decision.options.map(o => <button key={o.id} type="button" aria-pressed={option?.id === o.id} onClick={() => dispatch({ type: 'select', decisionId: decision.id, optionId: o.id })} className="story-option">
            <Card className={`story-choice ${option?.id === o.id ? 'is-selected' : ''}`}>
              <span className="story-choice-copy"><span className="story-choice-title">{o.label}</span><span className="story-caption">{o.description}</span></span>
              <img src={asset(option?.id === o.id ? 'selected.svg' : 'unselected.svg')} alt="" />
            </Card>
          </button>)}
        </div>
        {vocabulary.length > 0 && <SecondaryButton className="story-secondary" onClick={() => setVocab(true)}>詞彙幫助 · {vocabulary.map(v => v.term).join(' / ')}</SecondaryButton>}
        <p className="story-caption">選一個選項，再確認你的選擇。每個選擇都有取捨。</p>
      </>}
      {stage === 'confirm' && option && <>
        <h1 ref={heading} tabIndex={-1}>你決定：{option.label}</h1>
        <StoryIllustration story={story} />
        <Card className="story-choice is-selected"><span className="story-choice-copy"><span className="story-choice-title">{option.label}</span><span className="story-caption">這是你準備嘗試的下一步。</span></span><img src={asset('selected.svg')} alt="" /></Card>
        <p className="story-body">每個選擇都有不同的可能。準備好看看接下來會發生什麼嗎？</p>
        <p className="story-caption">{storageError ? '目前無法儲存到這部裝置。' : '這個選擇已暫存在這部裝置。'}揭曉結果前，你仍可以更改。</p>
      </>}
      {stage === 'consequence' && option && <>
        <h1 ref={heading} tabIndex={-1}>發生了什麼</h1>
        <StoryIllustration story={story} consequence />
        <span className="story-context">{story.presentation.settingLabel}</span>
        <p className="story-body">{option.consequence}</p>
        <Card className="story-evidence"><h2>你在這一步嘗試了：</h2>{option.evidence.map(e => <div key={e.behaviour} className="story-evidence-item"><span className="story-context">{e.behaviour}</span><p className="story-caption">{e.evidence}</p></div>)}</Card>
        <section aria-label="故事銜接" className="space-y-3"><h2 className="font-semibold">{isLast ? '這段體驗告一段落' : '接下來'}</h2><p className="story-body" data-story-handoff>{option.handoff.narrative}</p></section>
      </>}
    </div>
    <div className="story-actions">
      {stage === 'decision' && <PrimaryButton className="story-primary" disabled={!option} onClick={() => dispatch({ type: 'confirm', decisionId: decision.id })}>確認這個選擇</PrimaryButton>}
      {stage === 'confirm' && <><PrimaryButton className="story-primary" onClick={() => dispatch({ type: 'reveal', decisionId: decision.id })}>看看發生什麼</PrimaryButton><SecondaryButton className="story-secondary" onClick={() => dispatch({ type: 'change', decisionId: decision.id })}>返回更改</SecondaryButton></>}
      {stage === 'consequence' && <PrimaryButton className="story-primary" onClick={() => dispatch({ type: 'next', decisionId: decision.id })}>{isLast ? '完成故事' : '繼續'}</PrimaryButton>}
      <SecondaryButton className="story-secondary" onClick={() => setPause(true)}>暫停 / 離開</SecondaryButton>
    </div>
    <BottomSheet open={vocab} title={vocabulary.length === 1 ? vocabulary[0].term : '工作詞彙'} onClose={() => setVocab(false)} className="story-overlay story-vocabulary" headingIcon={<img src={asset('book.svg')} alt="" />} eyebrow={`詞彙幫助 · Decision ${index + 1} / ${story.decisions.length}`}>
      <div className="story-dialog-content">{vocabulary.map(v => <section key={v.id} className="space-y-4">{vocabulary.length > 1 && <h3>{v.term}</h3>}<p className="story-body">{v.zh}：{v.explanation}</p><p className="story-body story-example-label">舉個例子</p><p className="story-body">{v.example}</p></section>)}<PrimaryButton className="story-primary" onClick={() => setVocab(false)}>明白了，返回我的決定</PrimaryButton></div>
    </BottomSheet>
    <BottomSheet open={pause} centered title="想休息一下嗎？" onClose={() => setPause(false)} className="story-overlay story-pause" headingIcon={<img src={asset('pause.svg')} alt="" />} eyebrow="暫停故事">
      <div className="story-dialog-content"><p className="story-body">{storageError ? '目前無法儲存到這部裝置，重新載入可能遺失進度。' : '你的故事和選擇已保存在這部裝置。準備好時，可以從這個決定繼續。'}</p><span className="story-context">{story.career} 仍是你目前的探索方向</span><PrimaryButton className="story-primary" onClick={() => setPause(false)}>繼續故事</PrimaryButton><SecondaryButton className="story-secondary" onClick={() => nav('/home')}>{storageError ? '離開故事' : '儲存並離開'}</SecondaryButton><p className="story-caption">離開會返回 Home，不會完成故事，也不會新增 Career Passport 紀錄。</p></div>
    </BottomSheet>
  </Page></div>
}
