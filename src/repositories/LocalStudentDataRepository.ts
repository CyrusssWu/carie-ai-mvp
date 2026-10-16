import type { StudentData } from '../types'
import type { RepositoryResult, StudentDataRepository } from './StudentDataRepository'
import { beginStoryRun, loadExperience, restoreExperience } from '../context/experience'
import { restoreProfile } from '../context/storage'
import { findStory } from '../data/stories/catalog'

export const STUDENT_DATA_KEY = 'carie_student_data_v3'
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>
const object = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}
const parse = (raw: string | null): unknown => { try { return JSON.parse(raw ?? 'null') } catch { return null } }
const id = () => crypto.randomUUID()
const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)])) : v
const same = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b))
export const freshStudentData = (): StudentData => ({ schemaVersion: 3, localProfileId: id(), revision: id(), profile: restoreProfile(null), experience: restoreExperience(null) })
export function validateStudentData(value: unknown): StudentData {
  const raw = object(value)
  return { schemaVersion: 3,
    localProfileId: typeof raw.localProfileId === 'string' && raw.localProfileId ? raw.localProfileId : id(),
    revision: typeof raw.revision === 'string' && raw.revision ? raw.revision : id(),
    profile: restoreProfile(raw.profile), experience: restoreExperience(raw.experience),
    ...(raw.pendingCleanup === true ? { pendingCleanup: true } : {}),
  }
}

export class LocalStudentDataRepository implements StudentDataRepository {
  private lastRaw: string | null = null
  private current = freshStudentData()
  private blocked = false
  private ready = false
  constructor(private storage: () => StoragePort) {}

  private failure(error: string, conflict = false): RepositoryResult { return { ok: false, data: this.current, error, conflict } }
  private backup(store: StoragePort, key: string, raw: string) {
    // Never replace an earlier recovery copy with a later damaged document.
    store.setItem(`${key}_recovery_${id()}`, raw)
  }
  private commit(data: StudentData): RepositoryResult {
    try {
      const store = this.storage()
      if (store.getItem(STUDENT_DATA_KEY) !== this.lastRaw) return this.failure('另一個頁面已更改資料。請重新載入最新記錄，避免覆蓋其他修改。', true)
      const saved = { ...data, revision: id() }
      const raw = JSON.stringify(saved)
      store.setItem(STUDENT_DATA_KEY, raw)
      this.lastRaw = raw; this.current = saved; this.ready = true
      return { ok: true, data: saved }
    } catch { return this.failure('這部裝置暫時無法儲存資料，可能是空間不足或瀏覽器限制。請保留此頁並重試。') }
  }
  load(): RepositoryResult {
    this.blocked = false
    try {
      const store = this.storage()
      this.lastRaw = store.getItem(STUDENT_DATA_KEY)
      let notice = ''
      if (this.lastRaw !== null) {
        const raw = parse(this.lastRaw)
        if (typeof object(raw).schemaVersion === 'number' && object(raw).schemaVersion !== 3) {
          this.blocked = true
          return this.failure('這份資料使用其他版本，已保留原檔。請使用相容版本開啟，或明確清除資料後重新開始。')
        }
        const experience = object(object(raw).experience)
        const runs = [experience, ...(Array.isArray(experience.suspendedRuns) ? experience.suspendedRuns : [])]
        if (runs.some(r => { const p = object(object(r).storyProgress); return typeof p.storyVersion === 'string' && !findStory(p.storyId, p.storyVersion) })) {
          this.blocked = true
          return this.failure('這份進度使用未安裝的故事版本。原資料已保留，請使用包含該版本的應用程式開啟。')
        }
        this.current = validateStudentData(raw)
        this.ready = true
        if (!same(raw, this.current)) {
          this.backup(store, STUDENT_DATA_KEY, this.lastRaw)
          notice = '部分本地資料不完整，已恢復可讀取的記錄。請檢查你的 Passport。'
          const result = this.commit(this.current)
          if (!result.ok) return result
        }
      } else {
        const migrated = loadExperience(store)
        const profileRaw = store.getItem('carie_profile_v1')
        const profile = restoreProfile(parse(profileRaw))
        this.current = { ...freshStudentData(), experience: migrated.data, profile }
        if (migrated.writeBlocked) { this.blocked = true; return this.failure(migrated.notice) }
        if (profileRaw && !same(parse(profileRaw), profile)) this.backup(store, 'carie_profile_v1', profileRaw)
        this.ready = true
        const hadLegacy = this.keys(store).some(k => k.startsWith('carie_'))
        notice = migrated.notice || (hadLegacy ? '已讀取舊版本地資料並升級保存格式。舊副本會保留至你主動刪除資料。' : '')
        const saved = this.commit(this.current)
        if (!saved.ok) return saved
      }
      this.ready = true
      if (this.current.pendingCleanup) return this.finishCleanup(this.current)
      return { ok: true, data: this.current, notice }
    } catch {
      this.blocked = true
      return this.failure('無法完整讀取或備份本地資料。原資料未被覆蓋；請保留此頁，檢查瀏覽器儲存設定。')
    }
  }
  save(data: StudentData): RepositoryResult {
    if (this.blocked || !this.ready) return this.failure('原資料尚未能安全讀取或備份，暫停寫入以免覆蓋。請檢查瀏覽器儲存設定後重新讀取。')
    if (data.revision !== this.current.revision) return this.failure('這份修改來自較舊的資料版本。請重新讀取最新記錄，避免覆蓋其他修改。', true)
    const normalized = validateStudentData(data)
    if (!same(data, normalized)) return this.failure('資料格式不完整，尚未寫入。請檢查目前記錄。')
    const result = this.commit(normalized)
    return result.ok && normalized.pendingCleanup ? this.finishCleanup(result.data) : result
  }
  private keys(store: StoragePort) {
    const keys: string[] = []
    for (let i = 0; i < store.length; i++) { const key = store.key(i); if (key) keys.push(key) }
    return keys
  }
  private finishCleanup(data: StudentData): RepositoryResult {
    try {
      const store = this.storage()
      if (store.getItem(STUDENT_DATA_KEY) !== this.lastRaw) return this.failure('另一個頁面已更改資料，請重新載入後完成清除。', true)
      for (const key of this.keys(store)) if (key.startsWith('carie_') && key !== STUDENT_DATA_KEY) store.removeItem(key)
      const { pendingCleanup: _pending, ...clean } = data
      return this.commit(clean)
    } catch { return this.failure('主記錄已更新，但部分舊版或復原副本未能清除。請重試清理；目前不要把刪除視為完成。') }
  }
  deleteEntry(data: StudentData, entryId: string): RepositoryResult {
    if (this.blocked || !this.ready) return this.failure('請先成功讀取記錄，再刪除這次體驗。')
    const entry = data.experience.passport.find(e => e.id === entryId)
    let experience = { ...data.experience, passport: data.experience.passport.filter(e => e.id !== entryId) }
    if (entry?.storyRunId === experience.storyProgress.storyRunId) experience = beginStoryRun(experience, experience.storyProgress.storyId)
    if (experience.suspendedRuns) {
      const suspendedRuns = experience.suspendedRuns.filter(r => r.storyProgress.storyRunId !== entry?.storyRunId)
      const { suspendedRuns: _old, ...rest } = experience
      experience = { ...rest, ...(suspendedRuns.length ? { suspendedRuns } : {}) }
    }
    // Commit the canonical deletion first. Never remove primary data before cleanup.
    return this.save({ ...data, experience, pendingCleanup: true })
  }
  clearAll(): RepositoryResult {
    // Explicit user confirmation authorizes replacing unreadable data as well.
    const result = this.commit({ ...freshStudentData(), pendingCleanup: true })
    if (!result.ok) return result
    this.blocked = false
    return this.finishCleanup(result.data)
  }
  exportData(): { ok: true; json: string } | { ok: false; error: string } {
    try {
      const raw = this.storage().getItem(STUDENT_DATA_KEY)
      if (raw !== this.lastRaw || this.blocked || !raw) return { ok: false, error: '未能讀取最新已保存資料。請先重新讀取後再導出。' }
      const data = validateStudentData(parse(raw))
      return { ok: true, json: JSON.stringify({ format: 'carie-ai-student-data', schemaVersion: 3, exportedAt: new Date().toISOString(), localProfileId: data.localProfileId, profile: data.profile, experience: data.experience }, null, 2) }
    } catch { return { ok: false, error: '無法讀取已保存資料，尚未建立導出檔案。' } }
  }
}
