import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { PaisTableDTO } from '@/types/dtos/base/paises.dtos'
import {
    columns,
    getColumnsWithViewCallback
} from './listagem-paises-table.columns'
import { ListagemPaisesFilterControls } from './listagem-paises-filter-controls'

type FilterControlsComponent = React.ComponentType<{
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
}>

export function ListagemPaisesTable({
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
    FilterControls: FilterControlsComponent,
    hiddenColumns,
    onOpenView,
    onOpenEdit,
    rowActionsFuncionalidadeId,
}: {
    data: PaisTableDTO[]
    isLoading: boolean
    pageCount: number
    totalRows: number
    page: number
    pageSize: number
    filters: Array<{id: string, value: string}>
    sorting: Array<{id: string, desc: boolean}>
    onPaginationChange: (page: number, pageSize: number) => void
    onFiltersChange: (filters: Array<{id: string, value: string}>) => void
    onSortingChange: (sorting: Array<{id: string, desc: boolean}>) => void
    toolbarActions?: React.ComponentProps<typeof DataTable>['toolbarActions']
    expandableSearch?: boolean
    globalSearchColumnId?: string
    globalSearchPlaceholder?: string
    FilterControls?: FilterControlsComponent
    hiddenColumns?: string[]
    onOpenView?: (data: PaisTableDTO) => void
    onOpenEdit?: (data: PaisTableDTO) => void
    rowActionsFuncionalidadeId?: string
}) {
    const FilterControls = FilterControlsComponent ?? ListagemPaisesFilterControls

    const tableColumns = onOpenView
        ? getColumnsWithViewCallback(
            onOpenView,
            onOpenEdit,
            rowActionsFuncionalidadeId
        ): columns

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