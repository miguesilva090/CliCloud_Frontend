import { useQuery } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import { PlanningTratamentoAdministrativoService } from '@/lib/services/tratamentos/planning-tratamento-administrativo-service/planning-tratamento-administrativo-client'
import type { PlanningSessoesRequest } from '@/types/dtos/tratamentos/planning-tratamento.dtos'
import { modules } from '@/config/modules'

const perm = modules.areaAdministrativa.permissions.consultas.id

export function usePlanningSessoes(
  request: PlanningSessoesRequest | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['planning-sessoes', request],
    enabled: enabled && !!request?.tecnicoId,
    queryFn: async () => {
      if (!request) return []
      const res = await PlanningTratamentoAdministrativoService(perm).getSessoes(
        request
      )
      if (res.info?.status !== ResponseStatus.Success) {
        const apiMsg = Object.values(res.info?.messages ?? {})
          .flat()
          .find((x) => typeof x === 'string' && x.trim())
        throw new Error(apiMsg ?? 'Falha ao carregar planning')
      }

      return res.info?.data?.eventos ?? []
    },
    staleTime: 30_000,
  })
}
