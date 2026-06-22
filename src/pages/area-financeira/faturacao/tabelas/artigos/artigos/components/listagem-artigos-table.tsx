import React from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { ArtigoTableDTO } from '@/types/dtos/stocks/artigo.dtos'
import { columns, getColumnsWithViewCallback } from './listagem-artigos-table.columns'

type FilterControlsComponent = React.ComponentType<{
  table: any
  apenasInativos: boolean
  onApenasInativosChange: (value: boolean) => void
  apenasDescontinuados: boolean
  onApenasDescontinuadosChange: (value: boolean) => void
  tipoArtigo: number | undefined
  onTipoArtigoChange: (value: number | undefined) => void
}>

export function ListagemArtigosTable({
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
  apenasInativos,
  onApenasInativosChange,
  apenasDescontinuados,
  onApenasDescontinuadosChange,
  tipoArtigo,
  onTipoArtigoChange,
  onOpenView,
  onOpenEdit,
  onOpenDelete,
  canView,
  canChange,
  canDelete,
}: {
  data: ArtigoTableDTO[]
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
  apenasInativos: boolean
  onApenasInativosChange: (value: boolean) => void
  apenasDescontinuados: boolean
  onApenasDescontinuadosChange: (value: boolean) => void
  tipoArtigo: number | undefined
  onTipoArtigoChange: (value: number | undefined) => void
  onOpenView?: (data: ArtigoTableDTO) => void
  onOpenEdit?: (data: ArtigoTableDTO) => void
  onOpenDelete?: (data: ArtigoTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
}) {
  const tableColumns = onOpenView
    ? getColumnsWithViewCallback(onOpenView, onOpenEdit, onOpenDelete, {
        canView,
        canChange,
        canDelete,
      })
    : columns

  const FilterControlsWrapper = (props: { table: any }) => (
    <FilterControls
      {...props}
      apenasInativos={apenasInativos}
      onApenasInativosChange={onApenasInativosChange}
      apenasDescontinuados={apenasDescontinuados}
      onApenasDescontinuadosChange={onApenasDescontinuadosChange}
      tipoArtigo={tipoArtigo}
      onTipoArtigoChange={onTipoArtigoChange}
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
