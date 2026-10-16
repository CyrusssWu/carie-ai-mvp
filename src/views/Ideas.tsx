import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Card, Page, PrimaryButton, Progress } from '../components/UI'
import { careerIdeas } from '../data/careers'

export default function Ideas(){ const nav=useNavigate(); return <Page><AppHeader back title="探索方向"/><Progress current={4} total={4}/><h1 className="text-3xl font-black">{careerIdeas.length} 個值得你試試看的方向</h1><p className="my-3 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-900">這些是探索起點，不是預測。</p><div className="space-y-4">{careerIdeas.map(c=><Card key={c.id}><div className="text-xs font-bold uppercase tracking-wider text-indigo-500">{c.title}</div><h2 className="mt-1 text-xl font-black">{c.zh}</h2><p className="mt-2 text-slate-600">{c.description}</p><div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm"><b>為什麼出現：</b><br/>{c.why}</div><p className="mt-4 text-sm text-slate-600"><b>你會體驗：</b>{c.experience}</p>{c.live?<PrimaryButton className="mt-4" onClick={()=>nav('/story/setup/' + c.id)}>試試這個職業</PrimaryButton>:<button disabled className="mt-4 w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-500">故事即將推出</button>}</Card>)}</div><button onClick={()=>nav('/onboarding/direction')} className="my-6 w-full text-sm font-semibold text-indigo-700">沒有感覺？重新調整探索方向</button><PrimaryButton onClick={()=>nav('/home')}>先回首頁</PrimaryButton></Page> }

