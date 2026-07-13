import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../i18n/strings'
import { SYSTEMS, type SystemId } from '../data/systems'
import { BY_ID } from '../data/terminology'

export type PanelId = 'none' | 'search' | 'layers' | 'tools' | 'tours' | 'library' | 'info'
export type Axis = 'x' | 'y' | 'z'
export type Sex = 'male' | 'female'

interface ClipState { enabled: boolean; axis: Axis; value: number; flip: boolean }

interface State {
  lang: Lang
  ready: boolean
  sex: Sex

  visibleSystems: SystemId[]
  selectedId: string | null
  hoveredId: string | null

  fadeOthers: boolean
  isolateStructure: boolean
  showFeatures: boolean
  autoRotate: boolean
  clip: ClipState

  favorites: string[]
  notes: Record<string, string>
  hidden: string[]

  panel: PanelId
  focusNonce: number
  resetNonce: number

  activeTour: string | null
  tourStep: number

  // actions
  setLang: (l: Lang) => void
  toggleLang: () => void
  setReady: (r: boolean) => void
  setSex: (s: Sex) => void

  toggleSystem: (id: SystemId) => void
  setSystemVisible: (id: SystemId, v: boolean) => void
  showOnlySystem: (id: SystemId) => void
  showAllSystems: () => void

  select: (id: string | null, focus?: boolean) => void
  hover: (id: string | null) => void
  requestFocus: () => void
  requestReset: () => void

  setFadeOthers: (v: boolean) => void
  setIsolateStructure: (v: boolean) => void
  setShowFeatures: (v: boolean) => void
  setAutoRotate: (v: boolean) => void
  setClip: (p: Partial<ClipState>) => void

  toggleFavorite: (id: string) => void
  setNote: (id: string, text: string) => void

  hideStructure: (id: string) => void
  unhideStructure: (id: string) => void
  clearHidden: () => void

  setPanel: (p: PanelId) => void

  startTour: (id: string) => void
  tourGoto: (step: number) => void
  endTour: () => void
}

const defaultVisible = SYSTEMS.filter((s) => s.defaultVisible).map((s) => s.id)

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      lang: 'ar',
      ready: false,
      sex: 'male',
      visibleSystems: defaultVisible,
      selectedId: null,
      hoveredId: null,
      fadeOthers: false,
      isolateStructure: false,
      showFeatures: false,
      autoRotate: false,
      clip: { enabled: false, axis: 'x', value: 0, flip: false },
      favorites: [],
      notes: {},
      hidden: [],
      panel: 'none',
      focusNonce: 0,
      resetNonce: 0,
      activeTour: null,
      tourStep: 0,

      setLang: (l) => {
        set({ lang: l })
        document.documentElement.lang = l
        document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
      },
      toggleLang: () => get().setLang(get().lang === 'ar' ? 'en' : 'ar'),
      setReady: (r) => set({ ready: r }),
      setSex: (s) => set({ sex: s }),

      toggleSystem: (id) =>
        set((s) => ({
          visibleSystems: s.visibleSystems.includes(id)
            ? s.visibleSystems.filter((x) => x !== id)
            : [...s.visibleSystems, id],
        })),
      setSystemVisible: (id, v) =>
        set((s) => ({
          visibleSystems: v
            ? Array.from(new Set([...s.visibleSystems, id]))
            : s.visibleSystems.filter((x) => x !== id),
        })),
      showOnlySystem: (id) => set({ visibleSystems: [id] }),
      showAllSystems: () => set({ visibleSystems: SYSTEMS.map((s) => s.id) }),

      select: (id, focus = true) => {
        if (id) {
          const st = BY_ID.get(id)
          if (st) {
            const vs = get().visibleSystems
            if (!vs.includes(st.system)) set({ visibleSystems: [...vs, st.system] })
          }
          set((s) => ({ selectedId: id, panel: 'info', focusNonce: focus ? s.focusNonce + 1 : s.focusNonce }))
        } else {
          set({ selectedId: null })
        }
      },
      hover: (id) => set({ hoveredId: id }),
      requestFocus: () => set((s) => ({ focusNonce: s.focusNonce + 1 })),
      requestReset: () =>
        set((s) => ({ resetNonce: s.resetNonce + 1, selectedId: null, clip: { ...s.clip, enabled: false } })),

      setFadeOthers: (v) => set({ fadeOthers: v }),
      setIsolateStructure: (v) => set({ isolateStructure: v }),
      setShowFeatures: (v) => set({ showFeatures: v }),
      setAutoRotate: (v) => set({ autoRotate: v }),
      setClip: (p) => set((s) => ({ clip: { ...s.clip, ...p } })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      setNote: (id, text) =>
        set((s) => {
          const notes = { ...s.notes }
          if (text.trim()) notes[id] = text
          else delete notes[id]
          return { notes }
        }),

      // Persisted per-structure visibility. Hiding a structure keeps it hidden
      // across sessions until the user restores it. Hiding the currently
      // selected structure also closes its info panel.
      hideStructure: (id) =>
        set((s) => ({
          hidden: s.hidden.includes(id) ? s.hidden : [...s.hidden, id],
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),
      unhideStructure: (id) => set((s) => ({ hidden: s.hidden.filter((x) => x !== id) })),
      clearHidden: () => set({ hidden: [] }),

      setPanel: (p) => set((s) => ({ panel: s.panel === p ? 'none' : p })),

      startTour: (id) => set({ activeTour: id, tourStep: 0, panel: 'none' }),
      tourGoto: (step) => set({ tourStep: step }),
      endTour: () => set({ activeTour: null, tourStep: 0 }),
    }),
    {
      name: 'haies-anatomy',
      partialize: (s) => ({
        lang: s.lang,
        sex: s.sex,
        favorites: s.favorites,
        notes: s.notes,
        hidden: s.hidden,
        visibleSystems: s.visibleSystems,
      }),
    },
  ),
)
