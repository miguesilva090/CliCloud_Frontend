import { DataTable } from '@/components/shared/data-table'
import { getLoteDirectColumns } from './listagem-lote-direct-table.columns'
import type { DataTableAction } from '@/components/shared/data-table'
import type { LoteDirectTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'
import type { ReactNode } from 'react'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemLoteDirectTable({
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
  data: LoteDirectTableDTO[]
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
  onOpenView: (data: LoteDirectTableDTO) => void
  onOpenEdit?: (data: LoteDirectTableDTO) => void
  onOpenDelete?: (data: LoteDirectTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
  renderExtraActions?: (data: LoteDirectTableDTO) => ReactNode
}) {
  return (
    <DataTable
      columns={getLoteDirectColumns(
        onOpenView,
        onOpenEdit,
        onOpenDelete,
        { canView, canChange, canDelete },
        renderExtraActions
      )}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={() => null}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      globalSearchColumnId='credencial'
      globalSearchPlaceholder='Procurar por credencial...'
    />
  )
}