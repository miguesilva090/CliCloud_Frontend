import { useQuery } from '@tanstack/react-query'
import { ServicoTratamentoService } from '@/lib/services/tratamentos/servico-tratamento-service'

import type { AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import type {
  CreateServicoTratamentoRequest,
  ServicoTratamentoTableDTO,
} from '@/types/dtos/tratamentos/servico-tratamento.dtos'

export function useServicoTratamentoByTratamento(tratamentoId?: string | null) {
  return useQuery({
    queryKey: ['servicos-tratamento', tratamentoId],
    queryFn: async () => {
      if (!tratamentoId) return [] as ServicoTratamentoTableDTO[]

      const body: AllFilterRequest = {
        filters: [{ id: 'tratamentoId', value: tratamentoId }],
        sorting: [{ id: 'ordem', desc: false }],
      }

      const res = await ServicoTratamentoService().getAll(body)
      return (res.info?.data ?? []) as ServicoTratamentoTableDTO[]
    },
    enabled: !!tratamentoId,
    staleTime: 2 * 60 * 1000,
  })
}

export { useServicoTratamentoMutations } from './tratamento-servicos-mutations'
