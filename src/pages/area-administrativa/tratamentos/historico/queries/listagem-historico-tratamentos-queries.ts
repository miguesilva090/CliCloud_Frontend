import { useQuery, useQueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { HistoricoTratamentoAdministrativoService } from '@/lib/services/tratamentos/historico-tratamento-administrativo-service/historico-tratamento-administrativo-client'
import type {
  HistoricoTratamentoModo,
  HistoricoTratamentoTableFilterRequest,
} from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import type { TableFilter } from '@/types/dtos/common/table-filters.dtos'

const perm = modules.areaAdministrativa.permissions.consultas.id

export const HISTORICO_TRATAMENTOS_QUERY_KEY = [
  'historico-tratamentos-paginated',
] as const

export type HistoricoCriteriaIds = {
  utenteId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
}

function buildBody(
  modo: HistoricoTratamentoModo,
  page: number,
  pageSize: number,
  filters: TableFilter[],
  sorting: Array<{ id: string; desc: boolean }> | null,
  ids: HistoricoCriteriaIds
): HistoricoTratamentoTableFilterRequest {
  return {
    pageNumber: page,
    pageSize,
    filters,
    sorting: sorting ?? undefined,
    modo,
    utenteId: ids.utenteId || null,
    fisioterapeutaId: ids.fisioterapeutaId || null,
    auxiliarId: ids.auxiliarId || null,
    outroTecnicoId: ids.outroTecnicoId || null,
    organismoId: ids.organismoId || null,
  }
}

export function useGetHistoricoTratamentosPaginated(
  modo: HistoricoTratamentoModo,
  page: number,
  pageSize: number,
  filters: TableFilter[],
  sorting: Array<{ id: string; desc: boolean }> | null,
  ids: HistoricoCriteriaIds,
  enabled: boolean
) {
  const body = buildBody(modo, page, pageSize, filters, sorting, ids)
  return useQuery({
    queryKey: [...HISTORICO_TRATAMENTOS_QUERY_KEY, body],
    enabled,
    queryFn: () =>
      HistoricoTratamentoAdministrativoService(perm).getPaginated(body),
    placeholderData: (prev) => prev,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

export function usePrefetchAdjacentHistoricoTratamentos(
  modo: HistoricoTratamentoModo,
  page: number,
  pageSize: number,
  filters: TableFilter[],
  ids: HistoricoCriteriaIds,
  enabled: boolean
) {
  const queryClient = useQueryClient()
  const base = buildBody(modo, page, pageSize, filters, null, ids)

  return {
    prefetchPreviousPage: async () => {
      if (!enabled || page <= 1) return
      const params = { ...base, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: [...HISTORICO_TRATAMENTOS_QUERY_KEY, params],
        queryFn: () =>
          HistoricoTratamentoAdministrativoService(perm).getPaginated(params),
      })
    },
    prefetchNextPage: async () => {
      if (!enabled) return
      const params = { ...base, pageNumber: page + 1 }
      await queryClient.prefetchQuery({
        queryKey: [...HISTORICO_TRATAMENTOS_QUERY_KEY, params],
        queryFn: () =>
          HistoricoTratamentoAdministrativoService(perm).getPaginated(params),
      })
    },
  }
}

export function invalidateHistoricoTratamentosQueries(
  qc: ReturnType<typeof useQueryClient>
) {
  void qc.invalidateQueries({ queryKey: HISTORICO_TRATAMENTOS_QUERY_KEY })
}
