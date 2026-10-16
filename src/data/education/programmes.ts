import type { EducationProgramme } from '../../types/education'

// Editorial Traditional Chinese summaries of specifically identified official sections.
// Never use this collection to decide a student's eligibility.
export const educationProgrammes: EducationProgramme[] = [{
  id: 'polyu-js3569-2027', officialProgrammeCode: 'JS3569',
  programmeName: 'Bachelor of Arts (Honours) Scheme in Design', institution: '香港理工大學',
  qualificationLevel: '榮譽文學士學位組合課程（設計）', applicationChannel: 'JUPAS（本紀錄僅涵蓋聯招途徑）', admissionYear: '2027/28',
  generalEntranceRequirements: { admissionYear: '2027/28', sourceIds: ['polyu-general'], verificationStatus: 'verified', text: '一般 HKDSE 要求摘要：中國語文及英國語文達第 3 級、數學達第 2 級、公民與社會發展科達「達標」，以及兩科選修科達第 3 級。M1／M2 的計算、應用學習、替代資格及例外須查閱完整官方說明。這不是所有大學的共同要求。' },
  programmeSpecificRequirements: { admissionYear: '2027/28', sourceIds: ['polyu-design-2027'], verificationStatus: 'verified', text: '官方聯招說明列出作品集提交及獲邀者面試；部分申請者的豁免安排須向院校核實。請直接查閱當屆作品集形式、時段及通知，這裡不列申請截止日期。' },
  otherConditions: { admissionYear: '2027/28', sourceIds: ['polyu-design-2027'], verificationStatus: 'verified', text: '此課程只考慮把它列為 Band A 的聯招申請者。課程包含互動設計等方向；入讀學位組合課程不等於保證獲分配任何指定專修。' },
  officialUrl: 'https://www.polyu.edu.hk/study/ug/jupas/2027/js3569', sourceIds: ['polyu-design-2027', 'polyu-general'],
  lastVerifiedAt: '2026-10-16', reviewBy: '2026-11-15', verificationStatus: 'verified',
}]
