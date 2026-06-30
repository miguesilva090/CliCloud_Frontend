import type { ComboboxItem } from '@/components/shared/async-combobox'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'

export function buildServicoConsultaComboboxItems(
  subsistemasOrganismo: SubsistemaServicoDTO[],
  servicosConsulta: ServicoLightDTO[],
  tipoServicoRegistoId?: string
): ComboboxItem[] {
  return subsistemasOrganismo
    .filter((s) => !s.inativo)
    .filter((s) => {
      if (!tipoServicoRegistoId) return true
      const serv = servicosConsulta.find((x) => x.id === s.servicoId)
      return serv?.tipoServicoId === tipoServicoRegistoId
    })
    .map((s) => {
      const serv = servicosConsulta.find((x) => x.id === s.servicoId)
      const label =
        serv?.designacao?.trim() || `Serviço (${s.servicoId.slice(0, 8)}…)`
      return {
        value: s.servicoId,
        label,
        secondary: `V.serv. ${s.valorServico} € · utente ${s.valorUtente} € · org. ${s.valorOrganismo} €`,
      }
    })
}
