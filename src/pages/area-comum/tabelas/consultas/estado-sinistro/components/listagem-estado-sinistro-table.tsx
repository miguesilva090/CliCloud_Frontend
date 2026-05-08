import { DataTable } from '@/components/shared/data-table'
import type { EstadoSinistroDTO } from '@/types/dtos/sinistrados/estado-sinistro.dto'
import { getEstadoSinistroColumns } from './listagem-estado-sinistro-table.columns'
import type { DataTableAction } from '@/components/shared/data-table'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemEstadoSinistroTable({
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
}: {
  data: EstadoSinistroDTO[]
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
  onOpenView: (data: EstadoSinistroDTO) => void
  onOpenEdit?: (data: EstadoSinistroDTO) => void
  onOpenDelete?: (data: EstadoSinistroDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
}) {
  return (
    <DataTable
      columns={getEstadoSinistroColumns(onOpenView, onOpenEdit, onOpenDelete, {
        canView,
        canChange,
        canDelete,
      })}
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
      globalSearchColumnId='designacao'
      globalSearchPlaceholder='Procurar por designação...'
    />
  )
}
