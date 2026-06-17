import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, type DataTableAction } from '@/components/shared/data-table'
import type { UtenteTableDTO } from '@/types/dtos/saude/utentes.dtos'
import { entityRoutes } from '@/config/entity-routes'
import { getListagemUtentesColumns } from './listagem-utentes-table.columns'
import { ListagemUtentesFilterControls } from './listagem-utentes-filter-controls'

export function ListagemUtentesTable({
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
  columns: columnsOverride,
  deleteReturnPath,
  onOpenDelete,
  toolbarActions,
  expandableSearch,
  globalSearchColumnId,
  globalSearchPlaceholder,
  initialColumnVisibility,
}: {
  data: UtenteTableDTO[]
  isLoading: boolean
  pageCount: number
  totalRows: number
  page: number
  pageSize: number
  filters: Array<{ id: string; value: string }>
  sorting: Array<{ id: string; desc: boolean }>
  onPaginationChange: (page: number, pageSize: number) => void
  onFiltersChange: (filters: Array<{ id: string; value: string }>) => void
  onSortingChange: (sorting: Array<{ id: string; desc: boolean }>) => void
  columns?: ColumnDef<UtenteTableDTO>[]
  deleteReturnPath?: string
  onOpenDelete?: (row: UtenteTableDTO) => void
  toolbarActions?: DataTableAction[]
  expandableSearch?: boolean
  globalSearchColumnId?: string
  globalSearchPlaceholder?: string
  initialColumnVisibility?: Record<string, boolean>
}) {
  const tableColumns =
    columnsOverride ??
    getListagemUtentesColumns(deleteReturnPath ?? entityRoutes.utentes.listagem, onOpenDelete)

  const defaultColumnVisibility: Record<string, boolean> = {
    numeroContribuinte: false,
    numeroUtente: true,
    ...initialColumnVisibility,
  }

  return (
    <DataTable
      columns={tableColumns}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={ListagemUtentesFilterControls}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      initialColumnVisibility={defaultColumnVisibility}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      expandableSearch={expandableSearch}
      globalSearchColumnId={globalSearchColumnId}
      globalSearchPlaceholder={globalSearchPlaceholder}
    />
  )
}
