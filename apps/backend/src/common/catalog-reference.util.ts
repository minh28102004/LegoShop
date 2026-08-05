/**
 * Catalog selections are still stored in a few legacy JSON snapshots. Keep the
 * reference check exact (an ID must be a complete JSON string value) so a
 * delete guard never matches a description that merely contains the ID.
 */
export function jsonContainsCatalogId(value: unknown, id: string): boolean {
  if (value === id) return true;
  if (Array.isArray(value)) {
    return value.some((item) => jsonContainsCatalogId(item, id));
  }
  if (!value || typeof value !== 'object') return false;

  return Object.values(value).some((item) =>
    jsonContainsCatalogId(item, id),
  );
}

export function countJsonCatalogReferences(
  rows: unknown[],
  id: string,
): number {
  return rows.reduce<number>(
    (count, row) => count + Number(jsonContainsCatalogId(row, id)),
    0,
  );
}
