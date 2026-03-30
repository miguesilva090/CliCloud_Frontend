import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { MargemMedicoTableDTO } from '@/types/dtos/saude/margem-medico.dtos'
import { margemMedicosColumns , getMargemMedicosColumnsWithViewCallback} from './listagem-margem-medicos-table-columns'

export function ListagemMargemMedicosTable({
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
    data: MargemMedicoTableDTO[]
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
    onOpenView?: (data: MargemMedicoTableDTO) => void
    onOpenEdit?: (data: MargemMedicoTableDTO) => void
    onOpenDelete?: (data: MargemMedicoTableDTO) => void
}) {
    const EmptyFilterControls: React.ComponentType<{
        table: unknown
        columns: unknown[]
        onApplyFilters: () => void
        onClearFilters: () => void
    }> = () => null

    const tableColumns = onOpenView
        ? getMargemMedicosColumnsWithViewCallback(onOpenView, onOpenEdit, onOpenDelete)
        : margemMedicosColumns

    return (
        <DataTable
            columns={tableColumns}
            data={data}
            pageCount={pageCount}
            totalRows={totalRows}
            onPaginationChange={onPaginationChange}
            onFiltersChange={onFiltersChange}
            onSortingChange={onSortingChange}
            FilterControls={EmptyFilterControls}
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