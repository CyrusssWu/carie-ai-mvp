import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Card, Page, PrimaryButton, Progress, Tag } from '../components/UI'
import { industries } from '../data/careers'
import { useApp } from '../context/AppContext'

export default function Direction() {
  const nav=useNavigate(); const {profile,setProfile}=useApp()
  const toggleIndustry=(name:string)=>setProfile(p=>{const exists=p.selectedIndustries.includes(name); if(!exists&&p.selectedIndustries.length>=3)return p; const selectedIndustries=exists?p.selectedIndustries.filter(x=>x!==name):[...p.selectedIndustries,name];const allowed=industries.filter(i=>selectedIndustries.includes(i.name)).flatMap(i=>i.fields);return {...p,selectedIndustries,selectedFields:p.selectedFields.filter(f=>allowed.includes(f))}})
  const toggleField=(name:string)=>setProfile(p=>({...p,selectedFields:p.selectedFields.includes(name)?p.selectedFields.filter(x=>x!==name):[...p.selectedFields,name]}))
  return <Page><AppHeader back title="先選幾個想看的世界"/><Progress current={2} total={4}/><h1 className="text-2xl font-black">有沒有一些世界，你想先看看？</h1><p className="mt-2 mb-5 text-slate-600">不用很確定。只是選擇目前讓你好奇的方向，最多 3 個。</p>
    <div className="space-y-3">{industries.map(ind=><Card key={ind.name} className={profile.selectedIndustries.includes(ind.name)?'ring-2 ring-indigo-500':''}><button aria-pressed={profile.selectedIndustries.includes(ind.name)} disabled={!profile.selectedIndustries.includes(ind.name)&&profile.selectedIndustries.length>=3} onClick={()=>toggleIndustry(ind.name)} className="w-full text-left font-bold disabled:opacity-50">{ind.name}</button>{profile.selectedIndustries.includes(ind.name)&&<div className="mt-4 flex flex-wrap gap-2">{ind.fields.map(f=><button aria-label={f} aria-pressed={profile.selectedFields.includes(f)} onClick={()=>toggleField(f)} key={f}><Tag>{profile.selectedFields.includes(f)?'✓ ':''}{f}</Tag></button>)}</div>}</Card>)}</div>
    <button className="mt-4 text-sm font-semibold text-indigo-700" onClick={()=>setProfile(p=>({...p,selectedIndustries:[],selectedFields:[]}))}>我現在真的不知道</button>
    <p className="my-6 rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-900">這些選擇只是幫助 Carie 決定先讓你體驗什麼，不會限制之後的探索。</p>
    <PrimaryButton onClick={()=>nav('/onboarding/questions')}>下一步</PrimaryButton>
  </Page>
}

