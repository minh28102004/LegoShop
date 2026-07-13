import { getApiBaseUrl } from './base-url'

const API_ASSET_PATH_PREFIXES = ['/uploads/', '/shared/images/']
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1'])

export function resolveApiAssetUrl(url?: string | null): string {
  const trimmedUrl = url?.trim()

  if (!trimmedUrl) {
    return ''
  }

  if (trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:')) {
    return trimmedUrl
  }

  const apiBaseUrl = getApiBaseUrl()

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return normalizeLoopbackApiAssetUrl(trimmedUrl, apiBaseUrl)
  }

  if (/^\/\//.test(trimmedUrl)) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith('/')) {
    return `${apiBaseUrl}${trimmedUrl}`
  }

  return trimmedUrl
}

function normalizeLoopbackApiAssetUrl(url: string, apiBaseUrl: string) {
  try {
    const parsedUrl = new URL(url)

    if (!LOOPBACK_HOSTS.has(parsedUrl.hostname) || !isApiAssetPath(parsedUrl.pathname)) {
      return url
    }

    return `${apiBaseUrl}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
  } catch {
    return url
  }
}

function isApiAssetPath(pathname: string) {
  return API_ASSET_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
