import type { ReflectionData } from '../types'

export const engagingOptions = ['理解別人的需要', '分析問題', '創造解決方案', '整理資訊', '和別人合作', '沒有特別感覺']
export const difficultOptions = ['和陌生人溝通', '做取捨', '反覆修改', '處理大量資訊', '時間壓力', '沒有特別感覺']
export const interestOptions = ['很想', '可能會', '還不確定', '暫時不想']
export function reflectionLines(reflection: ReflectionData): string[] {
  const fields: [string, string | undefined][] = [
    ['最投入', reflection.engagingParts?.join('、')], ['感到困難或消耗精力', reflection.difficultParts?.join('、')],
    ['其他困難', reflection.difficultOther], ['想深入嘗試', reflection.furtherExploration],
    ['想繼續探索嗎', reflection.interestToContinue], ['想記下來的事', reflection.additionalNotes],
  ]
  return fields.flatMap(([label, value]) => value?.trim() ? [`${label}：${value}`] : [])
}
