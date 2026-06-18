import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { ZonaFiscalTableDTO } from '@/types/dtos/faturacao/zona-fiscal.dtos'
import type { TableFilter } from '@/types/dtos/common/table-filters.dtos'
import {
  columns,
  getColumnsWithViewCallback,
} from './listagem-zonas-fiscais-table.columns'
import { ListagemZonasFiscaisFilterControls } from './listagem-zonas-fiscais-filter-controls'

export function ListagemZonasFiscaisTable({
  data,
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
  onOpenView,
  canView,
}: {
  data: ZonaFiscalTableDTO[]
  pageCount: number
  totalRows: number
  page: number
  pageSize: number
  filters: TableFilter[]
  sorting: Array<{ id: string; desc: boolean }>
  onPaginationChange: (page: number, pageSize: number) => void
  onFiltersChange: (filters: TableFilter[]) => void
  onSortingChange: (sorting: Array<{ id: string; desc: boolean }>) => void
  toolbarActions?: React.ComponentProps<typeof DataTable>['toolbarActions']
  onOpenView?: (data: ZonaFiscalTableDTO) => void
  canView?: boolean
}) {
  const tableColumns = onOpenView
    ? getColumnsWithViewCallback(onOpenView, { canView, canChange: false, canDelete: false })
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
      FilterControls={ListagemZonasFiscaisFilterControls}
      toolbarActions={toolbarActions}
      expandableSearch
      globalSearchColumnId='descricao'
      globalSearchPlaceholder='Procurar por descrição...'
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={false}
    />
  )
}
