import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import type { ReactNode } from 'react'
import { getMarcacoesAdministrativoColumns } from './listagem-marcacoes-administrativo-table.columns'
import { MarcacoesAdministrativoFiltros } from './marcacoes-administrativo-filtros'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'

type TableFilter = Array<{ id: string; value: string }>
type TableSort = Array<{ id: string; desc: boolean }>

export function ListagemMarcacoesAdministrativoTable({
  data,
  isLoading,
  pageCount,
  totalRows,
  page,
  pageSize,
  filters,
  sorting,
  listCriteria,
  onListCriteriaChange,
  onPaginationChange,
  onFiltersChange,
  onSortingChange,
  toolbarActions,
  onOpenView,
  onOpenEdit,
  onOpenDesmarcar,
  onMudarHorario,
  canView,
  canChange,
  canDelete,
}: {
  data: MarcacaoAdministrativoTableDTO[]
  isLoading: boolean
  pageCount: number
  totalRows: number
  page: number
  pageSize: number
  filters: TableFilter
  sorting: TableSort
  listCriteria: MarcacoesListCriteria
  onListCriteriaChange: (next: MarcacoesListCriteria) => void
  onPaginationChange: (page: number, pageSize: number) => void
  onFiltersChange: (filters: TableFilter) => void
  onSortingChange: (sorting: TableSort) => void
  toolbarActions?: DataTableAction[]
  onOpenView: (row: MarcacaoAdministrativoTableDTO) => void
  onOpenEdit?: (row: MarcacaoAdministrativoTableDTO) => void
  onOpenDesmarcar?: (row: MarcacaoAdministrativoTableDTO) => void
  onMudarHorario?: (row: MarcacaoAdministrativoTableDTO) => void
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
}) {
  return (
    <DataTable
      columns={getMarcacoesAdministrativoColumns(
        onOpenView,
        onOpenEdit,
        onOpenDesmarcar,
        { canView, canChange, canDelete },
        onMudarHorario
          ? (row) => (
              <button
                type='button'
                className='text-xs font-medium text-primary hover:underline'
                onClick={() => onMudarHorario(row)}
              >
                Mudar horário
              </button>
            )
          : undefined
      )}
      data={data}
      pageCount={pageCount}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      onFiltersChange={onFiltersChange}
      onSortingChange={onSortingChange}
      FilterControls={() => (
        <MarcacoesAdministrativoFiltros
          criteria={listCriteria}
          onChange={onListCriteriaChange}
        />
      )}
      initialPage={page}
      initialPageSize={pageSize}
      initialSorting={sorting}
      initialFilters={filters}
      isLoading={isLoading}
      toolbarActions={toolbarActions}
      globalSearchColumnId='utenteNome'
      globalSearchPlaceholder='Procurar utente...'
    />
  )
}
