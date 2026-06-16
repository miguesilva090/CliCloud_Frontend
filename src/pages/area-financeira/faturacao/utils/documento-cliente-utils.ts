import { CodigosPostaisService } from '@/lib/services/base/codigospostais-service'
import { ResponseStatus } from '@/types/api/responses'
import type { CodigoPostalLightDTO } from '@/types/dtos/base/codigospostais.dtos'

/** NIFs de consumidor final (legado TfaturaEdt). */
export function isConsumidorFinalNif(nif: string | null | undefined): boolean {
  const n = (nif ?? '').replace(/\s/g, '')
  return n === '999999990' || n === '123456789'
}

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function looksLikeGuid(value?: string | null): boolean {
  if (!value?.trim()) return false
  return GUID_RE.test(value.trim())
}

/** Resolve código postal legível a partir do id (UtenteDTO só expõe codigoPostalId). */
export async function resolveCodigoPostalTexto(
  codigoPostalId: string | null | undefined,
  serviceId = 'documentos',
): Promise<string> {
  if (!codigoPostalId?.trim()) return ''
  if (!looksLikeGuid(codigoPostalId)) return codigoPostalId.trim()
  try {
    const res = await CodigosPostaisService(serviceId).getCodigoPostal(codigoPostalId)
    if (res.info?.status === ResponseStatus.Success) {
      return res.info.data?.codigo?.trim() ?? ''
    }
  } catch {
    // lookup opcional
  }
  return ''
}

/**
 * Legado modFldCodigoCodigoPostal autocomplete → id gravado em TFatura/Documento.
 */
export async function resolveCodigoPostalIdFromTexto(
  texto: string,
  serviceId = 'documentos',
): Promise<{ id: string | null; label: string }> {
  const q = texto.trim()
  if (!q) return { id: null, label: '' }
  if (looksLikeGuid(q)) {
    const label = await resolveCodigoPostalTexto(q, serviceId)
    return { id: q, label: label || q }
  }
  try {
    const res = await CodigosPostaisService(serviceId).getCodigosPostaisLight(q)
    const list = (res.info?.data ?? []) as CodigoPostalLightDTO[]
    const norm = q.replace(/\s/g, '')
    const exact = list.find(
      (c) => (c.codigo ?? '').replace(/\s/g, '') === norm,
    )
    const pick = exact ?? list[0]
    if (pick?.id) {
      return { id: pick.id, label: pick.codigo?.trim() ?? q }
    }
  } catch {
    // sem correspondência
  }
  return { id: null, label: q }
}
