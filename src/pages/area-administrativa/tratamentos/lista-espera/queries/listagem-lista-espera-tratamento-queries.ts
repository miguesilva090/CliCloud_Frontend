import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { ListaEsperaTratamentoAdministrativoService } from '@/lib/services/tratamentos/lista-espera-tratamento-administrativo-service'
import type { ListaEsperaTratamentoPaginatedRequest } from '@/types/dtos/tratamentos/lista-espera-tratamento-administrativo.dtos'
import { filterGuid, filterValue } from '../../../consultas/shared/listagem-api-filters'

const listPermId = modules.areaAdministrativa.permissions.listaEsperaTratamentos.id

export const LISTA_ESPERA_TRATAMENTO_PAGINATED_QUERY_KEY = [
  'lista-espera-tratamento-administrativo-paginated',
] as const

export function invalidateListaEsperaTratamentoQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    queryKey: LISTA_ESPERA_TRATAMENTO_PAGINATED_QUERY_KEY,
  })
}

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function resolveHistorico(filters: Filters): boolean {
  return filters?.some((f) => f.id === 'historico' && f.value === '1') ?? false
}

export function useGetListaEsperaTratamentoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: ListaEsperaTratamentoPaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    historico: resolveHistorico(filters),
    utenteId: filterGuid(filters, 'utenteId'),
    medicoId: filterGuid(filters, 'medicoId'),
    prioridadeId: filterGuid(filters, 'prioridadeId'),
    localTratamentoId: filterGuid(filters, 'localTratamentoId'),
    estadoListaEsperaId: filterGuid(filters, 'estadoListaEsperaId'),
  }

  return useQuery({
    queryKey: [...LISTA_ESPERA_TRATAMENTO_PAGINATED_QUERY_KEY, params],
    queryFn: () =>
      ListaEsperaTratamentoAdministrativoService(listPermId).getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function usePrefetchAdjacentListaEsperaTratamento(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()
  const base = {
    pageSize,
    filters: filters ?? undefined,
    historico: resolveHistorico(filters),
    utenteId: filterGuid(filters, 'utenteId'),
    medicoId: filterGuid(filters, 'medicoId'),
    prioridadeId: filterGuid(filters, 'prioridadeId'),
    localTratamentoId: filterGuid(filters, 'localTratamentoId'),
    estadoListaEsperaId: filterGuid(filters, 'estadoListaEsperaId'),
  }

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params: ListaEsperaTratamentoPaginatedRequest = { ...base, pageNumber: page - 1 }
    await queryClient.prefetchQuery({
      queryKey: [...LISTA_ESPERA_TRATAMENTO_PAGINATED_QUERY_KEY, params],
      queryFn: () =>
        ListaEsperaTratamentoAdministrativoService(listPermId).getPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params: ListaEsperaTratamentoPaginatedRequest = { ...base, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: [...LISTA_ESPERA_TRATAMENTO_PAGINATED_QUERY_KEY, params],
      queryFn: () =>
        ListaEsperaTratamentoAdministrativoService(listPermId).getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
