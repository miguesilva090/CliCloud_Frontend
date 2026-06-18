import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { ArmazemTableDTO } from '@/types/dtos/stocks/armazem.dtos'
import { columns, getColumnsWithViewCallback } from './listagem-armazens-table.columns'

type FilterControlsComponent = React.ComponentType<{
    table: any
    apenasArmazemGeral: boolean
    onApenasArmazemGeralChange: (value: boolean) => void
}>

export function ListagemArmazensTable({
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
    apenasArmazemGeral,
    onApenasArmazemGeralChange,
    onOpenView,
    onOpenEdit,
    onOpenDelete,
    canView,
    canChange,
    canDelete,
}: {
    data: ArmazemTableDTO[]
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
    apenasArmazemGeral: boolean
    onApenasArmazemGeralChange: (value: boolean) => void
    onOpenView?: (data : ArmazemTableDTO) => void
    onOpenEdit?: (data : ArmazemTableDTO) => void
    onOpenDelete?: (data : ArmazemTableDTO) => void
    canView?: boolean
    canChange?: boolean
    canDelete?: boolean
})
{
    const tableColumns = onOpenView
        ? getColumnsWithViewCallback(
            onOpenView,
            onOpenEdit,
            onOpenDelete,
            { canView, canChange, canDelete },
        )
    : columns

    const FilterControlsWrapper = ( props: {table: any }) => (
        <FilterControls 
            {...props}
            apenasArmazemGeral={apenasArmazemGeral}
            onApenasArmazemGeralChange={onApenasArmazemGeralChange}
        />
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
          FilterControls={FilterControlsWrapper}
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