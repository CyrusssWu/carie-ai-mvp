import type { EducationSource } from '../../types/education'

// Manually reviewed, small registry. Access success is not programme verification.
export const educationSources: EducationSource[] = [
  { id: 'edb-links', organisation: '香港教育局', title: '生涯規劃：有用連結', url: 'https://lifeplanning.edb.gov.hk/tc/about-us/useful-links/', accessedAt: '2026-10-16', accessStatus: 'read', verificationNotes: '官方入口索引；頁面最後修改 2025-01-06，不能作為當屆課程入學要求。' },
  { id: 'edb-study', organisation: '香港教育局', title: '本地升學資訊網站', url: 'https://lifeplanning.edb.gov.hk/tc/study/local-further-study/websites-for-further-studies.html', accessedAt: '2026-10-16', accessStatus: 'read', verificationNotes: '核對學士、副學位及查詢渠道類別；最後修改 2025-04-22。路線說明為編輯摘要。' },
  { id: 'jupas', organisation: 'JUPAS', title: 'JUPAS 課程查詢', url: 'https://www.jupas.edu.hk/en/programmes-offered/', accessedAt: '2026-10-16', accessStatus: 'read', verificationNotes: '課程查詢入口，並非各課程共同入學標準。' },
  { id: 'vtc', organisation: '職業訓練局', title: 'VTC 入學資訊', url: 'https://www.vtc.edu.hk/admission/en/', accessedAt: '2026-10-16', accessStatus: 'unavailable', verificationNotes: '官方網站本次讀取失敗；未核實 2027/28 課程及要求。可經教育局索引再查。' },
  { id: 'ipass', organisation: '香港教育局', title: 'iPASS 經評審專上課程資料', url: 'https://www.cspe.edu.hk/tc/ipass/index.html', accessedAt: '2026-10-16', accessStatus: 'unavailable', verificationNotes: '網址由教育局索引確認；本次讀取逾時，未核實當屆內容。' },
  { id: 'eapp', organisation: '香港教育局', title: 'E-APP 專上課程電子預先報名平台', url: 'https://www.eapp.gov.hk/tc/index.html', accessedAt: '2026-10-16', accessStatus: 'unavailable', verificationNotes: '網址由教育局索引確認；本次回傳 502，申請期與參與課程待核實。' },
  { id: 'enavigator', organisation: '香港教育局', title: 'e導航網站', url: 'https://enavigator.edb.hkedcity.net/main/index.php', accessedAt: '2026-10-16', accessStatus: 'read', verificationNotes: '網站繼續更新；流動應用程式已於 2025-09-30 停止服務。本產品不匯入或傳送成績。' },
  { id: 'polyu-design-2027', organisation: '香港理工大學', title: 'JS3569 Design — Sept 2027 Entry', url: 'https://www.polyu.edu.hk/study/ug/jupas/2027/js3569', accessedAt: '2026-10-16', applicableYear: '2027/28', accessStatus: 'read', verificationNotes: '核對頁首代碼、學年、JUPAS Other Information 及一般要求連結。僅摘要；不匯入非聯招截止日期、排名或計分權重。' },
  { id: 'polyu-general', organisation: '香港理工大學', title: 'JUPAS General Entrance Requirements', url: 'https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-general-entrance-requirements', accessedAt: '2026-10-16', applicableYear: '2027/28', accessStatus: 'read', verificationNotes: '由 JS3569 的 2027 入學頁面連入核對；一般要求頁本身沒有獨立標注該學年。只應用於此理大課程，例外及替代資格須另查。' },
]
export const sourceById = (id: string) => educationSources.find(source => source.id === id)
