import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { NotificacaoTipoTableDTO } from '@/types/dtos/notificacoes/notificacao-tipo.dtos'
import {
  columns,
  getColumnsWithViewCallback,
} from './listagem-notificacao-tipos-table.columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemNotificacaoTiposTable({
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
  data: NotificacaoTipoTableDTO[]
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
  globalSearchColumnId?: string
  globalSearchPlaceholder?: string
  FilterControls: FilterControlsComponent
  hiddenColumns?: string[]
  onOpenView?: (data: NotificacaoTipoTableDTO) => void
  onOpenEdit?: (data: NotificacaoTipoTableDTO) => void
  onOpenDelete?: (data: NotificacaoTipoTableDTO) => void
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
      globalSearchColumnId={globalSearchColumnId}
      globalSearchPlaceholder={globalSearchPlaceholder}
      hiddenColumns={hiddenColumns}
    />
  )
}
