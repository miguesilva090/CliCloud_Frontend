import { useQuery } from '@tanstack/react-query'
import { EvolucaoTratamentoService } from '@/lib/services/tratamentos/evolucao-tratamento-service'
import type {
  EvolucaoTratamentoDTO,
  EvolucaoTratamentoTableFilterRequest,
} from '@/types/dtos/tratamentos/evolucao-tratamento.dtos'

type Filters = EvolucaoTratamentoTableFilterRequest['filters']

export function useGetEvolucaoTratamentoById(evolucaoId: string) {
  return useQuery({
    queryKey: ['evolucao-tratamento', 'by-id', evolucaoId],
    queryFn: async () => {
      const res = await EvolucaoTratamentoService().getById(evolucaoId)
      const dto = (res.info?.data ?? null) as EvolucaoTratamentoDTO | null
      return dto && typeof dto === 'object' && 'id' in dto ? dto : null
    },
    enabled: !!evolucaoId && evolucaoId.length > 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

export function useGetEvolucaoTratamentoPaginated(
  utenteId: string,
  pageNumber: number,
  pageSize: number
) {
  const filters: Filters =
    utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []

  const params = {
    pageNumber,
    pageSize,
    filters,
  }

  return useQuery({
    queryKey: ['evolucao-tratamento', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => EvolucaoTratamentoService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export {
  useCreateEvolucaoTratamento,
  useUpdateEvolucaoTratamento,
  useDeleteEvolucaoTratamento,
} from './evolucao-tratamento-mutations'
