import { getApiBaseUrl } from './base-url'

const API_ASSET_PATH_PREFIXES = ['/uploads/', '/shared/images/']
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1'])
const PLACEHOLDER_HOSTS = new Set(['example.com', 'www.example.com'])

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
    if (isPlaceholderAssetUrl(trimmedUrl)) {
      return ''
    }

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

function isPlaceholderAssetUrl(url: string) {
  try {
    return PLACEHOLDER_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
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
