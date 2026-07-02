import { getApiBaseUrl } from './base-url'

export function resolveApiAssetUrl(url?: string | null): string {
  const trimmedUrl = url?.trim()

  if (!trimmedUrl) {
    return ''
  }

  if (
    /^(https?:)?\/\//i.test(trimmedUrl) ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('blob:')
  ) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith('/')) {
    return `${getApiBaseUrl()}${trimmedUrl}`
  }

  return trimmedUrl
}
