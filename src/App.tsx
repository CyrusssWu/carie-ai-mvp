import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { BottomSheet, PrimaryButton, SecondaryButton } from './components/UI'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { findStory, storiesForCareer, storyForRun } from './data/stories/catalog'
import { Link } from 'react-router-dom'
import Welcome from './views/Welcome'
import AboutYou from './views/AboutYou'
import Direction from './views/Direction'
import Questions from './views/Questions'
import Ideas from './views/Ideas'
import Home from './views/Home'
import StorySetup from './views/StorySetup'
import StoryPlayer from './views/StoryPlayer'
import Recap from './views/Recap'
import Reflection from './views/Reflection'
import NextSteps from './views/NextSteps'
import Passport from './views/Passport'
import SharePreview from './views/SharePreview'
const PathwayExplorer = lazy(() => import('./views/PathwayExplorer'))

function StoryRoute({ children, complete = false, setup = false }: { children: ReactNode; complete?: boolean; setup?: boolean }) {
  const { careerId, storyId } = useParams()
  const { storyProgress } = useApp()
  const story = setup ? storiesForCareer(careerId)[0] : findStory(storyId)
  if (!story) return <main className="mx-auto max-w-md p-6"><h1 className="text-2xl font-bold">找不到這個職業故事</h1><p className="my-4">連結可能已更改，或故事尚未推出。你的已保存記錄仍在 Passport。</p><Link className="inline-block min-h-11 underline" to="/ideas">返回探索方向</Link></main>
  if (!setup && storyProgress.storyId !== story.id) return <Navigate to={`/story/setup/${story.careerId}`} replace/>
  if (!setup && !storyForRun(storyProgress)) return <main className="p-6">這個故事版本暫時無法載入。請保留資料並使用相容版本。</main>
  if (complete && !storyProgress.completed) return <Navigate to={`/story/${story.id}`} replace/>
  return children
}

export default function App(){
  const { pathname } = useLocation()
  const { storageError, storageNotice, storageMessage, retrySave, reloadData } = useApp()
  const [reloadOpen, setReloadOpen] = useState(false)
  useEffect(()=>{window.scrollTo(0,0)},[pathname])
  return <div className="carie-shell">{storageError&&<div className="mx-auto max-w-md bg-amber-50 p-4 text-sm text-amber-900"><p role="alert">{storageMessage}</p><p className="mt-2">重新載入可能遺失未保存的修改。</p><button className="mr-4 underline" onClick={retrySave}>重試儲存或清理</button><button className="underline" onClick={() => setReloadOpen(true)}>重新讀取已保存資料</button></div>}{storageNotice&&<p role="status" className="mx-auto max-w-md bg-amber-50 p-4 text-sm text-amber-900">{storageNotice}</p>}<BottomSheet open={reloadOpen} onClose={() => setReloadOpen(false)} title="重新讀取已保存資料？" centered><p className="mb-4">目前未保存的修改會被取代。請先保留需要的文字。</p><PrimaryButton onClick={() => { reloadData(); setReloadOpen(false) }}>確認重新讀取</PrimaryButton><SecondaryButton className="mt-3" onClick={() => setReloadOpen(false)}>取消</SecondaryButton></BottomSheet><Routes>
    <Route path="/" element={<Welcome/>}/>
    <Route path="/onboarding/about-you" element={<AboutYou/>}/>
    <Route path="/onboarding/direction" element={<Direction/>}/>
    <Route path="/onboarding/questions" element={<Questions/>}/>
    <Route path="/ideas" element={<Ideas/>}/>
    <Route path="/home" element={<Home/>}/>
    <Route path="/story/setup/:careerId" element={<StoryRoute setup><StorySetup/></StoryRoute>}/>
    <Route path="/story/:storyId" element={<StoryRoute><StoryPlayer/></StoryRoute>}/>
    <Route path="/story/:storyId/recap" element={<StoryRoute complete><Recap/></StoryRoute>}/>
    <Route path="/story/:storyId/reflection" element={<StoryRoute complete><Reflection/></StoryRoute>}/>
    <Route path="/story/:storyId/next" element={<StoryRoute complete><NextSteps/></StoryRoute>}/>
    <Route path="/passport" element={<Passport/>}/>
    <Route path="/pathways/:careerId" element={<Suspense fallback={<main role="status" className="mx-auto max-w-md p-6">正在載入升學路線…</main>}><PathwayExplorer/></Suspense>}/>
    <Route path="/share" element={<SharePreview/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></div>
}
