export const FICHEIRO_ELETRONICO_SIGLAS = {
  'sad-gnr': 'SAD/GNR',
  adm: 'ADM',
  'sad-psp': 'SAD/PSP',
} as const

export type FicheiroEletronicoSiglaSlug = keyof typeof FICHEIRO_ELETRONICO_SIGLAS
export type FicheiroEletronicoSigla =
  (typeof FICHEIRO_ELETRONICO_SIGLAS)[FicheiroEletronicoSiglaSlug]

export function resolveSiglaFromSlug(
  slug: string | undefined,
): FicheiroEletronicoSigla | null {
  if (!slug) return null
  return FICHEIRO_ELETRONICO_SIGLAS[slug as FicheiroEletronicoSiglaSlug] ?? null
}

export function siglaToSlug(sigla: FicheiroEletronicoSigla): FicheiroEletronicoSiglaSlug {
  const entry = Object.entries(FICHEIRO_ELETRONICO_SIGLAS).find(
    ([, value]) => value === sigla,
  )
  return (entry?.[0] ?? 'sad-gnr') as FicheiroEletronicoSiglaSlug
}

/** Abre TfaturaLst filtrada por SiglaFicheiro (legado addRegisto). */
export function buildFaturacaoSiglaFicheiroUrl(
  slug: FicheiroEletronicoSiglaSlug,
): string {
  return `/area-financeira/faturacao/faturacao?siglaFicheiro=${slug}&origem=ficheiro-eletronico`
}

export function buildNovoDocumentoFicheiroEletronicoUrl(
  slug: FicheiroEletronicoSiglaSlug,
): string {
  return `/area-financeira/faturacao/novo-documento?siglaFicheiro=${slug}&origem=ficheiro-eletronico`
}
