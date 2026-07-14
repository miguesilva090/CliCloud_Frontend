import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { UnidadeMedidaTableDTO } from '@/types/dtos/stocks/unidade-medida.dtos'
import {
    columns,
    getColumnsWithViewCallback,
} from './listagem-unidades-table.columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemUnidadesTable({
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
    onOpenView,
    onOpenEdit,
    onOpenDelete,
    canView,
    canChange,
    canDelete,
}: {
    data: UnidadeMedidaTableDTO[]
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
    onOpenView?: (data: UnidadeMedidaTableDTO) => void
    onOpenEdit?: (data: UnidadeMedidaTableDTO) => void
    onOpenDelete?: (data: UnidadeMedidaTableDTO) => void
    canView?: boolean
    canChange?: boolean
    canDelete?: boolean
}) {
    const tableColumns = onOpenView
        ? getColumnsWithViewCallback(
              onOpenView,
              onOpenEdit,
              onOpenDelete,
              { canView, canChange, canDelete },
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
            globalSearchColumnId={globalSearchColumnId}
            globalSearchPlaceholder={globalSearchPlaceholder}
        />
    )
}
