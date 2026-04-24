import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { OrganismoTableDTO } from '@/types/dtos/saude/organismos.dtos'
import {
  columns,
  getColumnsWithViewCallback,
} from './listagem-organismos-table.columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemOrganismosTable({
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
  onOpenDelete,
  canView,
  canChange,
  canDelete,
}: {
  data: OrganismoTableDTO[]
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
  onOpenView?: (data: OrganismoTableDTO) => void
  onOpenEdit?: (data: OrganismoTableDTO) => void
  onOpenDelete?: (data: OrganismoTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
}) {
  const tableColumns = onOpenView
    ? getColumnsWithViewCallback(onOpenView, onOpenEdit, onOpenDelete, {
        canView,
        canChange,
        canDelete,
      })
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
