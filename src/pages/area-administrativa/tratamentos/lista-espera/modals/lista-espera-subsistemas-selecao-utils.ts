import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import {
  newListaEsperaServicoForm,
  type ListaEsperaTratamentoServicoForm,
} from './lista-espera-tratamento-form-utils'

export function buildServicosFromSubsistemasSelecionados(
  rows: SubsistemaServicoTableDTO[],
  startOrdem: number,
  servicosLight: ServicoLightDTO[]
): ListaEsperaTratamentoServicoForm[] {
  const servicoMap = new Map(servicosLight.map((s) => [s.id, s]))
  let ordem = Math.max(1, startOrdem)
  const out: ListaEsperaTratamentoServicoForm[] = []

  for (const row of rows) {
    if (row.inativo) continue
    const servico = servicoMap.get(row.servicoId)
    const linha = newListaEsperaServicoForm(ordem++)
    linha.subsistemaServicoId = row.id
    linha.servicoId = row.servicoId
    linha.codigoServico = servico?.id.slice(0, 8) || row.servicoId.slice(0, 8)
    linha.designacao = servico?.designacao ?? ''
    linha.subsistemaDesignacao = row.subsistemaId ?? ''
    out.push(linha)
  }

  return out
}
