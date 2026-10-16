import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet, Card, Page, PrimaryButton } from '../components/UI'
import { PrivacyButton } from '../components/PrivacyInformation'

export default function Welcome() {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  return <Page className="flex flex-col justify-center">
    <div className="mb-8"><div className="mb-3 text-sm font-bold uppercase tracking-[.25em] text-indigo-600">Carie AI</div><h1 className="text-4xl font-black leading-tight text-slate-950">不用現在就決定未來。</h1><p className="mt-4 text-lg leading-8 text-slate-600">透過短小的職業故事，試試不同工作中的真實選擇，慢慢發現什麼值得你繼續探索。</p></div>
    <Card className="mb-6 space-y-3"><p>✓ 這不是考試。</p><p>✓ 沒有標準答案。</p><p>✓ Carie 不會替你決定職業。</p></Card>
    <PrimaryButton onClick={() => nav('/onboarding/about-you')}>開始探索</PrimaryButton>
    <button className="mt-4 text-sm font-semibold text-indigo-700" onClick={() => setOpen(true)}>它是怎樣運作的？</button>
    <div className="mt-3"><PrivacyButton /></div>
    <BottomSheet open={open} title="Carie 怎樣陪你探索" onClose={() => setOpen(false)}><div className="space-y-4 text-slate-600"><p><b>探索</b>：從好奇開始，不需要先知道答案。</p><p><b>體驗</b>：在職業故事裡作出真實選擇。</p><p><b>反思</b>：留意什麼讓你投入、什麼讓你疲憊。</p><p><b>下一步</b>：決定還值得試什麼，必要時再找真人導師。</p></div></BottomSheet>
  </Page>
}
