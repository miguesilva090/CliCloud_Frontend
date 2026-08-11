import type { ConsultarUtenteRnuResponse } from '@/types/dtos/saude/utente-rnu.dtos'

/** Prefill alinhado a listagem-utentes + enum CondicaoSns (0/1/2). */
export type RnuPrefillPayload = {
  nome: string
  numeroUtente: string
  dataNascimento: string
  sexoCodigo: string
  paisNacionalidade: string
  condicaoSns: number | null
  entidadeResponsavelCodigo: string
  entidadeResponsavelDescricao: string
}

export function mapCondicaoSnsFromRnu(
  entidadeDescricao?: string | null
): number | null {
  const d = (entidadeDescricao ?? '').toLowerCase()
  if (!d) return null
  if (d.includes('sns')) return 1 // Condição SNS
  if (d.includes('terceiro')) return 2 // Terceiro pagador
  return null
}

export function buildRnuPrefillPayload(
  data: ConsultarUtenteRnuResponse
): RnuPrefillPayload {
  const entidadeResponsavelDescricao =
    data.entidadesResponsaveis?.[0]?.descricao ?? ''
  return {
    nome: data.nomeCompleto ?? data.nomesProprios ?? '',
    numeroUtente: data.numeroSns ?? '',
    dataNascimento: data.dataNascimento
      ? String(data.dataNascimento).slice(0, 10)
      : '',
    sexoCodigo: data.sexo ?? '',
    paisNacionalidade: data.paisNacionalidade ?? '',
    condicaoSns: mapCondicaoSnsFromRnu(entidadeResponsavelDescricao),
    entidadeResponsavelCodigo:
      data.entidadesResponsaveis?.[0]?.codigo ?? '',
    entidadeResponsavelDescricao,
  }
}

export const RNU_PREFILL_STORAGE_KEY = 'rnu-prefill-utente-create'
