import type { CareerStory } from '../../types'

// Published 1.0.0: keep IDs and this version immutable; register a new version for edits.
export const uxStory: CareerStory = {
  "id": "ux-community-signup",
  "careerId": "ux-designer",
  "career": "UX Designer",
  "title": "The Confusing Sign-up",
  "role": "Junior UX Designer",
  "context": "一間香港社區中心發現很多居民在網上活動報名途中放棄。你的團隊希望找出原因並改善體驗。",
  "mission": "在這個故事中，你會作出 5 個工作決定。",
  "decisions": [
    {
      "id": "d1",
      "scenario": "很多居民在報名的第二頁離開。你的團隊希望盡快改善問題。你會先做什麼？",
      "vocabulary": [
        {
          "term": "User interview",
          "zh": "使用者訪談",
          "explanation": "透過與真實使用者交談，了解他們做事時遇到的困難。",
          "example": "例如：請居民實際完成報名，再問他們在哪一步最困惑。",
          "id": "ux-d1-0"
        }
      ],
      "options": [
        {
          "id": "a",
          "label": "和幾位居民談談，看看他們在哪裡感到困惑",
          "consequence": "幾位居民示範報名時，都停在「家庭成員類別」。你聽到他們不清楚用語的意思，也記下了不同家庭的疑問。訪談用了半天，留給修改的時間變少。",
          "evidence": [
            {
              "behaviour": "User listening",
              "evidence": "你選擇先和使用者了解問題，而不是立即修改設計。",
              "id": "ux-community-signup:d1:a:0",
              "sourceDecisionId": "d1",
              "sourceOptionId": "a"
            }
          ],
          "description": "聽聽居民的經驗。需要一些時間，也可能發現被忽略的問題。",
          "handoff": {
            "nextDecisionId": "d2",
            "narrative": "你把訪談筆記帶回小組。活動統籌確認這個欄位用來安排名額，團隊接下來要討論怎樣讓居民更容易填寫。"
          }
        },
        {
          "id": "b",
          "label": "直接重新設計第二頁",
          "consequence": "你把第二頁重新排版，讓欄位次序更清楚，團隊有了一個能討論的版本。開發同事陪兩位居民試用時，他們仍停在「家庭成員類別」；版面改善沒有解開用語的疑問。",
          "evidence": [
            {
              "behaviour": "Making",
              "evidence": "你快速把想法轉化成可被測試的方案。",
              "id": "ux-community-signup:d1:b:0",
              "sourceDecisionId": "d1",
              "sourceOptionId": "b"
            }
          ],
          "description": "先做出一個版本，讓團隊看見可能的改善；之後仍要確認實際使用情況。",
          "handoff": {
            "nextDecisionId": "d2",
            "narrative": "同事把試用紀錄交給你。活動統籌補充這個欄位用來安排名額，於是團隊把下一輪修改集中在這個欄位。"
          }
        },
        {
          "id": "c",
          "label": "先查看分析數據，找出哪一步流失最多",
          "consequence": "你確認流失集中在第二頁的家庭資料區，讓團隊縮小了調查範圍。但數據沒有說明離開的原因；你把這個未知留在問題清單上。",
          "evidence": [
            {
              "behaviour": "Problem framing",
              "evidence": "你先用數據確認問題集中在哪裡。",
              "id": "ux-community-signup:d1:c:0",
              "sourceDecisionId": "d1",
              "sourceOptionId": "c"
            }
          ],
          "description": "先了解流失的位置，再確認背後的原因。",
          "handoff": {
            "nextDecisionId": "d2",
            "narrative": "前台職員依照你圈出的範圍，陪居民走一次流程，記下「家庭成員類別」的用語疑問。活動統籌確認資料用途後，把這份紀錄帶到修改討論。"
          }
        }
      ],
      "phase": "了解報名困難",
      "workplaceContext": "星期一，你以 Junior UX Designer 的身份加入香港一間社區中心的小組，與前台職員、活動統籌和開發同事合作。新一期活動即將接受報名；前台收到求助，後台也顯示居民常在第二頁離開。今天要先決定怎樣了解問題。",
      "sequence": 1
    },
    {
      "id": "d2",
      "scenario": "你知道「家庭成員類別」這個欄位讓不少人困惑。下一步你會怎樣處理？",
      "options": [
        {
          "id": "a",
          "label": "把欄位改成更日常的語言，再找幾位居民試用",
          "consequence": "你把欄位換成日常說法，再請居民試填。大部分人理解得更快，一位長者卻仍無法判斷自己的情況屬於哪個選項。你取得可用的測試紀錄，也看見文字以外的需要。",
          "evidence": [
            {
              "behaviour": "Testing ideas",
              "evidence": "你把一個小改動做成可測試方案，再觀察結果。",
              "id": "ux-community-signup:d2:a:0",
              "sourceDecisionId": "d2",
              "sourceOptionId": "a"
            }
          ],
          "description": "用小改動了解文字是否更清楚；仍要留意不同居民的理解。",
          "handoff": {
            "nextDecisionId": "d3",
            "narrative": "你帶著新文字與試填紀錄回到小組。大家把仍需協助的情況留下，連同整段流程的其他問題一起安排處理次序。"
          }
        },
        {
          "id": "b",
          "label": "刪除整個欄位",
          "consequence": "你在測試版刪除欄位，居民少填了一項資料。活動統籌指出，若正式採用這個做法，前台需要逐一補問才能安排名額；線上流程變短，工作卻可能轉到職員身上。",
          "evidence": [
            {
              "behaviour": "Simplifying",
              "evidence": "你嘗試降低使用者需要處理的資訊量。",
              "id": "ux-community-signup:d2:b:0",
              "sourceDecisionId": "d2",
              "sourceOptionId": "b"
            }
          ],
          "description": "先減少填寫負擔；團隊需要另想取得必要資料的方式。",
          "handoff": {
            "nextDecisionId": "d3",
            "narrative": "小組先保留這個測試版本，尚未把刪除改動上線。統籌會比較線上填寫與人工補問的負擔，再和其他報名問題一起安排處理次序。"
          }
        },
        {
          "id": "c",
          "label": "請同事寫一段更完整的說明文字",
          "consequence": "同事寫出欄位用途和例子，有居民因此理解為何需要資料；也有人在手機上跳過長段文字。團隊得到一份可再精簡的說明稿，但仍要處理閱讀負擔。",
          "evidence": [
            {
              "behaviour": "Explaining",
              "evidence": "你嘗試用更多背景資訊降低誤解。",
              "id": "ux-community-signup:d2:c:0",
              "sourceDecisionId": "d2",
              "sourceOptionId": "c"
            }
          ],
          "description": "提供更多背景與例子；手機畫面的閱讀負擔也需要觀察。",
          "handoff": {
            "nextDecisionId": "d3",
            "narrative": "你把說明稿和兩種不同反應放進測試紀錄。團隊會把這些發現與整段流程的其他問題一起排進修改清單。"
          }
        }
      ],
      "phase": "嘗試改善欄位",
      "workplaceContext": "星期二，小組已把第二頁的用語疑問列為待處理事項。「家庭成員類別」用於安排名額，前台目前也能人工補問。你和活動統籌要選一種改法，下午在測試環境觀察居民能否理解；現在還沒有方案被當作定案。",
      "sequence": 2
    },
    {
      "id": "d3",
      "scenario": "距離活動開放報名只剩兩天，清單上還有三個問題。眼前的時間只夠完整處理一個，你會怎樣分配？",
      "options": [
        {
          "id": "a",
          "label": "先修復令最多人無法完成報名的問題",
          "consequence": "你和開發同事先調整手機的送出按鈕。在這輪試用中，原本找不到按鈕的人能完成報名；家庭資料和日期排版則留在待辦清單，前台暫時提供協助。",
          "evidence": [
            {
              "behaviour": "Prioritising",
              "evidence": "你在時間有限時先處理影響最大的問題。",
              "id": "ux-community-signup:d3:a:0",
              "sourceDecisionId": "d3",
              "sourceOptionId": "a"
            }
          ],
          "description": "先處理最常阻止完成報名的障礙，其他問題需要暫時排後。",
          "handoff": {
            "nextDecisionId": "d4",
            "narrative": "你把已完成的修改與尚未處理的問題帶到上線前會議。此時，同事提出新增功能的想法，團隊需要決定如何使用剩餘時間。"
          }
        },
        {
          "id": "b",
          "label": "先處理最容易修復的問題",
          "consequence": "團隊先整理日期排版，當天就完成並驗證一項修改。日期較容易閱讀，但手機送出按鈕的問題仍在；你需要讓統籌知道這項未處理的風險。",
          "evidence": [
            {
              "behaviour": "Momentum building",
              "evidence": "你選擇先取得一個快速、可完成的改善。",
              "id": "ux-community-signup:d3:b:0",
              "sourceDecisionId": "d3",
              "sourceOptionId": "b"
            }
          ],
          "description": "先完成工時較短的修改，讓團隊交付一項可確認的改善。",
          "handoff": {
            "nextDecisionId": "d4",
            "narrative": "你在上線前會議報告這項改善及仍需協助的步驟。同事這時提出新增功能，團隊需要把新想法與現有待辦一起討論。"
          }
        },
        {
          "id": "c",
          "label": "三個問題都各改一點",
          "consequence": "你協調三處小改動，團隊看見多個可繼續發展的方向。不過有限時間被分散，幾處改動還沒有完整測試，開發同事把它們標記為待確認。",
          "evidence": [
            {
              "behaviour": "Broad exploration",
              "evidence": "你把有限時間分配到三個問題，先各做一項小改動。",
              "id": "ux-community-signup:d3:c:0",
              "sourceDecisionId": "d3",
              "sourceOptionId": "c"
            }
          ],
          "description": "讓三個問題都有初步改動，但完整驗證的時間會被分散。",
          "handoff": {
            "nextDecisionId": "d4",
            "narrative": "你帶著三項改動和驗證清單進入上線前會議。同事又提出新增功能，團隊要先對剩餘工作與上線範圍達成共識。"
          }
        }
      ],
      "phase": "在限期內安排工作",
      "workplaceContext": "星期三，開發同事整合前一天的試用紀錄，並完成一次端到端檢查。清單上有三件事：手機上不易找到送出按鈕、家庭資料仍需釐清，以及活動日期排版擠在一起。兩天後開放報名，眼前的開發時段只夠完整處理一件事。",
      "sequence": 3
    },
    {
      "id": "d4",
      "scenario": "一位同事建議加入更多功能，但使用者測試顯示大家最在意的是流程簡單。你會怎樣回應？",
      "options": [
        {
          "id": "a",
          "label": "把測試證據整理出來，和同事討論真正需要解決的問題",
          "consequence": "你展示居民卡住的位置，再詢問活動推薦希望解決什麼需要。團隊同意先集中完成報名，把推薦放進後續探索；這次討論花了時間，也留下大家能理解的取捨。",
          "evidence": [
            {
              "behaviour": "Evidence communication",
              "evidence": "你用使用者證據支持團隊討論，而不是只表達個人偏好。",
              "id": "ux-community-signup:d4:a:0",
              "sourceDecisionId": "d4",
              "sourceOptionId": "a"
            }
          ],
          "description": "把觀察帶進討論，同時了解同事提出功能的原因。",
          "handoff": {
            "nextDecisionId": "d5",
            "narrative": "會後，開發與前台共同檢查可發布的版本，補上必要的送出修正和求助提示；未完成的工作留在清單。新版本開放後，前台會收集仍需協助的情況。"
          }
        },
        {
          "id": "b",
          "label": "先加入功能，之後再看效果",
          "consequence": "你把活動推薦加入候選版本，讓同事和居民能具體試用。有人對其他活動感興趣，也有人分心離開報名；測試時間被分走，團隊需要在發布前再次確認核心流程。",
          "evidence": [
            {
              "behaviour": "Experimenting",
              "evidence": "你先把新功能放進候選版本，讓團隊與使用者試用。",
              "id": "ux-community-signup:d4:b:0",
              "sourceDecisionId": "d4",
              "sourceOptionId": "b"
            }
          ],
          "description": "先讓想法成為可試用的功能，再以實際反應決定後續處理。",
          "handoff": {
            "nextDecisionId": "d5",
            "narrative": "發布檢查時，小組把推薦移到完成報名之後，並共同確認送出修正和求助提示可用。這是團隊根據試用作的後續調整；新版本開放後，前台繼續記錄支援需要。"
          }
        },
        {
          "id": "c",
          "label": "直接拒絕新功能",
          "consequence": "你表示這次先不加入推薦，開發同事因此能維持交付範圍。提出建議的同事仍不清楚原因，統籌安排一次短討論，把限期和居民的需要說清楚。",
          "evidence": [
            {
              "behaviour": "Focus protecting",
              "evidence": "你優先保護目前最重要的產品目標。",
              "id": "ux-community-signup:d4:c:0",
              "sourceDecisionId": "d4",
              "sourceOptionId": "c"
            }
          ],
          "description": "先守住這次交付範圍；之後仍需要向同事說明你的考量。",
          "handoff": {
            "nextDecisionId": "d5",
            "narrative": "補充討論後，團隊保留推薦作為之後的議題，並共同檢查送出修正與求助提示。版本按原範圍開放，前台開始記錄居民實際使用時的困難。"
          }
        }
      ],
      "phase": "協調上線範圍",
      "workplaceContext": "星期四的上線前會議，同事想加入活動推薦功能，讓居民更容易發現其他活動。前台擔心報名流程變長，開發同事則需要明確的交付範圍。先前測試的共同觀察是：居民希望先把眼前的報名完成。你要回應這個新提議。",
      "sequence": 4
    },
    {
      "id": "d5",
      "scenario": "新版本推出後，完成率提升了，但部分長者仍然需要職員協助。你會怎樣看這個結果？",
      "options": [
        {
          "id": "a",
          "label": "把它視為下一輪要理解的問題，而不是「失敗」",
          "consequence": "你提議觀察幾次前台協助，了解長者卡在哪裡。統籌同意安排下一輪，但需要協調職員與居民的時間；本輪先記下尚未釐清的問題。",
          "evidence": [
            {
              "behaviour": "Iterative learning",
              "evidence": "你把未解決的問題視為下一輪探索，而不是一次性的成敗。",
              "id": "ux-community-signup:d5:a:0",
              "sourceDecisionId": "d5",
              "sourceOptionId": "a"
            }
          ],
          "description": "把未解決的情況帶進下一輪觀察，也要和團隊安排時間。",
          "handoff": {
            "nextDecisionId": null,
            "narrative": "你把已交付的修改、下一輪問題和所需支援寫進交接紀錄。這段體驗先告一段落，接下來回顧你做過的五個決定，再自行選擇是否反思。"
          }
        },
        {
          "id": "b",
          "label": "既然整體完成率提升，就先結束項目",
          "consequence": "你建議依這輪的交付目標結項，讓團隊轉到其他工作。統籌保留前台協助和未解問題紀錄，但暫時沒有安排進一步觀察；長者的困難仍未被深入理解。",
          "evidence": [
            {
              "behaviour": "Delivery focus",
              "evidence": "你重視達成已定義的整體成果並結束這輪工作。",
              "id": "ux-community-signup:d5:b:0",
              "sourceDecisionId": "d5",
              "sourceOptionId": "b"
            }
          ],
          "description": "完成本輪交付並釋出團隊時間，尚未解決的需要仍要記錄。",
          "handoff": {
            "nextDecisionId": null,
            "narrative": "你把本輪成果與暫未安排的支援研究交給統籌。接下來回顧你做過的五個決定；結項不會替你判定是否適合這份工作。"
          }
        },
        {
          "id": "c",
          "label": "立即把整個流程重做一次",
          "consequence": "你開始重做整個流程的草稿，提出更大幅度的可能性。開發同事估算這需要新的時段，前台也提醒目前還不知道長者的具體障礙；是否實作仍待團隊討論。",
          "evidence": [
            {
              "behaviour": "Bold redesign",
              "evidence": "你在問題仍存在時，選擇提出整體流程的重做方案。",
              "id": "ux-community-signup:d5:c:0",
              "sourceDecisionId": "d5",
              "sourceOptionId": "c"
            }
          ],
          "description": "探索較大的結構改變，需要重新確認問題範圍與投入的資源。",
          "handoff": {
            "nextDecisionId": null,
            "narrative": "你把重做草稿、資源需求和待確認的問題放進交接紀錄。接下來回顧你做過的五個決定，留意自己想再了解哪一段工作。"
          }
        }
      ],
      "phase": "跟進實際使用",
      "workplaceContext": "下一星期，小組回顧正式報名情況。團隊的共同發布檢查讓核心流程能運作，整體完成情況比之前改善；前台仍陪幾位長者完成報名，尚未釐清是文字、操作還是其他支援需要。統籌請你提出這一輪結束後的安排。",
      "sequence": 5
    }
  ],
  "presentation": {
    "settingLabel": "香港社區中心 · 報名服務小組",
    "confirmationImage": "/assets/story/confirmation-setting.png",
    "consequenceImage": "/assets/story/consequence-setting.png",
    "avatarImage": "/assets/story/alex.svg"
  },
  "version": "1.0.0",
  "titleZh": "令人困惑的報名流程",
  "estimatedMinutes": 7,
  "learningObjectives": [
    "理解使用者的需要",
    "設計與驗證改善方案",
    "與團隊協調交付"
  ],
  "vocabulary": [
    {
      "term": "User interview",
      "zh": "使用者訪談",
      "explanation": "透過與真實使用者交談，了解他們做事時遇到的困難。",
      "example": "例如：請居民實際完成報名，再問他們在哪一步最困惑。",
      "id": "ux-d1-0"
    }
  ],
  "nextStepSuggestions": []
}
