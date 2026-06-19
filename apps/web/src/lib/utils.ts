import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { formatCurrency } from '@lego-shop/shared'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
