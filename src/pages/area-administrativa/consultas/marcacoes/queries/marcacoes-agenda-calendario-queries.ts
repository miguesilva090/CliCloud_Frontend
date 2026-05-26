import { useQuery } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import type { MarcacaoCalendarioDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

export function useMarcacoesAgendaCalendario(
  criteria: MarcacoesListCriteria,
  enabled: boolean
) {
  return useQuery({
    queryKey: [
      'marcacoes-agenda-calendario',
      criteria.dataDe,
      criteria.dataAte,
      criteria.medicoId,
      criteria.salaId,
      criteria.especialidadeId,
    ],
    queryFn: async (): Promise<MarcacaoCalendarioDTO> => {
      const res = await MarcacoesAdministrativoService(listPermId).getCalendario({
        medicoId: criteria.medicoId!,
        salaId: criteria.salaId || undefined,
        especialidadeId: criteria.especialidadeId || undefined,
        dataDe: `${criteria.dataDe}T00:00:00`,
        dataAte: `${criteria.dataAte}T23:59:59`,
      })
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        return res.info.data
      }
      throw new Error(
        typeof res.info?.messages === 'string'
          ? res.info.messages
          : 'Não foi possível carregar o calendário.'
      )
    },
    enabled:
      enabled
      && !!criteria.dataDe
      && !!criteria.dataAte
      && !!criteria.medicoId,
    staleTime: 0,
  })
}
