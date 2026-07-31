import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { TratamentoMarcadosAdministrativoService } from '@/lib/services/tratamentos/tratamento-marcados-administrativo-service/tratamento-marcados-administrativo-client'
import {
  ModoListagemTratamentoMarcados,
  type TratamentoMarcadosTableFilterRequest,
} from '@/types/dtos/tratamentos/tratamento-marcados-administrativo.dtos'
import type { TanstackSorting } from '@/types/dtos/common/table-filters.dtos'
import {
  filterGuid,
} from '../../../consultas/shared/listagem-api-filters'

const permId = modules.areaAdministrativa.permissions.consultas.id
export const TRATAMENTOS_MARCADOS_QUERY_KEY = [
  'tratamentos-marcados-paginated',
] as const

function buildParams(
  modo: ModoListagemTratamentoMarcados,
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: TanstackSorting | null
): TratamentoMarcadosTableFilterRequest {
  const list = (filters ?? []).filter((f) => f.value)

  return {
    pageNumber: page,
    pageSize,
    modo,
    localTratamentoId: filterGuid(list, 'localTratamentoId'),
    utenteId: filterGuid(list, 'utenteId'),
    filters: list,
    sorting: sorting ?? undefined,
  }
}

export function useGetTratamentosMarcadosPaginated(
  modo: ModoListagemTratamentoMarcados,
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: TanstackSorting | null
) {
  const params = buildParams(modo, page, pageSize, filters, sorting)
  const needsLocal =
    modo === ModoListagemTratamentoMarcados.PorLocal && !params.localTratamentoId
  const needsUtente =
    modo === ModoListagemTratamentoMarcados.PorUtente && !params.utenteId

  return useQuery({
    queryKey: [...TRATAMENTOS_MARCADOS_QUERY_KEY, params],
    queryFn: () =>
      TratamentoMarcadosAdministrativoService(permId).getPaginated(params),
    enabled: !needsLocal && !needsUtente,
    placeholderData: (prev) => prev,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function usePrefetchAdjacentTratamentosMarcados(
  modo: ModoListagemTratamentoMarcados,
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) {
  const queryClient = useQueryClient()
  const base = buildParams(modo, page, pageSize, filters, null)

  return {
    prefetchPreviousPage: async () => {
      if (page <= 1) return
      const params = { ...base, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: [...TRATAMENTOS_MARCADOS_QUERY_KEY, params],
        queryFn: () =>
          TratamentoMarcadosAdministrativoService(permId).getPaginated(params),
      })
    },
    prefetchNextPage: async () => {
      const params = { ...base, pageNumber: page + 1 }
      await queryClient.prefetchQuery({
        queryKey: [...TRATAMENTOS_MARCADOS_QUERY_KEY, params],
        queryFn: () =>
          TratamentoMarcadosAdministrativoService(permId).getPaginated(params),
      })
    },
  }
}

export function invalidateTratamentosMarcadosQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: TRATAMENTOS_MARCADOS_QUERY_KEY,
  })
}
