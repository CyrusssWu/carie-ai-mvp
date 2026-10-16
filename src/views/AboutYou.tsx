import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Card, Page, PrimaryButton, Progress } from '../components/UI'
import { useApp } from '../context/AppContext'
import type { StartingPoint } from '../types'

const states: StartingPoint[] = ['完全不知道自己想做什麼','有幾個想法，但不確定','知道一些感興趣的方向','已經有方向，想了解怎樣實現']
const avatars = [{icon:'🌱',label:'幼苗'},{icon:'🪐',label:'星球'},{icon:'🧩',label:'拼圖'},{icon:'🎒',label:'背包'},{icon:'🛠️',label:'工具'},{icon:'✨',label:'星光'}]

export default function AboutYou() {
  const nav = useNavigate(); const { profile, setProfile } = useApp()
  return <Page><AppHeader back title="先認識你一點點"/><Progress current={1} total={4}/>
    <label htmlFor="nickname" className="mb-2 block font-bold">我們可以怎樣稱呼你？</label>
    <input id="nickname" autoComplete="off" maxLength={40} value={profile.nickname} onChange={e => setProfile(p => ({...p, nickname:e.target.value}))} placeholder="例如：小星（暱稱）" className="mb-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none focus:border-indigo-400"/>
    <p className="mb-6 text-sm text-slate-500">不用填寫真實姓名。</p>
    <div className="mb-6"><p className="mb-3 font-bold">選一個代表你的圖示（可選）</p><div className="grid grid-cols-6 gap-2">{avatars.map(a => <button key={a.icon} aria-label={`選擇${a.label}圖示`} aria-pressed={profile.avatar===a.icon} onClick={() => setProfile(p=>({...p, avatar:a.icon}))} className={`rounded-2xl py-3 text-2xl ${profile.avatar===a.icon?'bg-indigo-100 ring-2 ring-indigo-500':'bg-white'}`}>{a.icon}</button>)}</div></div>
    <p className="mb-3 font-bold">你現在比較接近哪一種狀態？</p><div className="mb-7 space-y-3">{states.map(s => <button key={s} aria-pressed={profile.startingPoint===s} onClick={() => setProfile(p=>({...p,startingPoint:s}))} className="w-full text-left"><Card className={profile.startingPoint===s?'ring-2 ring-indigo-500':''}>{s}</Card></button>)}</div>
    <PrimaryButton disabled={!profile.nickname.trim() || !profile.startingPoint} onClick={()=>nav('/onboarding/direction')}>繼續</PrimaryButton>
  </Page>
}

