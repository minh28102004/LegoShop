export function calcDiscountPercent(
  originalPrice: number,
  salePrice: number,
): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) {
    return 0
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}
