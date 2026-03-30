export type ComboboxItem = { value: string; label: string }

export function buildCodigoPostalComboboxItems(
  codigosPostais: Array<{ codigo: string; localidade: string }>,
  currentCcPostal: string | undefined | null,
): ComboboxItem[] {
  const base = codigosPostais.map((cp) => ({
    value: cp.codigo,
    label: `${cp.codigo} — ${cp.localidade}`,
  }))

  const ccPostalWatch = (currentCcPostal ?? '').trim()
  if (ccPostalWatch && !base.some((i) => i.value === ccPostalWatch)) {
    return [{ value: ccPostalWatch, label: `${ccPostalWatch} (valor atual)` }, ...base]
  }

  return base
}

export function filterComboboxItems(
  items: ComboboxItem[],
  query: string,
): ComboboxItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((i) => i.label.toLowerCase().includes(q))
}

export function buildMoedasForSelect<T extends { id: string; descricao?: string | null }>(
  moedas: T[],
  currentId: string | undefined | null,
): Array<T | { id: string; descricao: string }> {
  const cmoedaWatch = (currentId ?? '').trim()
  if (cmoedaWatch && !moedas.some((m) => m.id === cmoedaWatch)) {
    return [{ id: cmoedaWatch, descricao: `${cmoedaWatch} (valor atual)` }, ...moedas]
  }
  return moedas
}

export function buildMotivosIsencaoForSelect<
  T extends { id: string; codigo: string; descricao?: string | null },
>(
  motivosIsencao: T[],
  currentCodigo: string | undefined | null,
): Array<T | { id: '__legacy'; codigo: string; descricao: '' }> {
  const motivoIsencaoWatch = (currentCodigo ?? '').trim()
  if (motivoIsencaoWatch && !motivosIsencao.some((m) => m.codigo === motivoIsencaoWatch)) {
    return [{ id: '__legacy', codigo: motivoIsencaoWatch, descricao: '' }, ...motivosIsencao]
  }
  return motivosIsencao
}

