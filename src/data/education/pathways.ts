import type { CareerPathwayRelationship, EducationPathway, PathwayType } from '../../types/education'

const careerIds = ['ux-designer', 'logistics-coordinator', 'community-programme-coordinator']
const definitions: [PathwayType, string, string, string, string[], string[]][] = [
  ['bachelor', "Bachelor's Degree", '學士學位', '可查閱學位課程的學科內容、學習方式和個別入學要求。聯招與非聯招渠道各有適用條件。', ['了解專修方向、實習或進一步學習；各項安排以院校資料為準。'], ['edb-study', 'jupas']],
  ['associate', 'Associate Degree', '副學士', '副學位是可探索的專上教育途徑之一。可比較課程內容及後續升學安排。', ['可查閱高年級學位或銜接課程；銜接須符合個別課程要求，並非自動升讀。'], ['edb-study', 'ipass', 'eapp']],
  ['higher_diploma', 'Higher Diploma', '高級文憑', '可了解高級文憑的專業範疇、實作內容和各院校要求，再與其他路線比較。', ['查詢相關工作實踐或進修途徑；學分承認與銜接須逐一核實。'], ['edb-study', 'vtc', 'ipass']],
  ['vocational', 'Vocational / Professional Education', '職業專才教育', '從官方職業專才教育入口了解不同培訓選項。課程類型、資格及入學要求各有不同。', ['核實課程認可、培訓內容與後續進修條件。'], ['edb-links', 'vtc']],
  ['other', 'Other Further Study Routes', '其他進修與探索', '先使用官方查詢入口與老師討論，也可查看院校公布的體驗活動；這裡不預設任何活動日期。', ['記下想了解的學習領域，再查證可行的課程或活動。'], ['edb-study', 'enavigator']],
]
export const educationPathways: EducationPathway[] = definitions.map(([pathwayType, title, titleZh, description, progressionOptions, sourceIds]) => ({
  id: `hk-${pathwayType}`, pathwayType, title, titleZh, description, progressionOptions, sourceIds,
  relatedCareerIds: careerIds, relatedProgrammeIds: pathwayType === 'bachelor' ? ['polyu-js3569-2027'] : [],
}))
const fields: Record<string, string[]> = {
  'ux-designer': ['設計', '數碼產品與互動設計', '資訊科技'],
  'logistics-coordinator': ['物流與供應鏈', '營運', '商業'],
  'community-programme-coordinator': ['社會科學', '社區發展與教育', '活動及項目管理'],
}
export const careerPathwayRelationships: CareerPathwayRelationship[] = careerIds.flatMap(careerId => educationPathways.map(pathway => ({
  careerId, pathwayId: pathway.id, fields: fields[careerId], relationshipType: 'editorial_study_connection' as const,
  explanation: '以下是根據故事工作內容整理的學習查詢方向，並非院校對職業出路的認證、入學推薦或就業保證。請逐一核實課程是否涵蓋你想學的內容。',
  sourceIds: careerId === 'ux-designer' && pathway.pathwayType === 'bachelor' ? ['edb-study', 'polyu-design-2027'] : ['edb-study'],
})))
// A concrete course is only displayed for the career supported by its reviewed mapping.
export const programmeCareers: Record<string, string[]> = { 'polyu-js3569-2027': ['ux-designer'] }
