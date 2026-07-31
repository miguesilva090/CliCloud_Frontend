import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { AdmissaoTratamentoTableDTO } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'
import type { PageFilter } from '@/utils/page-data-utils'
import { ListagemAdmissoesTratamentoFilterControls } from './listagem-admissoes-tratamento-filter-controls'
import { ModoListagemAdmissaoTratamento } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemAdmissoesTratamentoTable({
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
  modo,
}: {
  data: AdmissaoTratamentoTableDTO[]
  columns: ColumnDef<AdmissaoTratamentoTableDTO>[]
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
  modo: ModoListagemAdmissaoTratamento
}) {
  const FilterControls = () => (
    <ListagemAdmissoesTratamentoFilterControls
      filters={filters as PageFilter[]}
      onFiltersChange={onFiltersChange}
      modo={modo}
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
