import type { ReflectionData } from '../types'
import { reflectionLines } from '../data/reflection'

export function ReflectionSummary({ reflection }: { reflection: ReflectionData }) {
  const lines = reflectionLines(reflection)
  return <div className="mt-2 space-y-2 break-words whitespace-pre-wrap text-sm text-slate-600">{lines.length ? lines.map(line => <p key={line}>{line}</p>) : <p>這次沒有記錄特定感受。</p>}</div>
}
