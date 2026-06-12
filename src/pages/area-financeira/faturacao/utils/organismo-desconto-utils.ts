import type { FicheiroEletronicoSiglaSlug } from '@/pages/area-financeira/ficheiros-eletronicos/constants/ficheiro-eletronico-siglas'
import type { DocumentoEditorState } from '../types/documento-editor.types'
export const ORGANISMO_DESCONTO_BLOQUEADO_MSG = 
    "Este organismo não pode ter descontos. O valor deve ser o que está na tabela de subsistemas de serviços"

export function organismoRestringeDescontos(flags?: {
    adm?: boolean | null
    sadgnr?: boolean | null
    sadpsp?: boolean | null
}): boolean {
    return !!(flags?.adm || flags?.sadgnr || flags?.sadpsp)
}

export function documentoFaturadoAOrganismo(state: {
    tipoCliente: DocumentoEditorState['tipoCliente']
    organismoId: string | null 
    utenteId: string | null
}): boolean {
    return (
        state.tipoCliente === 'organismo' &&
        !!state.organismoId &&
        !state.utenteId
    )
}

export function descontosBloqueadosNoEditor(state: DocumentoEditorState): boolean {
    return documentoFaturadoAOrganismo(state) && state.organismoRestringeDescontos
}

/** Contexto FE (SAD/GNR, ADM, SAD/PSP) — todos restringem descontos em fatura a organismo. */
export function organismoRestringeDescontosPorSiglaFicheiro(
  slug?: FicheiroEletronicoSiglaSlug | null,
): boolean {
  return slug === 'adm' || slug === 'sad-gnr' || slug === 'sad-psp'
}

export function mergePatchComRestricaoDescontos(
  state: DocumentoEditorState,
  patch: Partial<DocumentoEditorState>,
): Partial<DocumentoEditorState> {
  const merged = { ...state, ...patch }
  if (!descontosBloqueadosNoEditor(merged)) return patch
  return { ...patch, ...limparDescontosEditor(merged) }
}

export function limparDescontosEditor(
  state: DocumentoEditorState,
): Partial<DocumentoEditorState> {
  return {
    descontoCliente: 0,
    descontoPagamento: 0,
    percentagemDescontoGlobal: 0,
    linhas: state.linhas.map((l) => ({
      ...l,
      percentagemDesconto: 0,
      valorDesconto: null,
      descontoTipo1: null,
      descontoTipo2: null,
      descontoTipo3: null,
    })),
  }
}
