import type { ReactNode } from 'react'
import { DataTable } from '@/components/shared/data-table'
import {
  loteDirectAgregadosColumns,
  LOTE_DIRECT_AGREGADOS_HIDDEN_FILTER_COLUMNS,
} from './listagem-lote-direct-agregados-table.columns'
import type { DataTableAction } from '@/components/shared/data-table'
import type { LoteDirectAgregadoTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemLoteDirectAgregadosTable({
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
  FilterControls,
}: {
  data: LoteDirectAgregadoTableDTO[]
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
  FilterControls: FilterControlsComponent
}) {
  return (
    <DataTable
      columns={loteDirectAgregadosColumns}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={FilterControls}
      hiddenColumns={[...LOTE_DIRECT_AGREGADOS_HIDDEN_FILTER_COLUMNS]}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
    />
  )
}
