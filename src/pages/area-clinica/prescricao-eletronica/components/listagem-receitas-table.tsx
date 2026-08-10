import type { ReactNode } from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { ReceitaMedicaTableDTO } from '@/types/dtos/prescricao/receita-medica.dtos'
import { columns, getReceitasColumns } from './listagem-receitas-table.columns'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export function ListagemReceitasTable({
  data,
  isLoading,
  pageCount,
  totalRows,
  page,
  pageSize,
  onPaginationChange,
  onFiltersChange,
  onSortingChange,
  onOpenView,
  onOpenEdit,
  onOpenAnular,
  renderExtraActions,
  rowActionPermissions,
  toolbarActions,
}: {
  data: ReceitaMedicaTableDTO[]
  isLoading: boolean
  pageCount: number
  totalRows: number
  page: number
  pageSize: number
  onPaginationChange: (page: number, pageSize: number) => void
  onFiltersChange: (filters: Array<{ id: string; value: string }>) => void
  onSortingChange: (sorting: Array<{ id: string; desc: boolean }>) => void
  onOpenView?: (data: ReceitaMedicaTableDTO) => void
  onOpenEdit?: (data: ReceitaMedicaTableDTO) => void
  onOpenAnular?: (data: ReceitaMedicaTableDTO) => void
  renderExtraActions?: (data: ReceitaMedicaTableDTO) => ReactNode
  rowActionPermissions?: AreaComumListRowActionPermissions
  toolbarActions?: React.ComponentProps<typeof DataTable>['toolbarActions']
}) {
  const tableColumns =
    onOpenView != null
      ? getReceitasColumns(
          onOpenView,
          onOpenEdit,
          onOpenAnular,
          rowActionPermissions,
          renderExtraActions
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
      initialPage={page}
      initialPageSize={pageSize}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      globalSearchColumnId='numeroReceita'
      globalSearchPlaceholder='Pesquisar nº receita...'
    />
  )
}
