import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { TratamentoMarcadosTableDTO } from '@/types/dtos/tratamentos/tratamento-marcados-administrativo.dtos'
import type { PageFilter } from '@/utils/page-data-utils'
import { ListagemTratamentosMarcadosFilterControls } from './listagem-tratamentos-marcados-filter-controls'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemTratamentosMarcadosTable({
  data,
  columns,
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
  data: TratamentoMarcadosTableDTO[]
  columns: DataTableColumnDef<TratamentoMarcadosTableDTO>[]
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
  const FilterControls = () => (
    <ListagemTratamentosMarcadosFilterControls
      filters={filters as PageFilter[]}
      onFiltersChange={onFiltersChange}
    />
  )

  return (
    <DataTable
      columns={columns}
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
      globalSearchColumnId='utenteNome'
      globalSearchPlaceholder='Procurar utente…'
    />
  )
}