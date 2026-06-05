import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import {
  ficheiroEletronicoColumns,
  type FicheiroEletronicoRow,
} from './ficheiro-eletronico-columns'
import { FicheiroEletronicoFilterControls } from './ficheiro-eletronico-filter-controls'

export function FicheiroEletronicoTable({
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
  selectedRows,
  onRowSelectionChange,
}: {
  data: FicheiroEletronicoRow[]
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
  toolbarActions: DataTableAction[]
  selectedRows?: string[]
  onRowSelectionChange?: (selectedRows: string[]) => void
}) {
  return (
    <DataTable
      columns={ficheiroEletronicoColumns}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={FicheiroEletronicoFilterControls}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      selectedRows={selectedRows}
      onRowSelectionChange={onRowSelectionChange}
      globalSearchColumnId='numeroExibicaoDocumento'
      globalSearchPlaceholder='Procurar...'
    />
  )
}
