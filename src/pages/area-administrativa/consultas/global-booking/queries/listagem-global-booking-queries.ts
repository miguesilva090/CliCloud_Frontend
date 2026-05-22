import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { PedidosConsultaAdministrativoService } from '@/lib/services/consultas/pedidos-consulta-administrativo-service'
import type { PedidoConsultaPaginatedRequest } from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'
import { filterValue } from '../../shared/listagem-api-filters'

const listPermId = modules.areaAdministrativa.permissions.globalBooking.id

export const GLOBAL_BOOKING_PAGINATED_QUERY_KEY = [
  'pedidos-consulta-administrativo-paginated',
] as const

export function invalidateGlobalBookingQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: GLOBAL_BOOKING_PAGINATED_QUERY_KEY })
}

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function flag(filters: Filters, id: string): boolean | undefined {
  const v = filterValue(filters, id)
  if (v === '1') return true
  if (v === '0') return false
  return undefined
}

function buildGlobalBookingParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
): PedidoConsultaPaginatedRequest {
  const dataDe = filterValue(filters, 'dataDe')
  const dataAte = filterValue(filters, 'dataAte')
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    agendadoSim: flag(filters, 'agendadoSim'),
    agendadoNao: flag(filters, 'agendadoNao'),
    recusadoSim: flag(filters, 'recusadoSim'),
    recusadoNao: flag(filters, 'recusadoNao'),
    emailPedidoSim: flag(filters, 'emailPedidoSim'),
    emailPedidoNao: flag(filters, 'emailPedidoNao'),
    smsPedidoSim: flag(filters, 'smsPedidoSim'),
    smsPedidoNao: flag(filters, 'smsPedidoNao'),
    emailAgendadoSim: flag(filters, 'emailAgendadoSim'),
    emailAgendadoNao: flag(filters, 'emailAgendadoNao'),
    smsAgendadoSim: flag(filters, 'smsAgendadoSim'),
    smsAgendadoNao: flag(filters, 'smsAgendadoNao'),
    dataDe: dataDe ? `${dataDe}T00:00:00` : undefined,
    dataAte: dataAte ? `${dataAte}T23:59:59` : undefined,
  }
}

export function useGetGlobalBookingPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params = buildGlobalBookingParams(pageNumber, pageSize, filters, sorting)

  return useQuery({
    queryKey: [...GLOBAL_BOOKING_PAGINATED_QUERY_KEY, params],
    queryFn: () => PedidosConsultaAdministrativoService(listPermId).getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function usePrefetchAdjacentGlobalBooking(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()
  const base = buildGlobalBookingParams(1, pageSize, filters, null)
  const { pageNumber: _pn, ...baseWithoutPage } = base

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params = { ...baseWithoutPage, pageNumber: page - 1 }
    await queryClient.prefetchQuery({
      queryKey: [...GLOBAL_BOOKING_PAGINATED_QUERY_KEY, params],
      queryFn: () => PedidosConsultaAdministrativoService(listPermId).getPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params = { ...baseWithoutPage, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: [...GLOBAL_BOOKING_PAGINATED_QUERY_KEY, params],
      queryFn: () => PedidosConsultaAdministrativoService(listPermId).getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
