import { useState } from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { CredenciaisSnsLoteTableDTO } from '@/types/dtos/faturacao/credenciais-sns.dtos'
import type { CredenciaisSnsModulo } from '@/types/dtos/faturacao/credenciais-sns.dtos'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { AlertModal } from '@/components/shared/alert-modal'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import {
  CREDENCIAIS_SNS_HIDDEN_FILTER_COLUMNS,
  getCredenciaisSnsColumns,
} from './listagem-credenciais-sns-table.columns'
import { ListagemCredenciaisSnsFilterControls } from './listagem-credenciais-sns-filter-controls'
import { useDeleteCredenciaisSns } from '../queries/credenciais-sns-mutations'
import { credenciaisSnsModuloHasBackendDelete } from '../credenciais-sns-modulo-config'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemCredenciaisSnsTable({
  modulo,
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
  rowActionPermissions,
  selectedRows,
  onRowSelectionChange,
}: {
  modulo: CredenciaisSnsModulo
  data: CredenciaisSnsLoteTableDTO[]
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
  onOpenView: (data: CredenciaisSnsLoteTableDTO) => void
  rowActionPermissions?: AreaComumListRowActionPermissions
  selectedRows?: string[]
  onRowSelectionChange?: (selectedRows: string[]) => void
}) {
  const [deleteTarget, setDeleteTarget] = useState<CredenciaisSnsLoteTableDTO | null>(
    null
  )
  const deleteMutation = useDeleteCredenciaisSns(modulo)
  const deleteEnabled =
    credenciaisSnsModuloHasBackendDelete(modulo) &&
    rowActionPermissions?.canDelete !== false

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const response = await deleteMutation.mutateAsync({
        indices: [deleteTarget.indice],
      })
      const result = handleApiResponse(
        response,
        'Lote eliminado com sucesso',
        'Erro ao eliminar o lote',
        'Lote eliminado com avisos'
      )
      if (result.success) {
        setDeleteTarget(null)
        onRowSelectionChange?.(
          (selectedRows ?? []).filter((id) => id !== deleteTarget.id)
        )
      }
    } catch {
      toast.error('Erro ao eliminar o lote')
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <DataTable
        columns={getCredenciaisSnsColumns(
          onOpenView,
          deleteEnabled ? (row) => setDeleteTarget(row) : undefined,
          { ...rowActionPermissions, canChange: false }
        )}
        data={data}
        isLoading={isLoading}
        pageCount={pageCount}
        totalRows={totalRows}
        onPaginationChange={onPaginationChange}
        onFiltersChange={onFiltersChange}
        onSortingChange={onSortingChange}
        toolbarActions={toolbarActions}
        selectedRows={selectedRows}
        onRowSelectionChange={onRowSelectionChange}
        FilterControls={ListagemCredenciaisSnsFilterControls}
        hiddenColumns={[...CREDENCIAIS_SNS_HIDDEN_FILTER_COLUMNS]}
        expandableSearch
        initialPage={page}
        initialPageSize={pageSize}
        initialFilters={filters}
        initialSorting={
          sorting.length > 0 ? sorting : [{ id: 'numeroLote', desc: false }]
        }
        globalSearchColumnId='filtrobox'
        globalSearchPlaceholder='N.º lote ou índice...'
      />

      <AlertModal
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
        title='Eliminar lote SNS'
        description={
          deleteTarget
            ? `Confirma a eliminação do lote ${deleteTarget.numeroLote} (índice ${deleteTarget.indice})?`
            : ''
        }
      />
    </>
  )
}
