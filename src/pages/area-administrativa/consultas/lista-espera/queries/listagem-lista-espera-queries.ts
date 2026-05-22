import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import type { ListaEsperaPaginatedRequest } from '@/types/dtos/consultas/lista-espera-administrativo.dtos'
import { filterGuid, filterValue } from '../../shared/listagem-api-filters'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

export const LISTA_ESPERA_PAGINATED_QUERY_KEY = ['lista-espera-administrativo-paginated'] as const

export function invalidateListaEsperaQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: LISTA_ESPERA_PAGINATED_QUERY_KEY })
}

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function resolveIncluirConvertidos(filters: Filters): boolean {
  return (
    filters?.some((f) => f.id === 'incluirConvertidos' && f.value === '1') ?? false
  )
}

export function useGetListaEsperaPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const dataDe = filterValue(filters, 'dataDe')
  const dataAte = filterValue(filters, 'dataAte')
  const params: ListaEsperaPaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    incluirConvertidos: resolveIncluirConvertidos(filters),
    utenteId: filterGuid(filters, 'utenteId'),
    medicoId: filterGuid(filters, 'medicoId'),
    medicoAgendaId: filterGuid(filters, 'medicoAgendaId'),
    especialidadeId: filterGuid(filters, 'especialidadeId'),
    prioridadeId: filterGuid(filters, 'prioridadeId'),
    dataDe: dataDe ? `${dataDe}T00:00:00` : undefined,
    dataAte: dataAte ? `${dataAte}T23:59:59` : undefined,
  }

  return useQuery({
    queryKey: [...LISTA_ESPERA_PAGINATED_QUERY_KEY, params],
    queryFn: () => ListaEsperaAdministrativoService(listPermId).getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function usePrefetchAdjacentListaEspera(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()
  const dataDe = filterValue(filters, 'dataDe')
  const dataAte = filterValue(filters, 'dataAte')
  const base = {
    pageSize,
    filters: filters ?? undefined,
    incluirConvertidos: resolveIncluirConvertidos(filters),
    utenteId: filterGuid(filters, 'utenteId'),
    medicoId: filterGuid(filters, 'medicoId'),
    medicoAgendaId: filterGuid(filters, 'medicoAgendaId'),
    especialidadeId: filterGuid(filters, 'especialidadeId'),
    prioridadeId: filterGuid(filters, 'prioridadeId'),
    dataDe: dataDe ? `${dataDe}T00:00:00` : undefined,
    dataAte: dataAte ? `${dataAte}T23:59:59` : undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params: ListaEsperaPaginatedRequest = { ...base, pageNumber: page - 1 }
    await queryClient.prefetchQuery({
      queryKey: [...LISTA_ESPERA_PAGINATED_QUERY_KEY, params],
      queryFn: () => ListaEsperaAdministrativoService(listPermId).getPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params: ListaEsperaPaginatedRequest = { ...base, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: [...LISTA_ESPERA_PAGINATED_QUERY_KEY, params],
      queryFn: () => ListaEsperaAdministrativoService(listPermId).getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
