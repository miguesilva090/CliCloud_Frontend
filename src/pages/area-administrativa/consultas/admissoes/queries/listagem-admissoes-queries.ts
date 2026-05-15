import { useQuery, useQueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import {
  ModoListagemAdmissao,
  type AdmissaoPaginatedRequest,
} from '@/types/dtos/consultas/admissao.dtos'

const listPermId = modules.areaAdministrativa.permissions.admissoes.id

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetAdmissoesPaginated(
  modo: ModoListagemAdmissao,
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: AdmissaoPaginatedRequest = {
    modo,
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['admissoes-paginated', params],
    queryFn: () => AdmissaoAdministrativoService(listPermId).getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentAdmissoes(
  modo: ModoListagemAdmissao,
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()
  const baseParams = { modo, pageSize, filters: filters ?? undefined }

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params: AdmissaoPaginatedRequest = { ...baseParams, pageNumber: page - 1 }
    await queryClient.prefetchQuery({
      queryKey: ['admissoes-paginated', params],
      queryFn: () => AdmissaoAdministrativoService(listPermId).getPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params: AdmissaoPaginatedRequest = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: ['admissoes-paginated', params],
      queryFn: () => AdmissaoAdministrativoService(listPermId).getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
