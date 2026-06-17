import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { ConcelhoTableDTO } from '@/types/dtos/base/concelhos.dtos'
import {
  columns,
  getColumnsWithViewCallback,
} from './listagem-concelhos-table.columns'
import { ListagemConcelhosFilterControls } from './listagem-concelhos-filter-controls'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemConcelhosTable({
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
  rowActionsFuncionalidadeId,
}: {
  data: ConcelhoTableDTO[]
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
  FilterControls?: FilterControlsComponent
  hiddenColumns?: string[]
  onOpenView?: (data: ConcelhoTableDTO) => void
  onOpenEdit?: (data: ConcelhoTableDTO) => void
  rowActionsFuncionalidadeId?: string
}) {
  const FilterControls = FilterControlsOverride ?? ListagemConcelhosFilterControls

  const tableColumns = onOpenView
    ? getColumnsWithViewCallback(
        onOpenView,
        onOpenEdit,
        rowActionsFuncionalidadeId
      )
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
