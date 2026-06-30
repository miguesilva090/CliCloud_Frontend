import { DataTable } from '@/components/shared/data-table'
import { loteDirectAgregadosColumns } from './listagem-lote-direct-agregados-table.columns'
import type { DataTableAction } from '@/components/shared/data-table'
import type { LoteDirectAgregadoTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemLoteDirectAgregadosTable({
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
}: {
  data: LoteDirectAgregadoTableDTO[]
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
}) {
  return (
    <DataTable
      columns={loteDirectAgregadosColumns}
      data={data}
      isLoading={isLoading}
      pageCount={pageCount}
      totalRows={totalRows}
      page={page}
      pageSize={pageSize}
      filters={filters}
      sorting={sorting}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      toolbarActions={toolbarActions}
      enableRowSelection={false}
    />
  )
}
