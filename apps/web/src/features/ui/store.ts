'use client'

// ============================================================
// UI STORE - Global UI state (khong persist)
// ============================================================

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  isMobileMenuOpen: boolean
  activeModal: string | null
  isPageLoading: boolean
}

interface UIActions {
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  setPageLoading: (isLoading: boolean) => void
}

type UIStore = UIState & UIActions

const INITIAL_STATE: UIState = {
  isMobileMenuOpen: false,
  activeModal: null,
  isPageLoading: false,
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    ...INITIAL_STATE,

    openMobileMenu: () => {
      set((state) => {
        state.isMobileMenuOpen = true
      })
    },

    closeMobileMenu: () => {
      set((state) => {
        state.isMobileMenuOpen = false
      })
    },

    toggleMobileMenu: () => {
      set((state) => {
        state.isMobileMenuOpen = !state.isMobileMenuOpen
      })
    },

    openModal: (modalId) => {
      set((state) => {
        state.activeModal = modalId
      })
    },

    closeModal: () => {
      set((state) => {
        state.activeModal = null
      })
    },

    setPageLoading: (isLoading) => {
      set((state) => {
        state.isPageLoading = isLoading
      })
    },
  })),
)

export const selectIsMobileMenuOpen = (state: UIStore): boolean =>
  state.isMobileMenuOpen
export const selectActiveModal = (state: UIStore): string | null =>
  state.activeModal
export const selectIsPageLoading = (state: UIStore): boolean =>
  state.isPageLoading
