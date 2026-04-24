import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { ClinicaTableDTO } from '@/types/dtos/core/clinica.dtos'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import {
  columns,
  getColumnsWithViewCallback,
} from './listagem-clinicas-table.columns'

const configuracaoClinicaPermId =
  modules.areaComum.permissions.configuracoesClinica.id

type FilterControlsComponent = React.ComponentType<{
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}>

export function ListagemClinicasTable({
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
  FilterControls,
  hiddenColumns,
  onOpenView,
  onOpenEdit,
  onSetDefault,
}: {
  data: ClinicaTableDTO[]
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
  expandableSearch?: boolean
  globalSearchColumnId?: string
  globalSearchPlaceholder?: string
  FilterControls: FilterControlsComponent
  hiddenColumns?: string[]
  onOpenView?: (data: ClinicaTableDTO) => void
  onOpenEdit?: (data: ClinicaTableDTO) => void
  onSetDefault?: (id: string, porDefeito: boolean) => void
}) {
  const { canView, canChange } =
    useAreaComumEntityListPermissions(configuracaoClinicaPermId)
  const tableColumns = onOpenView
    ? getColumnsWithViewCallback(onOpenView, onOpenEdit, onSetDefault, {
        canView,
        canChange,
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
      expandableSearch={expandableSearch}
      globalSearchColumnId={globalSearchColumnId}
      globalSearchPlaceholder={globalSearchPlaceholder}
      hiddenColumns={hiddenColumns}
    />
  )
}

