import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { PaginatedRequest } from "@/types/api/responses"
import { modules } from '@/config/modules'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import { usePermissionsStore } from '@/stores/permissions-store'

export const loteDirectPermissionIds = [
  modules.areaComum.permissions.credenciaisLancamentoConsultas.id,
  modules.areaComum.permissions.historicoCredenciaisLancamento.id,
  modules.areaAdministrativa.permissions.consultas.id,
] as const

export function useLoteDirectFuncionalidadeId() {
  const hasPermission = usePermissionsStore((state) => state.hasPermission)

  return (
    loteDirectPermissionIds.find((id) => hasPermission(id, 'AuthVer')) ??
    loteDirectPermissionIds[0]
  )
}

type Sorting = Array<{id: string; desc: boolean}> | null
type Filters = Array<{id: string; value: string}> | null

export function useGetLoteDirectPaginated(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting
) {
    const listPermId = useLoteDirectFuncionalidadeId()
    const params: PaginatedRequest = {
        pageNumber,
        pageSize,
        filters: filters ?? undefined,
        sorting: sorting ?? undefined,
    }

    return useQuery({
        queryKey: ['lote-direct-paginated', params],
        queryFn: () => LoteDirectService(listPermId).getPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function usePrefetchAdjacentLoteDirect(
    page: number,
    pageSize: number,
    filters: Filters,
) {
    const listPermId = useLoteDirectFuncionalidadeId()
    const queryClient = useQueryClient()
    const baseParams = { pageSize, filters: filters ?? undefined }

    const prefetchPreviousPage = async () =>  {
        if (page <= 1) return
        const params: PaginatedRequest = { ...baseParams, pageNumber: page - 1}
        await queryClient.prefetchQuery({
            queryKey: ['lote-direct-paginated', params],
            queryFn: () => LoteDirectService(listPermId).getPaginated(params),
        })
    }

    const prefetchNextPage = async () => {
        const params: PaginatedRequest = { ...baseParams, pageNumber: page + 1}
        await queryClient.prefetchQuery({
            queryKey: ['lote-direct-paginated', params],
            queryFn: () => LoteDirectService(listPermId).getPaginated(params),
        })
    }

    return { prefetchPreviousPage, prefetchNextPage}
}

