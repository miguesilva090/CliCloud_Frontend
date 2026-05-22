import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { modules } from '@/config/modules'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ModoListagemAdmissao, type AdmissaoPaginatedRequest } from '@/types/dtos/consultas/admissao.dtos'
import { useWindowsStore } from '@/stores/use-windows-store'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'

const listPermId = modules.areaAdministrativa.permissions.admissoes.id

/** Hub operacional (adm. do dia) — cache curto para refletir criações noutras tabs. */
export const ADMISSOES_PAGINATED_QUERY_KEY = ['admissoes-paginated'] as const

export function invalidateAdmissoesListQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ADMISSOES_PAGINATED_QUERY_KEY })
}

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
    dataReferencia: getDataTrabalhoIsoDate(),
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: [...ADMISSOES_PAGINATED_QUERY_KEY, params],
    queryFn: () => AdmissaoAdministrativoService(listPermId).getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

/** Ao voltar à tab «Admissões» / «Pendentes», força refresh (criações noutra janela). */
export function useRefetchAdmissoesOnListTabActive(): void {
  const queryClient = useQueryClient()
  const location = useLocation()
  const activeWindowId = useWindowsStore((s) => s.activeWindow)

  useEffect(() => {
    const path = location.pathname
    if (!path.includes('/consultas/admissoes')) return
    if (path.includes('/admissoes/novo')) return
    invalidateAdmissoesListQueries(queryClient)
  }, [activeWindowId, location.pathname, queryClient])
}

export function usePrefetchAdjacentAdmissoes(
  modo: ModoListagemAdmissao,
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()
  const baseParams = {
    modo,
    pageSize,
    filters: filters ?? undefined,
    dataReferencia: getDataTrabalhoIsoDate(),
  }

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params: AdmissaoPaginatedRequest = { ...baseParams, pageNumber: page - 1 }
    await queryClient.prefetchQuery({
      queryKey: [...ADMISSOES_PAGINATED_QUERY_KEY, params],
      queryFn: () => AdmissaoAdministrativoService(listPermId).getPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params: AdmissaoPaginatedRequest = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: [...ADMISSOES_PAGINATED_QUERY_KEY, params],
      queryFn: () => AdmissaoAdministrativoService(listPermId).getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
