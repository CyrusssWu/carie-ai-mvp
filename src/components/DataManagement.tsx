import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { BottomSheet, Card, PrimaryButton, SecondaryButton } from './UI'
import { PrivacyInformation } from './PrivacyInformation'

export function DeleteExperienceButton({ entryId, title }: { entryId: string; title: string }) {
  const { deleteExperience } = useApp()
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  return <><button className="w-full rounded-xl border border-red-200 p-3 text-sm text-red-800" onClick={() => setOpen(true)}>刪除這次體驗</button><BottomSheet open={open} onClose={() => setOpen(false)} title="刪除這次體驗？" centered>
    <p className="mb-3 font-bold">{title}</p><p className="mb-4 text-sm leading-6">這次體驗的選擇、證據、反思及行動會被刪除，無法復原。其他可讀取的 Passport 記錄會保留。為避免資料再次出現，舊版與復原副本也會一併清除；如需保留，請先導出。</p>
    {failed && <p role="alert" className="mb-3 text-sm text-red-800">刪除尚未完成，請查看頁面提示並重試。</p>}
    <PrimaryButton onClick={() => { const ok = deleteExperience(entryId); setFailed(!ok); if (ok) setOpen(false) }}>確認刪除這次體驗</PrimaryButton><SecondaryButton className="mt-3" onClick={() => setOpen(false)}>取消</SecondaryButton>
  </BottomSheet></>
}

export function DataManagement() {
  const { exportData, clearAllData, passport, storageError } = useApp()
  const nav = useNavigate()
  const [dialog, setDialog] = useState<'privacy' | 'clear' | null>(null)
  const [json, setJson] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  // Remove stale export previews when records are edited or deleted.
  useEffect(() => { setJson(''); setMessage('') }, [passport])
  useEffect(() => {
    if (!json) { setDownloadUrl(''); return }
    try {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
      setDownloadUrl(url)
      return () => URL.revokeObjectURL(url)
    } catch { setDownloadUrl(''); setMessage('未能建立下載連結。你仍可選取下方 JSON，自行另存為文字檔。') }
  }, [json])
  return <Card className="mt-6"><h2 className="font-bold">管理我的資料</h2><p className="my-3 text-sm leading-6 text-slate-600">目前你的探索記錄儲存在這個瀏覽器中。你可以管理或刪除自己的探索記錄。</p>
    <SecondaryButton onClick={() => setDialog('privacy')}>資料與私隱說明</SecondaryButton>
    <SecondaryButton className="mt-3" onClick={() => { const result = exportData(); setJson(result.ok ? result.json : ''); setMessage(result.ok ? '已建立已保存資料的 JSON 預覽，尚未下載或傳送。' : result.error) }}>導出我的資料（JSON）</SecondaryButton>
    {storageError && <p className="mt-3 text-sm text-amber-900">導出只包含成功保存的資料，不包含尚未保存的修改。</p>}
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    {json && <div className="mt-4"><p className="mb-3 text-sm text-amber-900">完整檔案包含你的反思與探索記錄，請妥善保管。這不是導師分享摘要，也不會自動寄送。目前尚未提供匯入功能。</p><label htmlFor="data-export-json" className="font-medium">我的已保存資料 JSON</label><textarea id="data-export-json" readOnly value={json} rows={6} className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm" />{downloadUrl && <a href={downloadUrl} download="carie-exploration-records.json" className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-white">下載 JSON 檔案</a>}</div>}
    <button className="mt-3 w-full rounded-xl border border-red-200 p-3 text-sm text-red-800" onClick={() => { setFailed(false); setDialog('clear') }}>清除全部本地探索資料</button>
    <BottomSheet open={dialog === 'privacy'} onClose={() => setDialog(null)} title="資料與私隱說明" centered>
      <PrivacyInformation />
      <SecondaryButton className="mt-4" onClick={() => setDialog(null)}>知道了</SecondaryButton>
    </BottomSheet>
    <BottomSheet open={dialog === 'clear'} onClose={() => setDialog(null)} title="清除全部本地探索資料？" centered>
      <p className="mb-4 text-sm leading-6">暱稱、探索答案、故事進度、Passport、反思、行動，以及舊版與復原副本都會被清除。本地記錄可能無法恢復。已下載的檔案和剪貼板不會被刪除。請先導出需要保留的資料，並關閉其他 Carie 頁面。</p>
      {failed && <p role="alert" className="mb-3 text-sm text-red-800">清除尚未完成，請重試或檢查瀏覽器儲存設定。</p>}
      <PrimaryButton onClick={() => { const ok = clearAllData(); setFailed(!ok); if (ok) { setJson(''); setDialog(null); nav('/', { replace: true }) } }}>確認清除全部資料</PrimaryButton><SecondaryButton className="mt-3" onClick={() => setDialog(null)}>保留資料，返回</SecondaryButton>
    </BottomSheet>
  </Card>
}
