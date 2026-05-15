import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import {
  linhaFromSubsistema,
  type LinhaServicoForm,
  type TaxaModeradora,
} from './admissao-form-utils'

function tableRowToSubsistemaDto(row: SubsistemaServicoTableDTO): SubsistemaServicoDTO {
  return {
    id: row.id,
    servicoId: row.servicoId,
    subsistemaId: row.subsistemaId,
    organismoId: row.organismoId,
    valorServico: row.valorServico,
    valorOrganismo: row.valorOrganismo,
    margemOrganismoPercent: 0,
    valorUtente: row.valorUtente,
    margemUtentePercent: 0,
    inativo: row.inativo,
  }
}

export function buildLinhasFromSubsistemasSelecionados(
  rows: SubsistemaServicoTableDTO[],
  numLinhas: number,
  servicosLight: ServicoLightDTO[],
  taxaModeradora: TaxaModeradora,
  taxaModeradoraAtiva: boolean
): LinhaServicoForm[] {
  const servicoMap = new Map(servicosLight.map((s) => [s.id, s]))
  const out: LinhaServicoForm[] = []
  const repeat = Math.max(1, numLinhas)

  for (const row of rows) {
    if (row.inativo) continue
    const servico = servicoMap.get(row.servicoId)
    const codigo = servico?.id.slice(0, 8) || row.servicoId.slice(0, 8)
    const designacao = servico?.designacao ?? row.servicoId
    const base = linhaFromSubsistema(
      tableRowToSubsistemaDto(row),
      codigo,
      designacao,
      taxaModeradora,
      taxaModeradoraAtiva
    )
    for (let i = 0; i < repeat; i++) {
      out.push({ ...base, id: crypto.randomUUID(), selected: false })
    }
  }
  return out
}
