# Sprint 6 Completion Report

2026-10-15 · 在現有 Carie AI 專案中完成，未建立新專案、服務或依賴。

## 1. 主要功能

三個可玩職業由統一內容格式驅動，均為五關、每關三個合理選項，共 45 個選項及相應後果、來源證據與敘事銜接。首頁和探索頁入口動態讀取職業資料，未實作的 Service Designer 明確顯示 Coming Soon。無效故事／職業連結有錯誤說明及返回入口。

不同職業保留各自最近一次草稿；暫停、刷新、切換後恢復不會混用其他職業的選擇、反思或行動。新增按記錄重玩入口，使用新 run ID；重複保存同一次體驗仍只有一條 entry。

## 2. 新增／修改文件

| 範圍 | 文件（相對本專案根目錄） |
| --- | --- |
| 統一模型 | `src/types/index.ts` |
| 職業資料／探索入口資料 | `src/data/careerMetadata.ts`、`src/data/careers.ts` |
| 故事與工具 | `src/data/stories/uxCommunitySignup.ts`、`logisticsDelivery.ts`、`communityEvent.ts`、`authoring.ts`、`catalog.ts`、`validate.ts` |
| 儲存與版本／草稿隔離 | `src/context/storage.ts`、`experience.ts`、`AppContext.tsx`、`src/repositories/LocalStudentDataRepository.ts` |
| 路由與現有頁面 | `src/App.tsx`；`src/views/Questions.tsx`、`Ideas.tsx`、`Home.tsx`、`StorySetup.tsx`、`StoryPlayer.tsx`、`Recap.tsx`、`Reflection.tsx`、`NextSteps.tsx`、`Passport.tsx` |
| 共用行動建議 | `src/components/NextStepsEditor.tsx` |
| 本地插圖 | `public/assets/story/logistics.svg`、`community.svg` |
| 內容校驗／測試 | `scripts/validate-content.mjs`、`package.json`、`tests/content.test.mjs`、`tests/storage.test.mjs`、`tests/e2e/sprint6.cua.mjs`、`sprint4.cua.mjs`、`production-smoke.cua.mjs`、`vite.config.ts` |
| 文件 | `README.md`、`docs/sprint6-plan.md`、`docs/career-story-authoring-guide.md`、`docs/career-story-template.md`、`docs/privacy-and-data-flow.md`、本報告 |
| 驗收證據 | `verification/sprint6/`：結果 JSON 與實際瀏覽器截圖，全部為合成測試資料 |

此工作目錄沒有 `.git`，無法提供 Git diff／commit；沒有重設或刪除原有專案。

## 3. Schema

沿用 CareerStory／Decision／DecisionOption／BehaviourEvidence 等模型，增加 Career metadata、故事版本、繁中標題、閱讀分鐘、學習目標、詞彙與職業相關行動建議。Evidence 有穩定 ID 及 sourceDecisionId/sourceOptionId。現有 context、scenario、description、behaviour/evidence 分別對應 introduction、question、actionDescription、label/description。

handoff 是輕量敘事機制：上一關真實選項決定下一關銜接文字。沒有另外的隱藏 flag／積分 store；缺選擇專屬敘事時仍呈現當前工作情境。

## 4. Registry

`catalog.ts` 提供全部職業、指定職業故事、ID 查找、可玩判斷、相關職業及 run 版本載入。publishedStories 保留已發布版本，同 ID 最後一版是新體驗預設。內容校驗檢查 ID、版本、五關、至少三選項、完整後果、來源證據、詞彙與下一關引用，並拒絕評分欄位／文案。

未知版本的本地 canonical 文件會停止寫入並保留原資料，避免套用另一套選項；發布時必須持續保留原版本。

## 5. 三個故事

| 職業／故事 | 五階段重點 |
| --- | --- |
| UX Designer — The Confusing Sign-up | 了解居民報名困難 → 試改欄位 → 限期內安排工作 → 協調上線範圍 → 跟進實際使用。保留原五關、選項 ID 與主要文案。 |
| Logistics Coordinator／物流協調員 — The Delivery Dilemma／配送難題 | 收貨需要與優先次序 → 交通下的路線安排 → 車輛停用 → 客戶與團隊溝通 → 未完成事項與交接。 |
| Community Programme Coordinator／社區活動統籌員 — The Community Event Challenge／社區活動挑戰 | 青年需要 → 場地與活動形式 → 材料及義工分配 → 帶領人缺席 → 不同回饋的整理與改善。 |

三個故事均明確標示為虛構產品原型，不代表真實機構授權或經認證的香港職業培訓。

## 6. 統一 Player

仍只有 `StoryPlayer.tsx` 和 `/story/:storyId`。Decision、Confirmation、Consequence 為內部狀態；Vocabulary 是 bottom sheet，Pause 是 modal。所有 UI 從已鎖定版本讀取，沒有按職業複製 Player，也沒有 `if career === ux-designer` 分支。沿用原來 V08 設計與組件；兩個新故事使用本地中性場景插圖。

## 7. Passport／Reflection 相容

沿用 `carie_student_data_v3` 及 Repository，沒有新增儲存系統。新增 suspendedRuns 為可選欄位，舊資料無此欄位仍可讀。舊 UX run 無版本時對應保留的 1.0.0；舊 Passport 保留當時已保存內容，缺失逐項選擇仍提示不完整，不補造。新 entry 保存選項與後果快照、來源證據和故事版本。

反思與行動跟隨 run／entry；編輯已暫存故事的 entry 會同步其草稿。刪除 entry 也移除對應暫存 run，避免重新保存復活。Share Preview 維持四項獨立控制，反思和下一步預設關閉，不自動發送。

## 8. 實際構建與測試

本環境使用專案內 npm 啟動器 `node .tools/node_modules/npm/bin/npm-cli.js` 執行以下等價命令：

| 命令／測試 | 結果 |
| --- | --- |
| `npm run typecheck` | 通過，無 TypeScript 錯誤 |
| `npm test` | **47/47 通過**，原 38 項全部保留，加 9 項內容與多職業測試 |
| `npm run build` | 通過；先執行內容校驗，3 個故事／3 個發布版本合法，再編譯及打包 |
| 狀態機 | 三個故事共 **729 種路徑**，逐關改選、確認、揭曉、刷新、來源證據與實際回顧 |
| Sprint 4 CUA regression | 新學生 Alex、五題探索、UX 五決策、兩次體驗、修改反思／行動、16 分享組合、錯誤與恢復皆通過 |
| Sprint 5 CUA regression | 私隱說明、JSON 導出、v2 遷移、寫入失敗、單筆刪除／清除全部、錯誤邊界皆通過；錯誤邊界使用明確的合成故障 |
| Sprint 6 CUA，**實際 390 × 844** | 三職業獨立草稿切換，逐一完成五決策及後續閉環；每職業 16 分享組合；三條記錄共存；物流再次體驗；錯誤連結；Coming Soon 皆通過 |
| 傳輸監測 | 最終三職業流程的 network、share、clipboard 自動動作計數全部 **0**；主動複製失敗回退另外由 Sprint 4 測試 |
| 生產包 `npm run preview -- --host 127.0.0.1 --port 4181 --strictPort` | 全新合成學生：探索五題 → 三個正確職業 → UX 五關 → 可選反思 → Passport → 導出 → Share 通過；390px 無橫向溢出 |
| 可訪問性／桌面 | 真實截圖檢查；詞彙按鈕 Enter 開啟、Escape 關閉並恢復焦點；Pause modal；1280px 桌面無溢出 |
| 瀏覽器控制台 | 最終手機內容測試及生產流程沒有 error／warn |

實際執行了 `npm run dev -- --config tests/e2e/vite.config.ts`，以 CUA 操作真實瀏覽器；不是把 Node 測試當作 E2E。手機測試明確斷言 viewport.width === 390。新建標籤曾恢復桌面尺寸，已修正測試並重跑。Recap／Share 的讀取曾早於渲染完成，已增加頁面就緒等待。開發 HMR 曾污染網絡監測計數，隔離測試設定已關閉 HMR，最終整輪重新測試為零，沒有忽略失敗斷言。

測試只重設 localhost:5177 的合成資料；沒有重設使用者原來的 127.0.0.1:4180 資料。

## 9. 仍存在的限制

- 內容尚未經香港從業員、教育專家或真實學生審閱；不是正式培訓認證。
- 每個故事保留一份最近草稿；可以保存多次已完成體驗，但不提供同故事多份未完成分支管理。
- 同一職業目前一個故事；registry 可列多個版本／故事，但 Setup 的多故事選擇介面不在本次範圍。
- localStorage 仍受同源、容量、清理與共用裝置限制；沒有雲端備份、登入或跨裝置同步。沿用 Sprint 5 的過期寫入檢查，並非跨程序原子鎖。
- 未測實體 iOS／Android、完整讀屏器流程或成功寫入系統剪貼簿；未進行真實學生試點、公開部署或託管 CI 執行。
- 版本保留需要發布紀律；本次測試了版本鎖定與舊文字快照，不代表有自動 CMS 或內容審批系統。

## 10. Sprint 7 建議（未實作）

優先安排內容專業審閱、學生可理解性測試、實體手機與讀屏器驗證、內容發布／版本保留檢查及小規模試點操作流程。是否增加服務端、帳戶或 AI 應另行明確訂範圍，不是本次自動延伸。

## 新增第四個職業的文件與完整流程

1. 複製 `docs/career-story-template.md`，完成背景、五關十五選項、後果、證據、詞彙、銜接及下一步；先作內容審閱。
2. 在 `src/data/careerMetadata.ts` 新增 metadata。
3. 新增 `src/data/stories/<storyName>.ts`，填統一 Schema；如需插圖，加入 `public/assets/story/`。
4. 在 `src/data/stories/catalog.ts` 匯入並註冊 publishedStories；首次版本 1.0.0，舊版內容不能原地覆寫。
5. 擴充內容／E2E 驗收資料和預期職業數，跑內容校驗、類型檢查、單元測試、build。
6. 在隔離真實瀏覽器驗證五關、改選、暫停、刷新、跨職業恢復、Recap、可選 Reflection、Passport 重玩／重複保存及四類 Share 控制，檢查 390px 與桌面。
7. 專業與教育內容審閱通過後，才按部署流程發布。**不用複製或改寫 Story Player。**

詳細欄位、例子、版本更新規則和審核清單見 `docs/career-story-authoring-guide.md`。
