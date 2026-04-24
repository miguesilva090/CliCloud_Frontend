import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { FreguesiaTableDTO } from '@/types/dtos/base/freguesias.dtos'
import { listagemColumns, getListagemColumnsWithViewCallback } from './freguesias-columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

/** Tabela de Freguesias para listagem área-comum: Nome, Concelho, Opções; filtro Nome De/Até; lupa por nome. */
export function FreguesiasListagemTable({
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
  expandableSearch,
  globalSearchColumnId,
  globalSearchPlaceholder,
  FilterControls,
  hiddenColumns,
  onOpenView,
  onOpenEdit,
  rowActionsFuncionalidadeId,
}: {
  data: FreguesiaTableDTO[]
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
  expandableSearch?: boolean
  globalSearchColumnId?: string
  globalSearchPlaceholder?: string
  FilterControls: FilterControlsComponent
  hiddenColumns?: string[]
  /** Quando definido (ex.: listagem área-comum), "Ver" abre modal na página e "Adicionar" usa o mesmo modal */
  onOpenView?: (data: FreguesiaTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" abre o mesmo modal em modo edição */
  onOpenEdit?: (data: FreguesiaTableDTO) => void
  rowActionsFuncionalidadeId?: string
}) {
  const tableColumns = onOpenView
    ? getListagemColumnsWithViewCallback(
        onOpenView,
        onOpenEdit,
        rowActionsFuncionalidadeId
      )
    : listagemColumns
  return (
    <DataTable
      columns={tableColumns}
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
      expandableSearch={expandableSearch}
      globalSearchColumnId={globalSearchColumnId}
      globalSearchPlaceholder={globalSearchPlaceholder}
      hiddenColumns={hiddenColumns}
    />
  )
}
