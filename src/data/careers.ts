import { careers } from './careerMetadata'
export { uxStory } from './stories/uxCommunitySignup'

export const industries = [
  { name: '科技與數碼', fields: ['軟件開發', '數據', 'AI', '網絡安全'] },
  { name: '設計與創意', fields: ['UX / UI', '平面設計', '產品設計', '建築與空間'] },
  { name: '商業與金融', fields: ['市場推廣', '金融分析', '創業', '營運管理'] },
  { name: '社區與教育', fields: ['青年工作', '教學', '社會服務', '活動策劃'] },
  { name: '醫療與健康', fields: ['護理', '公共健康', '復康', '健康科技'] },
  { name: '工程與建造', fields: ['土木工程', '建築工程', '機械工程', '城市基建'] },
  { name: '環境與可持續發展', fields: ['環境顧問', '可持續設計', '能源', '城市韌性'] },
  { name: '媒體與傳播', fields: ['內容創作', '新聞', '品牌傳播', '數碼媒體'] },
]

export const explorationQuestions = [
  {
    id: 'q1',
    text: '如果一個社區活動報名網站讓很多人感到困惑，你比較想先做哪件事？',
    options: [
      { id: 'a', label: '和使用者聊聊，找出他們卡在哪裡', tags: ['Helping People', 'User Listening'] },
      { id: 'b', label: '直接動手重新整理頁面', tags: ['Making', 'Experimenting'] },
      { id: 'c', label: '看看數據，找出最多人離開的位置', tags: ['Systems Thinking', 'Problem Framing'] },
    ],
  },
  {
    id: 'q2',
    text: '一個活動突然出了問題，你比較自然會做什麼？',
    options: [
      { id: 'a', label: '先和大家確認發生了什麼', tags: ['User Listening', 'Helping People'] },
      { id: 'b', label: '快速提出一個可行方案', tags: ['Making', 'Experimenting'] },
      { id: 'c', label: '把問題拆成幾部分逐一處理', tags: ['Organising', 'Systems Thinking'] },
    ],
  },
  {
    id: 'q3',
    text: '如果你要完成一個新的小組任務，哪部分最容易讓你好奇？',
    options: [
      { id: 'a', label: '了解不同人的想法', tags: ['User Listening', 'Helping People'] },
      { id: 'b', label: '把想法做成看得到的東西', tags: ['Making', 'Experimenting'] },
      { id: 'c', label: '安排流程，確保事情能完成', tags: ['Organising', 'Systems Thinking'] },
    ],
  },
  {
    id: 'q4',
    text: '當你要解釋一個複雜概念時，你比較想怎樣做？',
    options: [
      { id: 'a', label: '先問對方哪裡最不明白', tags: ['User Listening', 'Explaining'] },
      { id: 'b', label: '畫圖或做一個例子', tags: ['Making', 'Explaining'] },
      { id: 'c', label: '把概念拆成幾個步驟', tags: ['Organising', 'Explaining'] },
    ],
  },
  {
    id: 'q5',
    text: '如果第一次方案效果不好，你比較願意做什麼？',
    options: [
      { id: 'a', label: '再聽聽使用者的反應', tags: ['User Listening', 'Problem Framing'] },
      { id: 'b', label: '改一個小地方再試一次', tags: ['Experimenting', 'Making'] },
      { id: 'c', label: '重新整理問題，看是不是方向錯了', tags: ['Systems Thinking', 'Problem Framing'] },
    ],
  },
]

export const careerIdeas = careers.filter(c => c.storyIds.length).map(c => ({ ...c, zh: c.titleZh, live: true }))
