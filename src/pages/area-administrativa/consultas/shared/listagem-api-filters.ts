export type PageFilter = { id: string; value: string }

export function filterValue(
  filters: PageFilter[] | null | undefined,
  id: string
): string | undefined {
  const v = filters?.find((f) => f.id === id)?.value?.trim()
  return v || undefined
}

export function filterGuid(
  filters: PageFilter[] | null | undefined,
  id: string
): string | undefined {
  const v = filterValue(filters, id)
  if (!v || v === '__none__') return undefined
  return v
}
