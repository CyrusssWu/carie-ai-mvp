import { useNavigate } from 'react-router-dom'

export function AppHeader({ title = 'Carie AI', back = false, onPause }: { title?: string; back?: boolean; onPause?: () => void }) {
  const nav = useNavigate()
  return <header className="mb-6 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      {back && <button aria-label="返回" onClick={() => window.history.state?.idx > 0 ? nav(-1) : nav('/home', {replace:true})} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-sm">←</button>}
      <div><div className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-500">Carie</div><div className="font-bold text-slate-900">{title}</div></div>
    </div>
    {onPause && <button onClick={onPause} className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">暫停</button>}
  </header>
}
