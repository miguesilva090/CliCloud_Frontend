import { useQuery, useQueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { ReceitaMedicaService } from '@/lib/services/prescricao/receita-medica-service'
import type { ReceitaMedicaTableFilterRequest } from '@/types/dtos/prescricao/receita-medica.dtos'

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

export function useGetReceitasPaginated(
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null,
  enabled = true
) {
  const params: ReceitaMedicaTableFilterRequest = {
    pageNumber,
    pageSize: pageLimit,
    sorting: sorting ?? undefined,
    filters: (filters ?? []).filter((f) => f.value),
  }

  return useQuery({
    queryKey: ['receitas-medicas-paginated', params],
    queryFn: () => ReceitaMedicaService(permissionId).getPaginated(params),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function usePrefetchAdjacentReceitas(
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) {
  const queryClient = useQueryClient()
  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: ReceitaMedicaTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['receitas-medicas-paginated', params],
        queryFn: () => ReceitaMedicaService(permissionId).getPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: ReceitaMedicaTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['receitas-medicas-paginated', params],
      queryFn: () => ReceitaMedicaService(permissionId).getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
