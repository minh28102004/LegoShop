// ============================================================
// UI TYPES - Component props patterns, khong chua business logic
// ============================================================

import type { ComponentType, ReactNode } from 'react'

// ------------------------------------------------------------
// SIZE & VARIANT - Dung const object pattern, khong dung enum
// ------------------------------------------------------------

export const SIZE = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const

export type Size = typeof SIZE[keyof typeof SIZE]

export const VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  OUTLINE: 'outline',
  DESTRUCTIVE: 'destructive',
  LINK: 'link',
} as const

export type Variant = typeof VARIANT[keyof typeof VARIANT]

export const COLOR_SCHEME = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
} as const

export type ColorScheme =
  (typeof COLOR_SCHEME)[keyof typeof COLOR_SCHEME]

// ------------------------------------------------------------
// NAVIGATION
// ------------------------------------------------------------

export interface NavigationItem {
  label: string
  href: string
  isExternal?: boolean
  icon?: string
  children?: NavigationItem[]
  badge?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

// ------------------------------------------------------------
// TOAST
// ------------------------------------------------------------

export const TOAST_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

export type ToastType = typeof TOAST_TYPE[keyof typeof TOAST_TYPE]

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

export interface ToastAction {
  label: string
  onClick: () => void
}

// ------------------------------------------------------------
// MODAL
// ------------------------------------------------------------

export interface ModalState {
  isOpen: boolean
  content?: ReactNode
  title?: string
}

// ------------------------------------------------------------
// FORM
// ------------------------------------------------------------

export const FIELD_STATE = {
  DEFAULT: 'default',
  FOCUS: 'focus',
  ERROR: 'error',
  SUCCESS: 'success',
  DISABLED: 'disabled',
} as const

export type FieldState =
  (typeof FIELD_STATE)[keyof typeof FIELD_STATE]

// ------------------------------------------------------------
// IMAGE
// ------------------------------------------------------------

export interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
}

// ------------------------------------------------------------
// EMPTY STATE
// ------------------------------------------------------------

export interface EmptyStateConfig {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}
