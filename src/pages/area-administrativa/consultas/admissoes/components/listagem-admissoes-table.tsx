import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import type { ReactNode } from 'react'
import {
  getAdmissoesColumns,
  type AdmissaoGridToggleHandlers,
} from './listagem-admissoes-table.columns'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemAdmissoesTable({
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
  onOpenView,
  onOpenEdit,
  onOpenDelete,
  canView,
  canChange,
  canDelete,
  renderExtraActions,
  gridToggles,
  selectedRows,
  onRowSelectionChange,
  globalSearchPlaceholder = 'Procurar por utente ou credencial...',
}: {
  data: AdmissaoTableDTO[]
  isLoading: boolean
  pageCount: number
  totalRows: number
  page: number
  pageSize: number
  filters: TableFilter
  sorting: TableSort
  onPaginationChange: (page: number, pageSize: number) => void
  onFiltersChange: (filters: TableFilter) => void
  onSortingChange: (sorting: TableSort) => void
  toolbarActions?: DataTableAction[]
  onOpenView: (data: AdmissaoTableDTO) => void
  onOpenEdit?: (data: AdmissaoTableDTO) => void
  onOpenDelete?: (data: AdmissaoTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
  renderExtraActions?: (data: AdmissaoTableDTO) => ReactNode
  gridToggles?: AdmissaoGridToggleHandlers
  selectedRows?: string[]
  onRowSelectionChange?: (ids: string[]) => void
  globalSearchPlaceholder?: string
}) {
  return (
    <DataTable
      columns={getAdmissoesColumns(
        onOpenView,
        onOpenEdit,
        onOpenDelete,
        { canView, canChange, canDelete },
        renderExtraActions,
        gridToggles
      )}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={() => null}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      selectedRows={selectedRows}
      onRowSelectionChange={onRowSelectionChange}
      globalSearchColumnId='utenteNome'
      globalSearchPlaceholder={globalSearchPlaceholder}
      tableClassName='table-fixed w-full'
      initialColumnVisibility={{ credencial: false }}
    />
  )
}
