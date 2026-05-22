import { useQuery, useQueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import type { OrdemEntradaPaginatedRequest } from '@/types/dtos/consultas/ordem-entrada.dtos'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'
import { filterGuid, filterValue } from '../../shared/listagem-api-filters'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

export const ORDEM_ENTRADA_PAGINATED_QUERY_KEY = ['ordem-entrada-paginated'] as const

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function resolveIncluirHistorico(filters: Filters): boolean {
  return filters?.some((f) => f.id === 'incluirHistorico' && f.value === '1') ?? false
}

export function useGetOrdemEntradaPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const dataRef = getDataTrabalhoIsoDate()
  const dataDe = filterValue(filters, 'dataDe') ?? dataRef
  const dataAte = filterValue(filters, 'dataAte') ?? dataRef
  const params: OrdemEntradaPaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    dataDe: `${dataDe}T00:00:00`,
    dataAte: `${dataAte}T23:59:59`,
    incluirHistorico: resolveIncluirHistorico(filters),
    utenteId: filterGuid(filters, 'utenteId'),
    medicoId: filterGuid(filters, 'medicoId'),
    especialidadeId: filterGuid(filters, 'especialidadeId'),
  }

  return useQuery({
    queryKey: [...ORDEM_ENTRADA_PAGINATED_QUERY_KEY, params],
    queryFn: () => AdmissaoAdministrativoService(listPermId).getOrdemEntradaPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function usePrefetchAdjacentOrdemEntrada(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()
  const dataRef = getDataTrabalhoIsoDate()
  const dataDe = filterValue(filters, 'dataDe') ?? dataRef
  const dataAte = filterValue(filters, 'dataAte') ?? dataRef
  const base = {
    pageSize,
    filters: filters ?? undefined,
    dataDe: `${dataDe}T00:00:00`,
    dataAte: `${dataAte}T23:59:59`,
    incluirHistorico: resolveIncluirHistorico(filters),
    utenteId: filterGuid(filters, 'utenteId'),
    medicoId: filterGuid(filters, 'medicoId'),
    especialidadeId: filterGuid(filters, 'especialidadeId'),
  }

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params: OrdemEntradaPaginatedRequest = { ...base, pageNumber: page - 1 }
    await queryClient.prefetchQuery({
      queryKey: [...ORDEM_ENTRADA_PAGINATED_QUERY_KEY, params],
      queryFn: () => AdmissaoAdministrativoService(listPermId).getOrdemEntradaPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params: OrdemEntradaPaginatedRequest = { ...base, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: [...ORDEM_ENTRADA_PAGINATED_QUERY_KEY, params],
      queryFn: () => AdmissaoAdministrativoService(listPermId).getOrdemEntradaPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
