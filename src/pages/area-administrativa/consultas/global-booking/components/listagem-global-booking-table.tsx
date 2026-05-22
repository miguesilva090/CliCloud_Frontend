import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table-types'
import { GlobalBookingFilterControls } from './global-booking-filter-controls'
import { getGlobalBookingColumns } from './listagem-global-booking-table.columns'
import type { PedidoConsultaTableDTO } from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'
import type { ReactNode } from 'react'
import type { PageFilter } from '@/utils/page-data-utils'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemGlobalBookingTable({
  data,
  isLoading,
  pageCount,
  totalRows,
  page,
  pageSize,
  filters,
  sorting,
  onPaginationChange,
  onFiltersChange,
  onSortingChange,
  toolbarActions,
  renderRowActions,
}: {
  data: PedidoConsultaTableDTO[]
  isLoading: boolean
  pageCount: number
  totalRows: number
  page: number
  pageSize: number
  filters: TableFilter
  sorting: TableSort
  onPaginationChange: (page: number, pageSize: number) => void
  onFiltersChange: (filters: TableFilter) => void
  onSortingChange: (sorting: TableSort) => void
  toolbarActions?: DataTableAction[]
  renderRowActions: (row: PedidoConsultaTableDTO) => ReactNode
}) {
  const FilterControls = () => (
    <GlobalBookingFilterControls
      filters={filters as PageFilter[]}
      onFiltersChange={onFiltersChange}
    />
  )

  return (
    <DataTable
      columns={getGlobalBookingColumns(renderRowActions)}
      data={data}
      isLoading={isLoading}
      pageCount={pageCount}
      totalRows={totalRows}
      initialPage={page}
      initialPageSize={pageSize}
      initialFilters={filters}
      initialSorting={sorting}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={FilterControls}
      toolbarActions={toolbarActions}
      expandableSearch
      globalSearchColumnId='filtrobox'
      globalSearchPlaceholder='Pesquisar…'
    />
  )
}
