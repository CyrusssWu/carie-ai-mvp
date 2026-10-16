import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { NextStep, PassportEntry, ReflectionData, StoryProgress, StudentData, StudentProfile } from '../types'
import { explorationQuestions } from '../data/careers'
import { restoreProfile } from './storage'
import { activateStory, beginStoryRun, saveCurrentRun, updateEntry, updateRunDraft } from './experience'
import { LocalStudentDataRepository, STUDENT_DATA_KEY } from '../repositories/LocalStudentDataRepository'
import type { RepositoryResult } from '../repositories/StudentDataRepository'

type Setter<T> = React.Dispatch<React.SetStateAction<T>>
type AppContextValue = {
  profile: StudentProfile; setProfile: Setter<StudentProfile>
  storyProgress: StoryProgress; setStoryProgress: Setter<StoryProgress>
  reflection: ReflectionData; setReflection: Setter<ReflectionData>
  nextSteps: NextStep[]; setNextSteps: Setter<NextStep[]>
  passport: PassportEntry[]
  saveExperience: () => boolean
  editPassportEntry: (id: string, patch: { reflection?: ReflectionData; nextSteps?: NextStep[] }) => boolean
  startNewStory: (storyId?: string) => boolean
  resumeStory: (storyId: string) => boolean
  progressForStory: (storyId: string) => StoryProgress | undefined
  recomputeTags: (answers: Record<string, string>) => string[]
  storageError: boolean; storageNotice: string; storageMessage: string
  retrySave: () => void; reloadData: () => void
  deleteExperience: (id: string) => boolean
  clearAllData: () => boolean
  exportData: () => { ok: true; json: string } | { ok: false; error: string }
}
const AppContext = createContext<AppContextValue | null>(null)
const resolve = <T,>(value: React.SetStateAction<T>, previous: T): T => typeof value === 'function' ? (value as (p: T) => T)(previous) : value

export function AppProvider({ children }: { children: ReactNode }) {
  const [repository] = useState(() => new LocalStudentDataRepository(() => localStorage))
  const [boot] = useState(() => repository.load())
  const [data, setData] = useState(boot.data)
  const current = useRef(data)
  const dirty = useRef(!boot.ok)
  const [storageMessage, setStorageMessage] = useState(boot.error ?? '')
  const [storageNotice, setStorageNotice] = useState(boot.notice ?? '')
  const adopt = (next: StudentData) => { current.current = next; setData(next) }
  const accept = (result: RepositoryResult, force = false) => {
    // Partial cleanup failures still committed the deletion. Reflect that truth.
    if (result.ok || force || result.data.revision !== current.current.revision) adopt(result.data)
    dirty.current = !result.ok
    setStorageMessage(result.error ?? ''); setStorageNotice(result.notice ?? '')
    return result.ok
  }
  const change = (update: (previous: StudentData) => StudentData) => {
    const next = update(current.current)
    const result = repository.save(next)
    if (result.ok || result.data.pendingCleanup) return accept(result)
    // Keep an unsaved draft visible, but never report it as persisted.
    adopt(next); dirty.current = true; setStorageMessage(result.error ?? '未能儲存。')
    return false
  }
  const reloadData = () => accept(repository.load(), true)
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== STUDENT_DATA_KEY && event.key !== null) return
      if (dirty.current) { setStorageMessage('另一個頁面已更改資料。請保留需要的文字，再重新讀取；未保存的修改會被取代。'); return }
      accept(repository.load(), true)
    }
    window.addEventListener('storage', changed)
    return () => window.removeEventListener('storage', changed)
  }, [repository])
  const experience = data.experience
  const value = useMemo<AppContextValue>(() => ({
    profile: data.profile,
    setProfile: value => { change(previous => {
      const profile = restoreProfile(resolve(value, previous.profile))
      // Explicit removal must also clear recovery copies that may contain the deleted answers.
      return { ...previous, profile, ...(previous.profile.academicStartingPoint && !profile.academicStartingPoint ? { pendingCleanup: true } : {}) }
    }) },
    storyProgress: experience.storyProgress,
    setStoryProgress: value => { change(previous => ({ ...previous, experience: { ...previous.experience, storyProgress: resolve(value, previous.experience.storyProgress) } })) },
    reflection: experience.reflection,
    setReflection: value => { change(previous => ({ ...previous, experience: updateRunDraft(previous.experience, { reflection: resolve(value, previous.experience.reflection) }) })) },
    nextSteps: experience.nextSteps,
    setNextSteps: value => { change(previous => ({ ...previous, experience: updateRunDraft(previous.experience, { nextSteps: resolve(value, previous.experience.nextSteps) }) })) },
    passport: experience.passport,
    saveExperience: () => {
      if (!current.current.experience.storyProgress.completed) { setStorageMessage('請先完成故事，再保存這次體驗。'); return false }
      return change(previous => ({ ...previous, experience: saveCurrentRun(previous.experience) }))
    },
    editPassportEntry: (id, patch) => change(previous => ({ ...previous, experience: updateEntry(previous.experience, id, patch) })),
    startNewStory: storyId => change(previous => ({ ...previous, experience: beginStoryRun(previous.experience, storyId ?? previous.experience.storyProgress.storyId) })),
    resumeStory: storyId => change(previous => ({ ...previous, experience: activateStory(previous.experience, storyId) })),
    progressForStory: storyId => experience.storyProgress.storyId === storyId ? experience.storyProgress : experience.suspendedRuns?.find(r => r.storyProgress.storyId === storyId)?.storyProgress,
    recomputeTags: answers => [...new Set(explorationQuestions.flatMap(q => q.options.find(o => o.id === answers[q.id])?.tags ?? []))],
    storageError: !!storageMessage, storageMessage, storageNotice,
    retrySave: () => { change(previous => previous) }, reloadData,
    deleteExperience: id => accept(repository.deleteEntry(current.current, id)),
    clearAllData: () => accept(repository.clearAll()),
    exportData: () => repository.exportData(),
  }), [data, storageMessage, storageNotice])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
