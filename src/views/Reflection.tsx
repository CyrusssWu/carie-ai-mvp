import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Page, PrimaryButton, SecondaryButton } from '../components/UI'
import { ReflectionForm } from '../components/ReflectionForm'
import { useApp } from '../context/AppContext'
import { storyForRun } from '../data/stories/catalog'

export default function Reflection() {
  const nav = useNavigate()
  const { reflection, setReflection, storageError, storyProgress } = useApp()
  const story = storyForRun(storyProgress)!
  return <Page><AppHeader back title="反思" /><h1 className="text-3xl font-black">比結果更重要的是：你有什麼感覺？</h1><p className="mt-3 mb-6 text-slate-600">沒有標準答案。你可以跳過任何問題，也可以稍後再修改。</p>
    <ReflectionForm value={reflection} onChange={setReflection} />
    <p role="status" className="mt-4 text-sm text-slate-500">{storageError ? '目前未能儲存到這部裝置，請保留此頁。' : '修改會自動保存在這部裝置，只屬於這次體驗。'}</p>
    <PrimaryButton className="mt-6" onClick={() => nav(`/story/${story.id}/next`)}>看看下一步</PrimaryButton>
    <SecondaryButton className="mt-3" onClick={() => nav(`/story/${story.id}/next`)}>略過未填問題，繼續</SecondaryButton>
    <button type="button" className="mt-3 w-full py-3 text-sm text-indigo-700" onClick={() => setReflection({})}>清除這次反思</button>
  </Page>
}


