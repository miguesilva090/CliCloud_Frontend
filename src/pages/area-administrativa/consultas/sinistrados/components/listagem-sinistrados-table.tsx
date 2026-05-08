import { DataTable } from '@/components/shared/data-table'
import { getSinistradosColumns } from './listagem-sinistrados-table.columns'
import type { DataTableAction } from '@/components/shared/data-table'
import type { SinistradoTableDTO } from '@/types/dtos/sinistrados/sinistrado.dtos'
import type { ReactNode } from 'react'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemSinistradosTable({
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
  data: SinistradoTableDTO[]
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
  onOpenView: (data: SinistradoTableDTO) => void
  onOpenEdit?: (data: SinistradoTableDTO) => void
  onOpenDelete?: (data: SinistradoTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
  renderExtraActions?: (data: SinistradoTableDTO) => ReactNode
}) {
  return (
    <DataTable
      columns={getSinistradosColumns(
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
      globalSearchColumnId='codigoSinistro'
      globalSearchPlaceholder='Procurar por sinistro...'
    />
  )
}
