import { useMemo, useState } from 'react'
import { List, RotateCw } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import type { DataTableAction } from '@/components/shared/data-table'
import type { TableFilter } from '@/types/dtos/common/table-filters.dtos'
import type { ZonaFiscalTableDTO } from '@/types/dtos/faturacao/zona-fiscal.dtos'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ZONAS_FISCAIS_ROWS } from '../utils/zonas-fiscais-data'
import {
  filterZonasFiscaisRows,
  paginateZonasFiscaisRows,
  sortZonasFiscaisRows,
} from '../utils/zonas-fiscais-list-utils'
import { ListagemZonasFiscaisTable } from '../components/listagem-zonas-fiscais-table'
import { ZonaFiscalViewModal } from '../modals/zona-fiscal-view-modal'

const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

export function ListagemZonasFiscaisPage() {
  const { canView } = useAreaComumEntityListPermissions(tabelasPermId)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<TableFilter[]>([])
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([
    { id: 'codigo', desc: false },
  ])
  const [modalOpen, setModalOpen] = useState(false)
  const [viewData, setViewData] = useState<ZonaFiscalTableDTO | null>(null)

  const filteredRows = useMemo(
    () => filterZonasFiscaisRows(ZONAS_FISCAIS_ROWS, filters),
    [filters],
  )
  const sortedRows = useMemo(
    () => sortZonasFiscaisRows(filteredRows, sorting),
    [filteredRows, sorting],
  )
  const totalRows = sortedRows.length
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize))
  const rows = useMemo(
    () => paginateZonasFiscaisRows(sortedRows, page, pageSize),
    [sortedRows, page, pageSize],
  )

  const handleFiltersChange = (next: TableFilter[]) => {
    setFilters(next)
    setPage(1)
  }

  const handlePaginationChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage)
    setPageSize(nextPageSize)
  }

  const handleSortingChange = (next: Array<{ id: string; desc: boolean }>) => {
    setSorting(next)
    setPage(1)
  }

  const resetList = () => {
    setFilters([])
    setSorting([{ id: 'codigo', desc: false }])
    setPage(1)
  }

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline' as const,
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: resetList,
      variant: 'outline' as const,
    },
  ]

  return (
    <>
      <PageHead title='Zonas Fiscais | Zonas | Faturação | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Zonas Fiscais' onRefresh={resetList}>
          <ListagemZonasFiscaisTable
            data={rows}
            pageCount={pageCount}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={toolbarActions}
            onOpenView={(row) => {
              if (!canView) return
              setViewData(row)
              setModalOpen(true)
            }}
            canView={canView}
          />

          <ZonaFiscalViewModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            viewData={viewData}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
