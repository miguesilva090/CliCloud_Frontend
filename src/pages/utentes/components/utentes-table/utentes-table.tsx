import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, type DataTableAction } from '@/components/shared/data-table'
import type { UtenteTableDTO } from '@/types/dtos/saude/utentes.dtos'
import { getUtentesTableColumns } from './utentes-table-columns'
import { UtentesFilterControls } from './utentes-filter-controls'

export function UtentesTable({
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
  /** Colunas customizadas; se não for passado, usa colunas unificadas com deleteReturnPath */
  columns?: ColumnDef<UtenteTableDTO>[]
  /** Caminho para redirecionar após apagar (para colunas unificadas) */
  deleteReturnPath?: string
  /** Se definido, abre diálogo de confirmação em vez de window.confirm ao apagar */
  onOpenDelete?: (row: UtenteTableDTO) => void
  toolbarActions?: DataTableAction[]
  expandableSearch?: boolean
  globalSearchColumnId?: string
  globalSearchPlaceholder?: string
  /** Visibilidade de colunas (por defeito oculta numeroContribuinte, usada só no filtro) */
  initialColumnVisibility?: Record<string, boolean>
}) {
  const tableColumns =
    columnsOverride ??
    getUtentesTableColumns(deleteReturnPath ?? '/utentes', onOpenDelete)

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
      FilterControls={UtentesFilterControls}
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

