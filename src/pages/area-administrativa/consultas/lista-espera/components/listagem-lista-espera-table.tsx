import { DataTable } from '@/components/shared/data-table'
import { getListaEsperaColumns } from './listagem-lista-espera-table.columns'
import { ListaEsperaFilterControls } from './lista-espera-filter-controls'
import type { DataTableAction } from '@/components/shared/data-table'
import type { ListaEsperaTableDTO } from '@/types/dtos/consultas/lista-espera-administrativo.dtos'
import type { ReactNode } from 'react'
import type { PageFilter } from '@/utils/page-data-utils'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemListaEsperaTable({
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
  onOpenView,
  onOpenEdit,
  onOpenDelete,
  canView,
  canChange,
  canDelete,
  renderExtraActions,
  selectedRows,
  onRowSelectionChange,
}: {
  data: ListaEsperaTableDTO[]
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
  onOpenView: (data: ListaEsperaTableDTO) => void
  onOpenEdit?: (data: ListaEsperaTableDTO) => void
  onOpenDelete?: (data: ListaEsperaTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
  renderExtraActions?: (data: ListaEsperaTableDTO) => ReactNode
  selectedRows?: string[]
  onRowSelectionChange?: (selectedRows: string[]) => void
}) {
  const FilterControls = () => (
    <ListaEsperaFilterControls
      filters={filters as PageFilter[]}
      onFiltersChange={onFiltersChange}
    />
  )

  return (
    <DataTable
      columns={getListaEsperaColumns(
        onOpenView,
        onOpenEdit,
        onOpenDelete,
        { canView, canChange, canDelete },
        renderExtraActions
      )}
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
      selectedRows={selectedRows}
      onRowSelectionChange={onRowSelectionChange}
    />
  )
}
