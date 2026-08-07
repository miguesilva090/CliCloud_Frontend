import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { AdmissaoTratamentoAdministrativoService } from '@/lib/services/tratamentos/admissao-tratamento-administrativo-service/admissao-tratamento-administrativo-client'
import {
  ModoListagemAdmissaoTratamento,
  type AdmissaoTratamentoTableFilterRequest,
} from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'
import type { TanstackSorting } from '@/types/dtos/common/table-filters.dtos'
import {
  filterGuid,
  filterValue,
} from '../../../consultas/shared/listagem-api-filters'

const permId = modules.areaAdministrativa.permissions.admissoes.id
export const ADMISSOES_TRATAMENTO_QUERY_KEY = [
  'admissoes-tratamento-paginated',
] as const

function buildParams(
  modo: ModoListagemAdmissaoTratamento,
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: TanstackSorting | null
): AdmissaoTratamentoTableFilterRequest {
  const list = (filters ?? []).filter((f) => f.value)
  const data =
    filterValue(list, 'data') ??
    filterValue(list, 'dataReferencia') ??
    new Date().toISOString().slice(0, 10)

  const incluirRaw = filterValue(list, 'incluirDesmarcados')
  const incluirDesmarcados =
    incluirRaw === '1' || incluirRaw === 'true'

  return {
    pageNumber: page,
    pageSize,
    modo,
    dataReferencia: data,
    localTratamentoId: filterGuid(list, 'localTratamentoId'),
    fisioterapeutaId: filterGuid(list, 'fisioterapeutaId'),
    utenteId: filterGuid(list, 'utenteId'),
    incluirDesmarcados,
    filters: list,
    sorting: sorting ?? undefined,
  }
}

export function useGetAdmissoesTratamentoPaginated(
  modo: ModoListagemAdmissaoTratamento,
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: TanstackSorting | null
) {
  const params = buildParams(modo, page, pageSize, filters, sorting)
  return useQuery({
    queryKey: [...ADMISSOES_TRATAMENTO_QUERY_KEY, params],
    queryFn: () =>
      AdmissaoTratamentoAdministrativoService(permId).getPaginated(params),
    placeholderData: (prev) => prev,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function usePrefetchAdjacentAdmissoesTratamento(
  modo: ModoListagemAdmissaoTratamento,
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
        queryKey: [...ADMISSOES_TRATAMENTO_QUERY_KEY, params],
        queryFn: () =>
          AdmissaoTratamentoAdministrativoService(permId).getPaginated(params),
      })
    },
    prefetchNextPage: async () => {
      const params = { ...base, pageNumber: page + 1 }
      await queryClient.prefetchQuery({
        queryKey: [...ADMISSOES_TRATAMENTO_QUERY_KEY, params],
        queryFn: () =>
          AdmissaoTratamentoAdministrativoService(permId).getPaginated(params),
      })
    },
  }
}

export function invalidateAdmissoesTratamentoQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: ADMISSOES_TRATAMENTO_QUERY_KEY,
  })
}