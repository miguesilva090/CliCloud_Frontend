import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { modules } from '@/config/modules'
import { HistoricoConsultasAdministrativoService } from '@/lib/services/consultas/historico-consultas-administrativo-service'
import type { HistoricoConsultaAdministrativoVista } from '@/lib/services/consultas/historico-consultas-administrativo-service/historico-consultas-administrativo-client'

const permId = modules.areaAdministrativa.permissions.consultas.id

type Filters = Array<{ id: string; value: string }>
type Sorting = Array<{ id: string; desc: boolean }> | null

export function useGetHistoricoConsultasAdministrativoPaginated(
  vista: HistoricoConsultaAdministrativoVista,
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
  enabled = true
) {
  const params: PaginatedRequest & { vista: HistoricoConsultaAdministrativoVista } = {
    vista,
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['historico-consultas-administrativo-paginated', params],
    queryFn: () => HistoricoConsultasAdministrativoService(permId).getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
  })
}

export function usePrefetchAdjacentHistoricoConsultasAdministrativo(
  vista: HistoricoConsultaAdministrativoVista,
  page: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const queryClient = useQueryClient()
  const baseParams = {
    vista,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return {
    prefetchPreviousPage: async () => {
      if (page > 1) {
        const params = { ...baseParams, pageNumber: page - 1 }
        await queryClient.prefetchQuery({
          queryKey: ['historico-consultas-administrativo-paginated', params],
          queryFn: () => HistoricoConsultasAdministrativoService(permId).getPaginated(params),
        })
      }
    },
    prefetchNextPage: async () => {
      const params = { ...baseParams, pageNumber: page + 1 }
      await queryClient.prefetchQuery({
        queryKey: ['historico-consultas-administrativo-paginated', params],
        queryFn: () => HistoricoConsultasAdministrativoService(permId).getPaginated(params),
      })
    },
  }
}
