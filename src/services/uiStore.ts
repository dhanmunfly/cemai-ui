import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  role: 'operator' | 'manager' | 'engineer'
  setRole: (r: UiState['role']) => void
}

const getInitialCollapsed = (): boolean => {
  try {
    if (typeof window === 'undefined') return false
    const v = window.localStorage.getItem('sidebarCollapsed')
    return v === 'true'
  } catch {
    return false
  }
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: getInitialCollapsed(),
  setSidebarCollapsed: (collapsed) => {
    try { window.localStorage.setItem('sidebarCollapsed', String(collapsed)) } catch {}
    set({ sidebarCollapsed: collapsed })
  },
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed
    try { window.localStorage.setItem('sidebarCollapsed', String(next)) } catch {}
    set({ sidebarCollapsed: next })
  },
  role: 'operator',
  setRole: (r) => set({ role: r }),
}))


