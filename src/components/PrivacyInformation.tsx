import { useState } from 'react'
import { BottomSheet, SecondaryButton } from './UI'

export function PrivacyInformation() {
  return <div className="space-y-3 text-sm leading-6"><p>目前你的探索記錄儲存在這個瀏覽器中。</p><p>Carie 不會自動把你的資料傳送給老師或導師。</p><p>你可以管理或刪除自己的探索記錄。</p><p>如果更換裝置或清除瀏覽器資料，記錄可能無法恢復。</p><p>本地儲存沒有加密，也沒有雲端備份。使用同一瀏覽器的人可能看見記錄。</p><p>我們保存暱稱、探索答案、故事選擇、反思和行動。你也可自願保存年級、想獲得支持的科目及升學探索計劃；可在升學路線頁刪除學業起點。完整 JSON 導出包含這些選填資料。導師討論摘要只包含你勾選並確認的內容。請勿在自由文字中填寫真實姓名、學校、地址或其他敏感資料。</p><p>反思預設不參與分享。完整 JSON 導出包含反思，請自行保管已下載的檔案；刪除瀏覽器記錄不會刪除檔案或剪貼板。</p></div>
}
export function PrivacyButton() {
  const [open, setOpen] = useState(false)
  return <><SecondaryButton onClick={() => setOpen(true)}>資料與私隱說明</SecondaryButton><BottomSheet open={open} onClose={() => setOpen(false)} title="資料與私隱說明" centered><PrivacyInformation /><SecondaryButton className="mt-4" onClick={() => setOpen(false)}>知道了</SecondaryButton></BottomSheet></>
}
