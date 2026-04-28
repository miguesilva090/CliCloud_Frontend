import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { AtestadoTableDTO } from '@/types/dtos/saude/atestados.dtos'
import { columns, getColumnsWithViewCallback } from './atestados-columns'
import { AtestadosFilterControls } from './atestados-filter-controls'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

const HIDDEN_FILTER_COLUMNS = [
  'data',
  'idUtente',
  'idMedico',
  'intervalo',
  'dataFim',
  'idUtenteFim',
  'idMedicoFim',
]

export function AtestadosTable({
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
  onOpenView,
  onOpenEdit,
  onOpenDelete,
  rowActionPermissions,
  toolbarActions,
  globalSearchColumnId,
  globalSearchPlaceholder,
}: {
  data: AtestadoTableDTO[]
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
  onOpenView?: (data: AtestadoTableDTO) => void
  onOpenEdit?: (data: AtestadoTableDTO) => void
  onOpenDelete?: (data: AtestadoTableDTO) => void
  rowActionPermissions?: AreaComumListRowActionPermissions
  toolbarActions?: React.ComponentProps<typeof DataTable>['toolbarActions']
  globalSearchColumnId?: string
  globalSearchPlaceholder?: string
}) {
  const tableColumns =
    onOpenView != null
      ? getColumnsWithViewCallback(
          onOpenView,
          onOpenEdit,
          onOpenDelete,
          rowActionPermissions
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
      FilterControls={AtestadosFilterControls}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      hiddenColumns={HIDDEN_FILTER_COLUMNS}
      toolbarActions={toolbarActions}
      expandableSearch
      globalSearchColumnId={globalSearchColumnId}
      globalSearchPlaceholder={globalSearchPlaceholder}
    />
  )
}
