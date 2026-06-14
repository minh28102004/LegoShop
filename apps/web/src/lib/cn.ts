// ============================================================
// cn() - Class name utility
// Merge Tailwind classes an toan, khong bi conflict
// ============================================================

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names voi Tailwind conflict resolution.
 *
 * @example
 * cn('px-4 py-2', 'px-8')
 * cn('text-red-500', isError && 'text-red-700')
 * cn({ 'font-bold': isBold })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
