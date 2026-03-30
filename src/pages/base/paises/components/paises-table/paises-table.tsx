import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { PaisTableDTO } from '@/types/dtos/base/paises.dtos'
import { columns, getColumnsWithViewCallback } from './paises-columns'
import { PaisesFilterControls } from './paises-filter-controls'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function PaisesTable({
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
  FilterControls: FilterControlsOverride,
  hiddenColumns,
  onOpenView,
  onOpenEdit,
}: {
  data: PaisTableDTO[]
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
  /** Filtros alternativos (ex.: listagem área-comum – Código/Nome De-Até como Consultas do Dia) */
  FilterControls?: FilterControlsComponent
  /** Colunas ocultas (ex.: codigoFim, nomeFim para filtro intervalo) */
  hiddenColumns?: string[]
  /** Quando definido (ex.: listagem área-comum), "Ver" abre modal na página e "Adicionar" usa o mesmo modal */
  onOpenView?: (data: PaisTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" abre o mesmo modal em modo edição */
  onOpenEdit?: (data: PaisTableDTO) => void
}) {
  const FilterControls = FilterControlsOverride ?? PaisesFilterControls
  const tableColumns = onOpenView
    ? getColumnsWithViewCallback(onOpenView, onOpenEdit)
    : columns
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
