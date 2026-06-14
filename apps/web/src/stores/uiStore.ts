// ============================================================
// UI STORE - Global UI state (khong persist)
// ============================================================

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { TOAST_TYPE, type Toast, type ToastType } from '@/types'

// ------------------------------------------------------------
// STATE TYPE
// ------------------------------------------------------------

interface UIState {
  isMobileMenuOpen: boolean
  activeModal: string | null
  toasts: Toast[]
  isPageLoading: boolean
  toastSequence: number
}

// ------------------------------------------------------------
// ACTIONS TYPE
// ------------------------------------------------------------

interface UIActions {
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (toastId: string) => void
  clearToasts: () => void
  setPageLoading: (isLoading: boolean) => void
}

// ------------------------------------------------------------
// STORE TYPE
// ------------------------------------------------------------

type UIStore = UIState & UIActions

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const DEFAULT_TOAST_DURATION = 5000
const MAX_VISIBLE_TOASTS = 5

function generateToastId(sequence: number): string {
  return `toast-${sequence}`
}

function buildToastInput(
  type: ToastType,
  title: string,
  message?: string,
): Omit<Toast, 'id'> {
  if (message === undefined) {
    return { type, title }
  }

  return { type, title, message }
}

// ------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------

const INITIAL_STATE: UIState = {
  isMobileMenuOpen: false,
  activeModal: null,
  toasts: [],
  isPageLoading: false,
  toastSequence: 0,
}

// ------------------------------------------------------------
// STORE
// ------------------------------------------------------------

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

    showToast: (toastData) => {
      set((state) => {
        state.toastSequence += 1

        const toast: Toast = {
          ...toastData,
          id: generateToastId(state.toastSequence),
          duration: toastData.duration ?? DEFAULT_TOAST_DURATION,
        }

        if (state.toasts.length >= MAX_VISIBLE_TOASTS) {
          state.toasts.shift()
        }

        state.toasts.push(toast)
      })
    },

    dismissToast: (toastId) => {
      set((state) => {
        state.toasts = state.toasts.filter((toast) => toast.id !== toastId)
      })
    },

    clearToasts: () => {
      set((state) => {
        state.toasts = []
      })
    },

    setPageLoading: (isLoading) => {
      set((state) => {
        state.isPageLoading = isLoading
      })
    },
  })),
)

// ------------------------------------------------------------
// SELECTORS
// ------------------------------------------------------------

export const selectIsMobileMenuOpen = (state: UIStore): boolean =>
  state.isMobileMenuOpen
export const selectActiveModal = (state: UIStore): string | null =>
  state.activeModal
export const selectToasts = (state: UIStore): Toast[] => state.toasts
export const selectIsPageLoading = (state: UIStore): boolean =>
  state.isPageLoading

// ------------------------------------------------------------
// CONVENIENCE HELPER
// ------------------------------------------------------------

export function createToastHelper(showToast: UIStore['showToast']) {
  return {
    success: (title: string, message?: string) =>
      showToast(buildToastInput(TOAST_TYPE.SUCCESS, title, message)),
    error: (title: string, message?: string) =>
      showToast(buildToastInput(TOAST_TYPE.ERROR, title, message)),
    warning: (title: string, message?: string) =>
      showToast(buildToastInput(TOAST_TYPE.WARNING, title, message)),
    info: (title: string, message?: string) =>
      showToast(buildToastInput(TOAST_TYPE.INFO, title, message)),
  }
}
