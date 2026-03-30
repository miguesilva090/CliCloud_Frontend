import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, type DataTableAction } from '@/components/shared/data-table'
import type { MedicoTableDTO } from '@/types/dtos/saude/medicos.dtos'
import { MedicosFilterControls } from './medicos-filter-controls'

export function MedicosTable({
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
  columns,
  toolbarActions,
  expandableSearch,
  globalSearchColumnId,
  globalSearchPlaceholder,
}: {
  data: MedicoTableDTO[]
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
  columns: ColumnDef<MedicoTableDTO, any>[]
  toolbarActions?: DataTableAction[]
  expandableSearch?: boolean
  globalSearchColumnId?: string
  globalSearchPlaceholder?: string
}) {
  return (
    <DataTable<MedicoTableDTO, any>
      columns={columns}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={MedicosFilterControls}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      expandableSearch={expandableSearch}
      globalSearchColumnId={globalSearchColumnId}
      globalSearchPlaceholder={globalSearchPlaceholder}
    />
  )
}

