import type { CondicaoPagamentoLightDTO } from '@/types/dtos/pagamentos/condicao-pagamento.dtos'
import type { ModoPagamentoLightDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
import type { DocumentoEditorState } from '../types/documento-editor.types'

export function modoPagamentoRequerBanco(
  modoPagamentoId: string | null | undefined,
  modos: ModoPagamentoLightDTO[],
): boolean {
  if (!modoPagamentoId) return false
  const modo = modos.find((m) => m.id === modoPagamentoId)
  return modo?.temContaBancaria ?? false
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const base = new Date(`${isoDate.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(base.getTime())) return isoDate.slice(0, 10)
  base.setDate(base.getDate() + days)
  return base.toISOString().slice(0, 10)
}

/** Legado: ao mudar condição, recalcula vencimento e desconto de pagamento. */
export function buildPatchCondicaoPagamento(
  condicaoPagamentoId: string | null,
  condicoes: CondicaoPagamentoLightDTO[],
  dataDocumento: string,
): Partial<DocumentoEditorState> {
  if (!condicaoPagamentoId) {
    return { condicaoPagamentoId: null }
  }

  const condicao = condicoes.find((c) => c.id === condicaoPagamentoId)
  const patch: Partial<DocumentoEditorState> = {
    condicaoPagamentoId,
  }

  if (condicao) {
    patch.dataVencimentoPagamento = addDaysToIsoDate(
      dataDocumento,
      condicao.nDiasPagamento ?? 0,
    )
    if (condicao.desconto != null) {
      patch.descontoPagamento = Number(condicao.desconto)
    }
  }

  return patch
}

export function buildPatchModoPagamento(
  modoPagamentoId: string | null,
  modos: ModoPagamentoLightDTO[],
): Partial<DocumentoEditorState> {
  const patch: Partial<DocumentoEditorState> = { modoPagamentoId }
  if (!modoPagamentoRequerBanco(modoPagamentoId, modos)) {
    patch.bancoId = null
  }
  return patch
}
