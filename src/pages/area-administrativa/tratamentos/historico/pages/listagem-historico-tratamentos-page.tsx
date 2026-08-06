import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, SlidersHorizontal } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DataTable, type DataTableAction } from '@/components/shared/data-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { usePageData } from '@/utils/page-data-utils'
import type { HistoricoTratamentoModo } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import type { HistoricoTratamentoTableDTO } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import { buildHistoricoTratamentosColumns } from '../components/listagem-historico-tratamentos-table.columns'
import {
  HistoricoTratamentoFiltroModal,
  buildHistoricoTratApiFilters,
  emptyHistoricoTratCriteria,
  historicoTratListEnabled,
  type HistoricoTratCriteria,
} from '../modals/historico-tratamento-filtro-modal'
import {
  invalidateHistoricoTratamentosQueries,
  useGetHistoricoTratamentosPaginated,
  usePrefetchAdjacentHistoricoTratamentos,
} from '../queries/listagem-historico-tratamentos-queries'

const VALID = new Set<HistoricoTratamentoModo>([
  'datas',
  'utentes',
  'fisioterapeuta',
  'auxiliar',
  'outro',
  'organismo',
  'credencial',
])

function isValidModo(v: string | undefined): v is HistoricoTratamentoModo {
  return !!v && VALID.has(v as HistoricoTratamentoModo)
}

const TITLES: Record<HistoricoTratamentoModo, string> = {
  datas: 'Histórico — Por Datas',
  utentes: 'Histórico — Por Utente',
  fisioterapeuta: 'Histórico — Por Fisioterapeuta',
  auxiliar: 'Histórico — Por Auxiliar',
  outro: 'Histórico — Por Terap. Ocupacional',
  organismo: 'Histórico — Por Organismo',
  credencial: 'Histórico — Por Credencial',
}

const perm = modules.areaAdministrativa.permissions.consultas.id

function HistoricoFilterControls() {
  return null
}

export function ListagemHistoricoTratamentosPage() {
  const { modo: modoParam } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canView } = useAreaComumEntityListPermissions(perm)
  const vistaValid = isValidModo(modoParam)
  const modo: HistoricoTratamentoModo = vistaValid ? modoParam : 'datas'

  const [criteria, setCriteria] = useState<HistoricoTratCriteria>(
    emptyHistoricoTratCriteria
  )
  const [applied, setApplied] = useState(false)
  const [filtroOpen, setFiltroOpen] = useState(true)

  const enabled = applied && historicoTratListEnabled(modo, criteria)
  const apiFilters = useMemo(
    () => (enabled ? buildHistoricoTratApiFilters(criteria) : []),
    [enabled, criteria]
  )
  const ids = useMemo(
    () => ({
      utenteId: criteria.utenteId || null,
      fisioterapeutaId: criteria.fisioterapeutaId || null,
      auxiliarId: criteria.auxiliarId || null,
      outroTecnicoId: criteria.outroTecnicoId || null,
      organismoId: criteria.organismoId || null,
    }),
    [criteria]
  )

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    sorting,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: (p, ps, _f, s) =>
      useGetHistoricoTratamentosPaginated(
        modo,
        p,
        ps,
        apiFilters,
        s,
        ids,
        enabled
      ),
    usePrefetchAdjacentData: (p, ps) =>
      usePrefetchAdjacentHistoricoTratamentos(
        modo,
        p,
        ps,
        apiFilters,
        ids,
        enabled
      ),
  })

  useEffect(() => {
    setApplied(false)
    setCriteria(emptyHistoricoTratCriteria())
    setFiltroOpen(true)
  }, [modo])

  const rows = (data?.info?.data ?? []) as HistoricoTratamentoTableDTO[]
  const pageCount = Math.max(1, data?.info?.totalPages ?? 1)
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const columns = useMemo(
    () =>
      buildHistoricoTratamentosColumns(
        (row) =>
          navigate(`/area-administrativa/tratamentos/marcados/${row.id}`),
        { canView, canChange: false, canDelete: false }
      ),
    [navigate, canView]
  )

  const toolbarActions: DataTableAction[] = useMemo(
    () => [
      {
        label: 'Critérios',
        icon: <SlidersHorizontal className='h-4 w-4' />,
        onClick: () => setFiltroOpen(true),
        variant: 'outline',
      },
      {
        label: 'Atualizar',
        icon: <RefreshCw className='h-4 w-4' />,
        onClick: () => invalidateHistoricoTratamentosQueries(queryClient),
        variant: 'outline',
      },
    ],
    [queryClient]
  )

  const toolbarEndPrefix = (
    <div className='text-muted-foreground flex max-w-xl flex-wrap items-center gap-2 text-sm'>
      {!enabled ? (
        <Button
          type='button'
          size='sm'
          variant='secondary'
          onClick={() => setFiltroOpen(true)}
        >
          Definir critérios
        </Button>
      ) : null}
    </div>
  )

  if (!vistaValid) {
    return (
      <Navigate to='/area-administrativa/tratamentos/historico/datas' replace />
    )
  }

  if (!canView) {
    return (
      <DashboardPageContainer>
        <Alert variant='destructive'>
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>Não pode ver o histórico.</AlertDescription>
        </Alert>
      </DashboardPageContainer>
    )
  }

  return (
    <>
      <PageHead title={`${TITLES[modo]} | Tratamentos`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={TITLES[modo]}>
          {!enabled ? (
            <Alert className='mb-4'>
              <AlertTitle>Critérios em falta</AlertTitle>
              <AlertDescription>
                Defina os filtros em «Critérios» e clique em Pesquisar.
              </AlertDescription>
            </Alert>
          ) : null}
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Falha ao carregar.'}
              </AlertDescription>
            </Alert>
          ) : null}
          <DataTable
            columns={columns}
            data={enabled ? rows : []}
            pageCount={enabled ? pageCount : 1}
            totalRows={enabled ? totalRows : 0}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={() => {}}
            onSortingChange={handleSortingChange}
            FilterControls={HistoricoFilterControls}
            initialPage={page}
            initialPageSize={pageSize}
            initialSorting={sorting}
            initialFilters={[]}
            isLoading={enabled && isLoading}
            hideToolbarFilters
            toolbarEndPrefix={toolbarEndPrefix}
            toolbarActions={toolbarActions}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <HistoricoTratamentoFiltroModal
        open={filtroOpen}
        onOpenChange={setFiltroOpen}
        modo={modo}
        criteria={criteria}
        onApply={(next) => {
          setCriteria(next)
          setApplied(true)
        }}
      />
    </>
  )
}
