import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import {
  subsistemasServicosColumns,
  getSubsistemasServicosColumnsWithViewCallback,
} from './listagem-subsistemas-servicos-table.columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

interface Props {
  data: SubsistemaServicoTableDTO[]
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
  onOpenView?: (data: SubsistemaServicoTableDTO) => void
  onOpenEdit?: (data: SubsistemaServicoTableDTO) => void
  onOpenDelete?: (data: SubsistemaServicoTableDTO) => void
}

export function ListagemSubsistemasServicosTable({
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
}: Props) {

  const tableColumns = onOpenView
    ? getSubsistemasServicosColumnsWithViewCallback(
        onOpenView,
        onOpenEdit,
        onOpenDelete
      )
    : subsistemasServicosColumns

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

