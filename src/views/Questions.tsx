import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Card, Page, PrimaryButton, Progress } from '../components/UI'
import { explorationQuestions, careerIdeas } from '../data/careers'
import { useApp } from '../context/AppContext'

export default function Questions(){
 const nav=useNavigate(); const {profile,setProfile,recomputeTags}=useApp(); const [params,setParams]=useSearchParams(); const [index,setIndex]=useState(()=>{const saved=Number(params.get('q'));const first=explorationQuestions.findIndex(q=>!profile.explorationAnswers[q.id]);return params.has('q')&&Number.isInteger(saved)&&saved>=0&&saved<explorationQuestions.length?saved:Math.max(0,first)}); const q=explorationQuestions[index]
 useEffect(()=>{setParams({q:String(index)},{replace:true});window.scrollTo(0,0)},[index,setParams])
 const selected=profile.explorationAnswers[q.id]
 const pct=useMemo(()=>index+1,[index])
 const choose=(id:string)=>setProfile(p=>({...p,explorationAnswers:{...p.explorationAnswers,[q.id]:id}}))
 const next=()=>{if(index<explorationQuestions.length-1)setIndex(i=>i+1);else{const tags=recomputeTags(profile.explorationAnswers);setProfile(p=>({...p,explorationTags:tags,suggestedCareers:careerIdeas.map(c=>c.id)}));nav('/ideas')}}
 return <Page><AppHeader back title="探索問題"/><Progress current={3} total={4}/><div className="mb-2 text-sm font-semibold text-indigo-600">Question {pct} of {explorationQuestions.length}</div><h1 className="text-2xl font-black leading-9">{q.text}</h1><p className="mt-2 mb-5 text-sm text-slate-500">沒有標準答案，選現在最像你的做法。</p><div className="space-y-3">{q.options.map((o,i)=><button key={o.id} aria-pressed={selected===o.id} className="w-full text-left" onClick={()=>choose(o.id)}><Card className={selected===o.id?'ring-2 ring-indigo-500':''}><div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 font-bold">{String.fromCharCode(65+i)}</span><span>{o.label}</span></div></Card></button>)}</div><div className="mt-7 flex gap-3">{index>0&&<button className="w-1/3 rounded-2xl bg-white px-4 py-4 font-semibold" onClick={()=>setIndex(i=>i-1)}>上一題</button>}<PrimaryButton disabled={!selected} onClick={next}>{index===explorationQuestions.length-1?'看看值得探索的方向':'下一題'}</PrimaryButton></div></Page>
}

