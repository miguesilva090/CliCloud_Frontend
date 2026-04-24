import React, { useMemo } from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { NotificacaoTableDTO } from '@/types/dtos/notificacoes/notificacao.dtos'
import { getNotificacoesTableColumns } from './listagem-notificacoes-table.columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemNotificacoesTable({
  listMode,
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
  onOpenDelete,
  onMarcarLida,
  canView,
  canDelete,
}: {
  listMode: number
  data: NotificacaoTableDTO[]
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
  onOpenView: (data: NotificacaoTableDTO) => void
  onOpenDelete?: (data: NotificacaoTableDTO) => void
  onMarcarLida?: (data: NotificacaoTableDTO) => void
  canView?: boolean
  canDelete?: boolean
}) {
  const tableColumns = useMemo(
    () =>
      getNotificacoesTableColumns(listMode, {
        onOpenView,
        onOpenDelete,
        onMarcarLida,
        rowActionPermissions: { canView, canDelete },
      }),
    [listMode, onOpenView, onOpenDelete, onMarcarLida, canView, canDelete],
  )

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
