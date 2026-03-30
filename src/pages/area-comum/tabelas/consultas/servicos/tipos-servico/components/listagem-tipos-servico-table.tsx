import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { TipoServicoTableDTO } from '@/types/dtos/servicos/tipo-servico.dtos'
import {
  tiposServicoColumns,
  getTiposServicoColumnsWithViewCallback,
} from './listagem-tipos-servico-table.columns'

export function ListagemTiposServicoTable({
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
  onOpenView,
  onOpenEdit,
  onOpenDelete,
}: {
  data: TipoServicoTableDTO[]
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
  onOpenView?: (data: TipoServicoTableDTO) => void
  onOpenEdit?: (data: TipoServicoTableDTO) => void
  onOpenDelete?: (data: TipoServicoTableDTO) => void
}) {
  const EmptyFilterControls: React.ComponentType<{
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
  }> = () => null

  const tableColumns = onOpenView
    ? getTiposServicoColumnsWithViewCallback(onOpenView, onOpenEdit, onOpenDelete)
    : tiposServicoColumns

  return (
    <DataTable
      columns={tableColumns}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      globalSearchColumnId={globalSearchColumnId}
      globalSearchPlaceholder={globalSearchPlaceholder}
      FilterControls={EmptyFilterControls}
    />
  )
}

