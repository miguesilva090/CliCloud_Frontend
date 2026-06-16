import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import {
    FATURACAO_HIDDEN_FILTER_COLUMNS,
    faturacaoColumns,
    getFaturacaoColumnsWithActions,
} from './listagem-faturacao-table.columns'

type FilterControlsComponent = React.ComponentType<{
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
}>

export function ListagemFaturacaoTable({
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
    FilterControls,
    onOpenView,
    onOpenEdit,
    renderExtraActions,
    selectedRows,
    onRowSelectionChange,
}: {
    data: DocumentoTableDTO[]
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
    FilterControls: FilterControlsComponent
    onOpenView: (data: DocumentoTableDTO) => void
    onOpenEdit: (data: DocumentoTableDTO) => void
    renderExtraActions?: (data: DocumentoTableDTO) => React.ReactNode
    selectedRows?: string[]
    onRowSelectionChange?: (selectedRows: string[]) => void
}) {
    const tableColumns =
        renderExtraActions
            ? getFaturacaoColumnsWithActions(onOpenView, onOpenEdit, renderExtraActions, {
                canView: true,
                canChange: true,
              })
            : faturacaoColumns

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
            selectedRows={selectedRows}
            onRowSelectionChange={onRowSelectionChange}
            hiddenColumns={[...FATURACAO_HIDDEN_FILTER_COLUMNS]}
            globalSearchColumnId='numeroExibicao'
            globalSearchPlaceholder='Procurar por n.º documento...'
        />
    )
}