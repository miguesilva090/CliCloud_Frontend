import { DataTable } from '@/components/shared/data-table'
import { getListaEsperaTratamentoColumns } from './listagem-lista-espera-tratamento-table.columns'
import { ListaEsperaTratamentoFilterControls } from './lista-espera-tratamento-filter-controls'
import type { DataTableAction } from '@/components/shared/data-table'
import type { ListaEsperaTratamentoTableDTO } from '@/types/dtos/tratamentos/lista-espera-tratamento-administrativo.dtos'
import type { ReactNode } from 'react'
import type { PageFilter } from '@/utils/page-data-utils'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemListaEsperaTratamentoTable({
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
}: {
  data: ListaEsperaTratamentoTableDTO[]
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
  onOpenView: (data: ListaEsperaTratamentoTableDTO) => void
  onOpenEdit?: (data: ListaEsperaTratamentoTableDTO) => void
  onOpenDelete?: (data: ListaEsperaTratamentoTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
  renderExtraActions?: (data: ListaEsperaTratamentoTableDTO) => ReactNode
}) {
  const FilterControls = () => (
    <ListaEsperaTratamentoFilterControls
      filters={filters as PageFilter[]}
      onFiltersChange={onFiltersChange}
    />
  )

  return (
    <DataTable
      columns={getListaEsperaTratamentoColumns(
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
    />
  )
}
