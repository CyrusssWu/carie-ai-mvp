import { useEffect, useId, useRef, type ReactNode } from 'react'

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto min-h-screen w-full max-w-md px-5 py-6 ${className}`}>{children}</main>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`carie-card rounded-3xl p-5 ${className}`}>{children}</div>
}

export function PrimaryButton({ children, onClick, disabled = false, type = 'button', className = '' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; className?: string }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`w-full rounded-2xl px-5 py-4 font-semibold transition ${disabled ? 'cursor-not-allowed bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.99]'} ${className}`}>{children}</button>
}

export function SecondaryButton({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" onClick={onClick} className={`w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-700 hover:bg-slate-50 ${className}`}>{children}</button>
}

export function Progress({ current, total }: { current: number; total: number }) {
  return <div className="mb-6">
    <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500"><span>探索進度</span><span>{current} / {total}</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(current / total) * 100}%` }} /></div>
  </div>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">{children}</span>
}

export function BottomSheet({ open, title, onClose, children, centered = false, className = '', headingIcon, eyebrow }: { open: boolean; title: string; onClose: () => void; children: ReactNode; centered?: boolean; className?: string; headingIcon?: ReactNode; eyebrow?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    if (!open) { dialog.current?.close(); return }
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.current?.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [open])
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}} className={`fixed inset-0 max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-white p-5 text-slate-900 shadow-2xl backdrop:bg-slate-950/35 ${centered?'m-auto':'mx-auto mb-3 mt-auto'} ${className}`}>
      {headingIcon ? <div className="story-dialog-heading">{headingIcon}<p className="story-caption">{eyebrow}</p><h2 id={titleId}>{title}</h2></div> : <div className="mb-4 flex items-center justify-between gap-4"><h3 id={titleId} className="text-lg font-bold">{title}</h3><button onClick={onClose} className="min-h-11 rounded-full bg-slate-100 px-3 py-1 text-sm">關閉</button></div>}
      {children}
  </dialog>
}
