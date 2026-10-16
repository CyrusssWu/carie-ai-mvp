import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Page, PrimaryButton, SecondaryButton } from '../components/UI'
import { NextStepsEditor } from '../components/NextStepsEditor'
import { useApp } from '../context/AppContext'
import { storyForRun, actionsForStory } from '../data/stories/catalog'

export default function NextSteps() {
  const nav = useNavigate()
  const { nextSteps, setNextSteps, saveExperience, storageError, storyProgress } = useApp()
  const story = storyForRun(storyProgress)!
  return <Page><AppHeader back title="下一步" /><h1 className="text-3xl font-black">接下來，你想怎樣繼續探索？</h1>
    <p className="my-5 text-slate-600">選一個或多個你想嘗試的行動，也可以稍後再決定。這些是探索建議，不是職業結論。</p>
    <NextStepsEditor suggestions={actionsForStory(story.id, story.version)} value={nextSteps} onChange={setNextSteps} />
    <p role="status" className="mt-4 text-sm text-slate-500">{storageError ? '目前未能儲存到這部裝置。' : '選擇與行動狀態會保存在這次體驗中。'}</p>
    <PrimaryButton className="mt-6" onClick={() => { if (saveExperience()) nav('/passport', { state: { saved: true } }) }}>存入 Career Passport</PrimaryButton>
    <SecondaryButton className="mt-3" onClick={() => nav(`/story/${story.id}/reflection`)}>返回修改反思</SecondaryButton>
  </Page>
}

