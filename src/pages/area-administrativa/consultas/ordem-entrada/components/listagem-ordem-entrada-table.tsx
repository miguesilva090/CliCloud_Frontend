import { DataTable } from '@/components/shared/data-table'
import { getOrdemEntradaColumns } from './listagem-ordem-entrada-table.columns'
import { OrdemEntradaFilterControls } from './ordem-entrada-filter-controls'
import type { DataTableAction } from '@/components/shared/data-table'
import type { OrdemEntradaTableDTO } from '@/types/dtos/consultas/ordem-entrada.dtos'
import type { PageFilter } from '@/utils/page-data-utils'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemOrdemEntradaTable({
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
  onOpenObservacoes,
  canView,
  canChange,
  canDelete,
  consultasDesmarcadas,
}: {
  data: OrdemEntradaTableDTO[]
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
  onOpenView: (row: OrdemEntradaTableDTO) => void
  onOpenEdit?: (row: OrdemEntradaTableDTO) => void
  onOpenDelete?: (row: OrdemEntradaTableDTO) => void
  onOpenObservacoes: (row: OrdemEntradaTableDTO) => void
  canView: boolean
  canChange: boolean
  canDelete: boolean
  consultasDesmarcadas: boolean
}) {
  const FilterControls = () => (
    <OrdemEntradaFilterControls filters={filters as PageFilter[]} onFiltersChange={onFiltersChange} />
  )

  return (
    <DataTable
      columns={getOrdemEntradaColumns({
        onOpenView,
        onOpenEdit,
        onOpenDelete,
        onOpenObservacoes,
        canView,
        canChange,
        canDelete,
        consultasDesmarcadas,
      })}
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
      globalSearchColumnId='filtrobox'
      globalSearchPlaceholder='Pesquisar utente…'
    />
  )
}
