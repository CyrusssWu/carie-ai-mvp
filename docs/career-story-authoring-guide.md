# 職業故事編寫指南

Sprint 6 · 2026-10-15

目前三個故事都是為 Carie AI 產品原型編寫的虛構模擬，並非經認證的香港職業培訓資料，亦不代表真實機構或 NGO 授權。內容上線前仍需要從業員、教育及學生閱讀測試。

## 內容與畫面分工

內容位於 `src/data/`；所有故事共用 `src/views/StoryPlayer.tsx`。不要複製播放器或新增 Decision / Vocabulary / Confirmation / Pause 路由。播放器固定使用 `/story/:storyId`，五步是內部狀態。

先用 [內容編輯模板](career-story-template.md) 撰寫，不需要懂程式。開發人員再依 `src/types/index.ts` 匯入。可參照 `src/data/stories/communityEvent.ts` 的完整例子。`authoring.ts` 的 `chapter`、`option` 和 `defineStory` 只是減少重複輸入的助手，輸出仍是同一份 CareerStory 模型。

## Schema 與名稱對照

| 實際欄位 | 用途與編寫要求 |
| --- | --- |
| Career.id / slug | 穩定英文小寫連字號 ID；不能使用職業名稱作資料關聯 |
| title / titleZh / industry / description / tags | 英文名、繁中名、方向、工作介紹與描述性標籤；不是適配判斷 |
| storyIds | 這個職業可玩的故事 ID；空陣列在首頁顯示 Coming Soon |
| why / experience | 說明探索內容，不能聲稱測試已確定學生適合 |
| CareerStory.id / careerId / version | 故事、職業與已發布版本的關聯；版本格式如 `1.0.0` |
| title / titleZh / role | 故事雙語標題與學生扮演的角色 |
| context / mission | introduction 的等價欄位與整體任務；明確寫出角色、同事、限制與同一個項目 |
| estimatedMinutes / learningObjectives | 閱讀時間與可體驗的工作內容；時間不是分數 |
| vocabulary | 詞彙定義清單；每項有 id、term、zh、explanation、example |
| presentation | 場景標籤及本地圖片路徑；不要加入遠端追蹤圖片 |
| nextStepSuggestions | 該職業的小行動（id、title、description、category）。UX 保留既有建議作相容預設 |
| Decision.id / sequence | 穩定的階段 ID 與 1–5 次序 |
| phase / workplaceContext / scenario | sceneTitle、工作情境、question 的等價欄位 |
| options | 至少三個有意義的選項；本次每階段三個 |
| Option.id / label / description | 選項 ID、短標題與 actionDescription；ID 在該 Decision 內唯一 |
| consequence | 該行動實際帶來的回應、改變、限制與尚未確認事項 |
| evidence | BehaviourEvidence：id、behaviour（label）、evidence（description）、sourceDecisionId、sourceOptionId |
| handoff | `nextDecisionId` 與 `narrative`，從該選擇銜接到下一階段；最後一關的 nextDecisionId 為 null |

決策 ID 在故事內唯一；選項 ID 在決策內唯一，因此 `d1/a` 和 `d2/a` 可以同時存在。證據 ID 在故事版本內唯一。助理函式會由 story/decision/option 產生來源 ID、sequence 和下一關 ID，內容編輯不用自行計算；不要在已發布版本中重新排序或改用 ID 指代另一個行動。

## 五個階段怎樣連成故事

1. 建立工作目標、合作人物與已知／未知資料。
2. 用第一階段得到的資訊提出具體工作安排。
3. 引入合理的資源限制或變動，要求學生作取捨。
4. 與受影響的人協調，描述團隊後續的實際調整。
5. 回顧仍未解決的需要並交接，不作能力結論。

這是編寫提示，不是所有職業必須複製的劇情。物流的核心是配送與資源，社區統籌的核心是參與與組織，UX 的核心是使用者與設計驗證。

每個選項都要能合理解釋為何有人會採取它。後果需要同時寫出具體效益與代價，避免只改句子但結果完全相同；不要用受辱、淘汰或失敗判語。不要編造香港法規、職業資格或真實機構背書。

## Behaviour Evidence

用「你選擇先確認收貨時段」等可觀察的行動，避免「你具有高溝通能力」。每項證據必須回指同一選項和決策。證據由已揭曉的選擇重新推導，不在點擊時不斷累加。確認前可更改選擇，尚未揭曉的草稿不產生證據。

不要寫分數、權重、最佳答案、隱藏積分、職業適配度或適合／不適合標籤。允許的數字是閱讀分鐘和決策順序等呈現資訊，不能作學生評價。

## Vocabulary 與故事衔接

將詞彙放進故事 `vocabulary`，並在需要的 Decision.vocabulary 使用同一項定義。校驗會比對完整定義，避免失效引用。畫面共用原有 bottom sheet，不新增詞彙頁。用日常繁中和當前工作的例子解釋術語。

目前使用結構化 handoff，等價於由選擇 ID 推導的輕量敘事標記；沒有另一份可以失去同步的 flag store。`getIncomingHandoff` 用上一關實際選項讀取 handoff.narrative，下一關同時保留自身 workplaceContext。若沒有有效上一步選擇，省略選擇專屬銜接，顯示穩定的工作情境；不虛構學生選過某項。最後一關銜接回顧，不產生另一棵劇情樹。

編寫每條 handoff 時，必須解釋不同選擇如何走到共同下一階段。例如路線不同，但另一車出現故障是共享事件；文字應提及先前路線安排仍需跟進。

## 新增第四個職業的完整流程

1. 複製 `docs/career-story-template.md` 作內容稿，填妥一個完整項目、五個階段、十五個選項與來源證據。先完成內容審閱。
2. 在 `src/data/careerMetadata.ts` 加入 Career；填唯一 id/slug、雙語名稱、industry、description、tags、storyIds、why、experience。
3. 新增 `src/data/stories/<careerStory>.ts`，匯出符合 CareerStory 的資料。使用 authoring 助手或完整物件皆可。首次版本使用 `1.0.0`，填妥 presentation 和相關 nextStepSuggestions。可增加本地 `public/assets/story/` SVG 圖片。
4. 在 `src/data/stories/catalog.ts` 匯入並加入 publishedStories。當前版本是同一 story ID 在陣列中最後出現的版本。不要手工改 Home、Player、Recap、Reflection 或 SharePreview。
5. 執行 `npm run validate:content`、`npm run typecheck`、`npm test`、`npm run build`。內容資料是 TypeScript，校驗檢查 ID、來源、五關、三選項、完整後果、詞彙、導航與禁用評分類欄位。
6. 新增該職業的內容／狀態測試案例；把 `tests/e2e/sprint6.cua.mjs` 的職業、故事、標題和行動資料擴充為新職業的驗收場景。現有「三個職業／三個點子」驗收數量需隨產品範圍明確更新，不能只刪斷言。
7. 用隔離測試資料走 Setup → 五關 → Recap → 可選 Reflection → Next Steps → Passport → Share。改選、重新整理、暫停回 Home、跨職業恢復、重玩、重複保存都要測。
8. 實際確認 390px 及桌面布局、鍵盤焦點和控制台。分享四類資料逐項切換，反思預設關閉；確認沒有網絡／自動複製／自動分享。
9. 由內容審閱者簽核後才將內容作為新的應用程式版本發布。此流程不會自動部署。

新增第四個職業主要修改 metadata、故事資料、registry 和驗收案例，不需要新的 React Player。Ideas 標題數量與探索點子由 metadata 自動產生；目前 Sprint 6 顯示三個可玩方向。

## 發布版本與歷史資料

已發布的 `id@version` 不可原地改寫，即使只是文案修訂，也建立下一版本。先保留舊檔案（例如 `versions/<story>.v1.ts`），新增版本檔，再把兩版都放進 publishedStories。validate:content 會驗證每版，同一 ID 的版本不可重複。

新 run 鎖定當前版本；恢復時按 storyId + storyVersion 載入原版。沒有版本欄位的舊 UX run 使用已保留的 1.0.0。未知版本不自動升級進度，資料倉庫停止寫入並提示使用相容版本，原始資料保留。

Passport 保存五個真實選項的題目、標題、後果、階段及來源證據快照，而不是只保存內容指標。以後更改故事不會重繪舊體驗；Reflection 和 Next Steps 仍可獨立編輯。舊 Passport 缺版本時保留未知，不猜測；缺逐項選擇時保留 legacyIncomplete 提示，不補造答案。

不同職業的最近一次草稿保留在同一學生資料文件：active run 一份，其他故事 suspendedRuns 各一份。切換時移動草稿和其反思／行動；不另開 localStorage store。重玩明確產生新 run；一次 run 重複保存仍是同一 entry。刪除 entry 同時移除對應暫存 run，避免復活。

## 上線前內容檢查

- [ ] 虛構原型聲明清楚；無認證／真實機構背書。
- [ ] 五關是同一項目，三個選項有真實取捨，沒有唯一正解。
- [ ] 三十秒內能理解當前問題；專業術語有簡明解釋。
- [ ] 所有選擇都具備對應後果、來源證據與下一段銜接。
- [ ] 無分數、隱藏權重、適配判斷或診斷；不蒐集額外學生身份資料。
- [ ] 已發布版本完整保留；舊 Passport 與舊 run 經過恢復測試。
- [ ] 所有完整流程及手機視口測試通過；錯誤連結有可操作的返回入口。
- [ ] Reflection 可跳過，分享預設不含反思；只有預覽與主動複製，沒有外發。
- [ ] 從業員、教育人員及學生對內容理解的審閱尚未通過前，不稱為正式職業培訓。
