# Carie AI — Vercel 測試部署

本文件準備的是使用虛構身份的產品測試，不代表已批准真實學生試點。
本次只修改本地工程，沒有建立遠端倉庫、部署或發出邀請。

## 架構及構建設定

本專案是 React 19 + TypeScript + Vite SPA，使用 React Router 的 BrowserRouter。
沒有 React Router Framework Mode、SSR、API、Functions 或伺服器路由。

| Vercel 設定 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | 包含 package.json 和 vercel.json 的目錄 |
| Install Command | npm ci |
| Build Command | npm run build |
| Output Directory | dist |
| Node.js Version | 22.x（至少 22.12；與現有 CI 一致） |
| Environment Variables | 不需要 |

如果只把 carie-ai-mvp 內容放進 GitHub，Root Directory 用 `.`。如果保留目前
工作區的巢狀結構，則是 `mnt/data/carie-ai-mvp`。不要把 `.tools` 當作部署依賴。
提交 package-lock.json；不要在 Vercel 使用 npm run dev 或 npm run preview。

根目錄 vercel.json 按照 [Vercel 官方 Vite SPA 指引](https://vercel.com/docs/frameworks/frontend/vite)
將應用路徑回退至 index.html。真實靜態檔案由平台正常提供。
保持 Vite 預設根路徑，不要改成相對 base 或開啟 cleanUrls。
輸出只有 dist；測試 fixture、來源碼、localStorage 和驗證截圖不會一起被當作靜態網站發布。
X-Robots-Tag 降低搜尋引擎收錄；它不是存取控制。
Referrer-Policy 避免對外連結帶出當前頁面網址。

## 1. 準備 GitHub 私有倉庫

目前目錄尚未有 Git 倉庫，沒有可供檢查的提交歷史。本次保留所有現有檔案，沒有初始化、提交或推送。
在本專案目錄使用 GitHub Desktop 或以下本地步驟（執行前確認所在目錄）：

```sh
git init -b main
git status --short
git add .
git diff --cached --stat
git diff --cached
```

審查暫存內容後才執行 `git commit -m "Prepare Carie AI test deployment"`。
確認沒有真實學生資料、匯出 JSON、個人截圖、憑證或敏感日誌。
本次已補上 .env、.env.*、.vercel/、verification/、金鑰檔及日誌的忽略規則；
node_modules/、dist/、.tools/、artifacts/ 原已忽略。
`.gitignore` 不會移除日後已被追蹤的秘密；若秘密曾推送，必須撤銷/輪替並處理歷史。
不要使用 `git add -f` 強制加入忽略檔案。

由你登入 GitHub 建立 **Private** repository，再透過 GitHub Desktop 發布，
或照 GitHub 顯示的 existing repository 指令加入 remote 並推送。
不要改成 Public，不要把 token 放在 remote URL、程式碼或文件內。
若 GitHub Desktop 的 Publish 對話框有 Keep this code private，保持勾選。

## 2. 授權及匯入 Vercel

1. 由你登入 Vercel，授權 GitHub App 僅讀取這個私有倉庫。
2. 在 New Project / Import Git Repository 選擇倉庫，使用上表設定。
3. 在首次部署前確認團隊的新專案預設保護；匯入後也要核對專案設定。
   點 Deploy 會建立可連線的部署，這一步由你在確認存取範圍後操作。
4. 不新增 Firebase、資料庫、Gemini key、Analytics 或 Speed Insights SDK。
   所有 VITE_* 值都可能進入前端檔案，不能存放秘密。
5. 構建成功後，在 Deployments 開啟對應 deployment 的 Visit / URL。
   先自行驗收，再決定是否發送測試網址；本地 127.0.0.1 網址不能給朋友使用。

## 3. Deployment Protection 與 Shareable Link

在 Project → Settings → Deployment Protection 設定 Vercel Authentication，
選擇 **All Deployments**，並用未登入的私人視窗確認包括 production domain
和 deployment URL 都受到保護。**Standard Protection 不保護 production domains**。
私有 GitHub 倉庫本身不會阻止公眾訪問 Vercel 網站。
可用選項及方案限制以帳戶介面和 [官方保護說明](https://vercel.com/docs/deployment-protection) 為準；
不要為了方便測試而增加公開的 Protection Exception。

指定部署 → Share → Anyone with the link 可建立 Shareable Link 給外部測試者。
此連結包含存取憑證，持有者可使用；勿提交 Git、放公開群組或公開截圖。
Hobby 的連結配額可能限制可建立數量，以目前方案為準。
收回時在同一 Share 視窗改為 Only people with access，並移除不再需要的個別訪客權限。
可在 Deployment Protection 的 Access 中檢查現有連結。
詳見 [官方 Shareable Links 步驟](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links)。

Vercel 的 Shareable Link 控制「誰能開啟網站」，Carie 的 Share Preview 控制
「使用者想複製哪些體驗內容」；兩者互不替代。網站連結不會帶上某人的 Passport。

## 4. 虛構身份驗收

使用獨立瀏覽器設定檔；不要清除任何現有使用者的儲存資料。

1. Welcome 能看見「Carie AI 測試版本 — 請勿輸入真實個人資料。」及非正式建議說明。
2. 暱稱填 Alex；選「完全不知道自己想做什麼」、設計與創意、科技與數碼。
3. 完成五道探索題，確認三個方向，選 UX Designer。
4. 完成 The Confusing Sign-up 的五個決策；試改選、暫停、恢復及刷新。
5. Recap 核對五個真實選擇及五條不重複證據；填虛構 Reflection 或略過。
6. 選下一步並存入 Passport，刷新仍保留；重複保存不產生重複記錄。
7. 從該 Passport 記錄打開升學路線；瀏覽課程、選探索行動後返回。
8. 打開 Share Preview，逐個切換 Experience / Evidence / Reflection / Next Steps。
   Reflection 和 Next Steps 初始關閉。建立摘要不傳送；明確點複製才使用剪貼板。
9. 在 390px 寬度與桌面確認無水平溢出、無控制台錯誤，按鈕能操作。
10. 在已部署的網址直接開啟及刷新下面路徑，確認沒有平台 404；Network 中
    JS/CSS/圖片回應為對應 MIME，不是 index.html。只檢查靜態資源請求，不應出現表單上傳。

實際路由：`/onboarding/about-you`、`/ideas`、`/home`、`/passport`、`/share`、
`/story/setup/ux-designer`、`/story/ux-community-signup`、
`/pathways/ux-designer?entry=<本瀏覽器的記錄ID>`。
`/pathways` 不是獨立頁面，會按既有路由回到 Welcome；不應為測試新增空路由。
空 Passport/Share 顯示空狀態；缺少有效 entry 的升學連結顯示引導。
新瀏覽器直接進故事可能先回到 setup；尚未完成故事不能直接跳到 recap，均是既有行為。

## 5. 更新與回滾

先在本地執行：

```sh
npm ci
npm run typecheck
npm test
npm run build
npm audit
```

在測試分支推送，檢查 GitHub Validate workflow 和 Vercel Preview 的完整流程。
CI 檢查與 Vercel 構建可能獨立執行，不能把部署成功當成測試通過。
確認後才合併 production branch；連接 Git 後的推送可能自動產生部署，屬於後續發布操作。
建議維持固定受保護測試網址：不同 deployment host 的 localStorage 不會共用。

回滾前確認舊版本仍相容於目前 `carie_student_data_v3`，不要降到不相容資料格式。
Vercel 專案的 Production Deployment → Instant Rollback，選已驗證版本、核對域名並確認。
若只是 Preview，可改分享已驗證 Preview；沒有 production alias 的 Preview 不能直接 Instant Rollback。
回滾不清除或還原瀏覽器資料。平台回滾後會暫停 production domain 自動指派；
修復驗證後透過 Undo Rollback / promote 恢復。
方案及可選版本限制見 [官方 Instant Rollback](https://vercel.com/docs/instant-rollback)。

## 6. 停止公開訪問

立即把保護範圍設為 All Deployments，撤銷 Shareable Links、個別邀請、Automation bypass
及 Protection Exceptions，逐一用私人視窗檢查 production、舊 deployment 和自訂域名。
只停 Git 自動部署、只移除自訂域名、只把 GitHub 改 Private 都不會關閉既有網站。
若需徹底下線，可由擁有者在 Vercel 刪除相關 deployment / project；先保留需要的來源及版本資訊。
停止網站不會遠端刪除測試者瀏覽器、已下載 JSON、剪貼板或他們已轉發的內容。

## 7. 測試資料與私隱

- 僅用虛構暱稱與回答。不要輸入真實姓名、學校、地址、聯絡方式、學生編號或敏感反思。
- 探索資料只存在目前瀏覽器 localStorage，沒有加密、帳戶或雲端備份；共用裝置可能被他人看到。
- Carie 不上傳回答，但網站託管商仍會處理載入網站所需的 IP、請求網址及一般存取資訊；
  不要把私密內容放進 URL。官方院校連結是使用者主動打開的外部網站。
- Reflection 預設不分享；完整 JSON 導出包含反思和選填資料，不能當成精簡分享摘要。
- 重新整理保留資料；更換域名、瀏覽器或裝置不會帶走記錄。沒有 JSON 匯入功能。
- 回報 bug 前遮去個人資料；勿把完整儲存資料或 Shareable Link 貼進公開 issue。
- 真實學生試點仍需機構批准、私隱/同意流程和實機驗證；本文件只支援虛構身份測試。

## 本次驗證的邊界

本地構建、Node 自動測試、安全掃描及 production preview 是部署前證據。
未登入或發布 Vercel，因此雲端構建、實際 rewrite、保護設定及香港網絡體驗仍須首次部署後驗收。

2026-10-16 本地實測結果：

- npm run build、npm run typecheck 成功；npm test 共 55 項通過。
- npm audit 成功查詢，已知漏洞 0。這不是完整滲透測試或未來安全保證。
- 來源檔案和輸出未發現常見 API key / 私鑰格式；未找到專案 .env 檔。
  未發現內嵌真實學生資料；沒有 Git 歷史可掃描。驗證產物已排除提交。
- dist 不含 e2e fixture、故障注入或監控工具；應用程式沒有上傳呼叫。
- 使用獨立 127.0.0.1:4183 的 Demo Alex，現有 production-smoke.cua.mjs 通過：
  Welcome、onboarding、五題探索、五次故事決策、準確 Recap、略過反思、Passport、Share。
- 另外實測 Passport → Education Pathways → 保存行動 → 刷新 → Share Preview。
  計劃仍在，分享初始設定仍為 true / true / false / false。
- 390px 無水平溢出；控制台無 warning / error。
- 本地直接路由回應 200；主 JS、懶載入升學 JS 及 CSS 均是正確 MIME。
  本地預覽不會執行 vercel.json；未把這項測試當作已驗證 Vercel 雲端 rewrite。
- 截圖保存在本地 verification/vercel/，不提交、不部署。既有瀏覽器資料未清空。

本工作區的 npm 由 `node .tools/node_modules/npm/bin/npm-cli.js` 啟動，
執行的 npm scripts 與上述命令相同；Vercel 使用正常 npm。
