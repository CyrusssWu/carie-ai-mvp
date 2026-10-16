import type { StudentData } from '../types'

export type RepositoryResult = {
  ok: boolean
  data: StudentData
  notice?: string
  error?: string
  conflict?: boolean
}
export interface StudentDataRepository {
  load(): RepositoryResult
  save(data: StudentData): RepositoryResult
  deleteEntry(data: StudentData, entryId: string): RepositoryResult
  clearAll(): RepositoryResult
  exportData(): { ok: true; json: string } | { ok: false; error: string }
}
