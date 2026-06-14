// ============================================================
// PRODUCT SERVICE - Business logic cho products & collections
// Pure functions, nhan data lam tham so
// ============================================================

import { PAGINATION } from '@/constants'
import type {
  Collection,
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductStatus,
} from '@/types'
import { PRODUCT_STATUS } from '@/types'

// ------------------------------------------------------------
// FILTER & SEARCH
// ------------------------------------------------------------

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesSearch(value: string, query: string): boolean {
  return normalizeSearch(value).includes(normalizeSearch(query))
}

function getProductSearchText(product: Product): string {
  return [product.name, product.slug, product.description ?? ''].join(' ')
}

/**
 * Filter products theo cac tieu chi backend hien co.
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  return products.filter((product) => {
    if (filters.status !== undefined && product.status !== filters.status) {
      return false
    }

    if (filters.featured !== undefined && product.featured !== filters.featured) {
      return false
    }

    if (filters.minPrice !== undefined && product.basePrice < filters.minPrice) {
      return false
    }

    if (filters.maxPrice !== undefined && product.basePrice > filters.maxPrice) {
      return false
    }

    if (
      filters.search !== undefined &&
      !matchesSearch(getProductSearchText(product), filters.search)
    ) {
      return false
    }

    return true
  })
}

/**
 * Sort products theo tieu chi UI.
 */
export function sortProducts(
  products: Product[],
  sortBy: ProductFilters['sortBy'],
): Product[] {
  const sorted = [...products]

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.basePrice - b.basePrice)
    case 'price_desc':
      return sorted.sort((a, b) => b.basePrice - a.basePrice)
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    case 'popular':
      return sorted.sort((a, b) => {
        if (a.featured === b.featured) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }

        return a.featured ? -1 : 1
      })
    default:
      return sorted
  }
}

/**
 * Filter + sort trong mot buoc tien cho listing UI.
 */
export function getVisibleProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  return sortProducts(filterProducts(products, filters), filters.sortBy)
}

/**
 * Paginate array.
 */
export function paginateProducts(
  products: Product[],
  page: number = 1,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
): PaginatedResponse<Product> {
  const safePageSize = Math.max(1, Math.min(pageSize, PAGINATION.MAX_PAGE_SIZE))
  const totalCount = products.length
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (safePage - 1) * safePageSize
  const data = products.slice(startIndex, startIndex + safePageSize)

  return {
    data,
    success: true,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalCount,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  }
}

// ------------------------------------------------------------
// LOOKUP
// ------------------------------------------------------------

/**
 * Tim product theo ID. Tra ve null neu khong tim thay.
 */
export function getProductById(
  products: Product[],
  id: string,
): Product | null {
  return products.find((product) => product.id === id) ?? null
}

/**
 * Tim product theo slug. Tra ve null neu khong tim thay.
 */
export function getProductBySlug(
  products: Product[],
  slug: string,
): Product | null {
  return products.find((product) => product.slug === slug) ?? null
}

/**
 * Lay related products theo price proximity va featured flag.
 */
export function getRelatedProducts(
  products: Product[],
  currentProductId: string,
  limit: number = 4,
): Product[] {
  const currentProduct = getProductById(products, currentProductId)

  if (currentProduct === null) {
    return []
  }

  return products
    .filter(
      (product) =>
        product.id !== currentProductId &&
        product.status === PRODUCT_STATUS.ACTIVE,
    )
    .sort((a, b) => {
      const aDelta = Math.abs(a.basePrice - currentProduct.basePrice)
      const bDelta = Math.abs(b.basePrice - currentProduct.basePrice)

      if (aDelta === bDelta) {
        return Number(b.featured) - Number(a.featured)
      }

      return aDelta - bDelta
    })
    .slice(0, limit)
}

/**
 * Lay featured products.
 */
export function getFeaturedProducts(
  products: Product[],
  limit: number = 6,
): Product[] {
  return products
    .filter(
      (product) =>
        product.featured && product.status === PRODUCT_STATUS.ACTIVE,
    )
    .slice(0, limit)
}

/**
 * Lay active products theo backend ProductStatus.
 */
export function getActiveProducts(products: Product[]): Product[] {
  return products.filter((product) => product.status === PRODUCT_STATUS.ACTIVE)
}

/**
 * Lay products theo status.
 */
export function getProductsByStatus(
  products: Product[],
  status: ProductStatus,
): Product[] {
  return products.filter((product) => product.status === status)
}

/**
 * Lay new arrival products dua tren createdAt.
 */
export function getNewProducts(
  products: Product[],
  limit: number = 4,
): Product[] {
  return [...products]
    .filter((product) => product.status === PRODUCT_STATUS.ACTIVE)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit)
}

// ------------------------------------------------------------
// COLLECTION
// ------------------------------------------------------------

/**
 * Tim collection theo slug.
 */
export function getCollectionBySlug(
  collections: Collection[],
  slug: string,
): Collection | null {
  return collections.find((collection) => collection.slug === slug) ?? null
}

/**
 * Lay active collections theo backend ProductStatus.
 */
export function getActiveCollections(
  collections: Collection[],
): Collection[] {
  return collections.filter(
    (collection) => collection.status === PRODUCT_STATUS.ACTIVE,
  )
}

/**
 * Search collections theo name, slug, description.
 */
export function searchCollections(
  collections: Collection[],
  query: string,
): Collection[] {
  return collections.filter((collection) =>
    matchesSearch(
      [collection.name, collection.slug, collection.description ?? ''].join(' '),
      query,
    ),
  )
}

// ------------------------------------------------------------
// STATS
// ------------------------------------------------------------

export interface ProductStats {
  totalCount: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  activeCount: number
  inactiveCount: number
  featuredCount: number
}

/**
 * Tinh thong ke cho mot tap products theo schema backend hien tai.
 */
export function getProductStats(products: Product[]): ProductStats {
  if (products.length === 0) {
    return {
      totalCount: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      activeCount: 0,
      inactiveCount: 0,
      featuredCount: 0,
    }
  }

  const prices = products.map((product) => product.basePrice)
  const totalCount = products.length
  const totalPrice = prices.reduce((sum, price) => sum + price, 0)

  return {
    totalCount,
    avgPrice: Math.round(totalPrice / totalCount),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    activeCount: products.filter(
      (product) => product.status === PRODUCT_STATUS.ACTIVE,
    ).length,
    inactiveCount: products.filter(
      (product) => product.status === PRODUCT_STATUS.INACTIVE,
    ).length,
    featuredCount: products.filter((product) => product.featured).length,
  }
}
