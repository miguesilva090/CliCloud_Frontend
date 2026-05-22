import { useQuery, useQueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import type { MarcacaoAdministrativoPaginatedRequest } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

export const MARCACOES_ADMIN_PAGINATED_QUERY_KEY = ['marcacoes-administrativo-paginated'] as const

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function buildParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
  criteria: MarcacoesListCriteria
): MarcacaoAdministrativoPaginatedRequest {
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    dataDe: criteria.dataDe ? `${criteria.dataDe}T00:00:00` : undefined,
    dataAte: criteria.dataAte ? `${criteria.dataAte}T23:59:59` : undefined,
    medicoId: criteria.medicoId || undefined,
    especialidadeId: criteria.especialidadeId || undefined,
    apenasAtivas: true,
  }
}

export function useGetMarcacoesAdministrativoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
  criteria: MarcacoesListCriteria,
  enabled = true
) {
  const params = buildParams(pageNumber, pageSize, filters, sorting, criteria)

  return useQuery({
    queryKey: [...MARCACOES_ADMIN_PAGINATED_QUERY_KEY, params],
    queryFn: () => MarcacoesAdministrativoService(listPermId).getPaginated(params),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function usePrefetchAdjacentMarcacoesAdministrativo(
  page: number,
  pageSize: number,
  filters: Filters,
  criteria: MarcacoesListCriteria
) {
  const queryClient = useQueryClient()
  const base = { pageSize, filters: filters ?? undefined, criteria }

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params = buildParams(page - 1, pageSize, filters, null, criteria)
    await queryClient.prefetchQuery({
      queryKey: [...MARCACOES_ADMIN_PAGINATED_QUERY_KEY, params],
      queryFn: () => MarcacoesAdministrativoService(listPermId).getPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params = buildParams(page + 1, pageSize, filters, null, criteria)
    await queryClient.prefetchQuery({
      queryKey: [...MARCACOES_ADMIN_PAGINATED_QUERY_KEY, params],
      queryFn: () => MarcacoesAdministrativoService(listPermId).getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export function invalidateMarcacoesAdministrativoQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.invalidateQueries({ queryKey: MARCACOES_ADMIN_PAGINATED_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: ['marcacoes-agenda-eventos'] })
  void queryClient.invalidateQueries({ queryKey: ['marcacoes-agenda-calendario'] })
}
