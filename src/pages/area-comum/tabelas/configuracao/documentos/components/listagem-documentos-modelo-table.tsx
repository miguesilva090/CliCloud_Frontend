import { DataTable } from '@/components/shared/data-table'
import type { ModeloDocumentoDTO } from '@/types/dtos/documentos/motor-documental.dtos'
import { getDocumentosModeloColumns } from './listagem-documentos-modelo-table.columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemDocumentosModeloTable({
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
  globalSearchPlaceholder,
  FilterControls,
  onEdit,
  onGerar,
  onDelete,
}: {
  data: ModeloDocumentoDTO[]
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
  toolbarActions?: React.ComponentProps<typeof DataTable>['toolbarActions']
  globalSearchPlaceholder?: string
  FilterControls: FilterControlsComponent
  onEdit: (row: ModeloDocumentoDTO) => void
  onGerar: (row: ModeloDocumentoDTO) => void
  onDelete: (row: ModeloDocumentoDTO) => void
}) {
  return (
    <DataTable
      columns={getDocumentosModeloColumns(onEdit, onGerar, onDelete)}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={FilterControls}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      globalSearchColumnId='nome'
      globalSearchPlaceholder={globalSearchPlaceholder}
    />
  )
}
