import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, SlidersHorizontal } from 'lucide-react'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { DataTable, type DataTableAction } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { HistoricoConsultaAdministrativoRowDTO } from '@/types/dtos/consultas/historico-consulta-administrativo.dtos'
import type { HistoricoConsultaAdministrativoVista } from '@/lib/services/consultas/historico-consultas-administrativo-service/historico-consultas-administrativo-client'
import { useGetHistoricoConsultasAdministrativoPaginated } from '../queries/historico-consultas-administrativo-queries'
import {
  HistoricoConsultasAdministrativoFiltroModal,
  buildHistoricoAdmApiFilters,
  emptyHistoricoAdmCriteria,
  historicoAdmListQueryEnabled,
  type HistoricoAdmCriteria,
} from '../components/historico-consultas-administrativo-filtro-modal'

const VALID_VISTAS = new Set<HistoricoConsultaAdministrativoVista>([
  'datas',
  'utentes',
  'medicos',
  'organismos',
])

function isValidVista(v: string | undefined): v is HistoricoConsultaAdministrativoVista {
  return !!v && VALID_VISTAS.has(v as HistoricoConsultaAdministrativoVista)
}

const TITLES: Record<HistoricoConsultaAdministrativoVista, string> = {
  datas: 'Histórico — Por datas',
  utentes: 'Histórico — Por utente',
  medicos: 'Histórico — Médicos',
  organismos: 'Histórico — Organismos',
}

function historicoAdmAutoDismissKey(vista: string): string {
  const instanceId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('instanceId') || 'default'
      : 'default'
  return `historico-adm-auto-dismissed:${vista}:${instanceId}`
}

function isHistoricoAdmAutoDismissed(vista: string): boolean {
  try {
    return sessionStorage.getItem(historicoAdmAutoDismissKey(vista)) === '1'
  } catch {
    return false
  }
}

function setHistoricoAdmAutoDismissed(vista: string, dismissed: boolean): void {
  try {
    const key = historicoAdmAutoDismissKey(vista)
    if (dismissed) {
      sessionStorage.setItem(key, '1')
    } else {
      sessionStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}

function HistoricoConsultasFilterControls(_: {
  table: unknown
  columns: unknown[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

function formatRangePt(a: Date | null, b: Date | null): string {
  if (a && b) {
    return `${format(a, 'dd/MM/yyyy', { locale: pt })} — ${format(b, 'dd/MM/yyyy', { locale: pt })}`
  }
  if (a) {
    return `desde ${format(a, 'dd/MM/yyyy', { locale: pt })}`
  }
  if (b) {
    return `até ${format(b, 'dd/MM/yyyy', { locale: pt })}`
  }
  return 'todas as datas'
}

function criteriaSummary(
  vista: HistoricoConsultaAdministrativoVista,
  c: HistoricoAdmCriteria
): string {
  if (vista === 'datas') {
    return formatRangePt(c.dataDe, c.dataAte)
  }
  if (vista === 'utentes') {
    const r = formatRangePt(c.dataDe, c.dataAte)
    const u = c.utenteLabel.trim() || '—'
    return `${u} · ${r}`
  }
  if (vista === 'medicos') {
    const r = formatRangePt(c.dataDe, c.dataAte)
    const m = c.medicoLabel.trim() || '—'
    return `${m} · ${r}`
  }
  if (vista === 'organismos') {
    const r = formatRangePt(c.dataDe, c.dataAte)
    const o = c.organismoLabel.trim() || '—'
    return `${o} · ${r}`
  }
  return ''
}

const columns: Array<
  ColumnDef<HistoricoConsultaAdministrativoRowDTO> &
    DataTableColumnDef<HistoricoConsultaAdministrativoRowDTO>
> = [
  {
    accessorKey: 'data',
    id: 'data',
    header: 'Data',
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.data ? format(new Date(row.original.data), 'dd/MM/yyyy') : '—',
    meta: { align: 'left' as const, width: 'w-[110px]' },
  },
  {
    accessorKey: 'horaInic',
    id: 'horaInic',
    header: 'Hora',
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.horaInic ?? '—',
    meta: { align: 'left' as const, width: 'w-[90px]' },
  },
  {
    accessorKey: 'utenteNumero',
    id: 'utenteNumero',
    header: 'Nº Utente',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.utenteNumero?.trim() || '—',
    meta: { align: 'left' as const, width: 'w-[120px]' },
  },
  {
    accessorKey: 'utenteNome',
    id: 'utenteNome',
    header: 'Utente',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.utenteNome ?? '—',
    meta: { align: 'left' as const, width: 'w-[200px]' },
  },
  {
    accessorKey: 'medicoNome',
    id: 'medicoNome',
    header: 'Médico',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.medicoNome ?? '—',
    meta: { align: 'left' as const, width: 'w-[180px]' },
  },
  {
    accessorKey: 'organismoNome',
    id: 'organismoNome',
    header: 'Organismo',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.organismoNome ?? '—',
    meta: { align: 'left' as const, width: 'w-[200px]' },
  },
  {
    accessorKey: 'especialidadeDesignacao',
    id: 'especialidadeDesignacao',
    header: 'Especialidade',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.especialidadeDesignacao ?? '—',
    meta: { align: 'left' as const, width: 'w-[160px]' },
  },
  {
    accessorKey: 'statusConsultaLabel',
    id: 'statusConsultaLabel',
    header: 'Estado',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.statusConsultaLabel ?? '—',
    meta: { align: 'left' as const, width: 'w-[140px]' },
  },
  {
    accessorKey: 'pago',
    id: 'pago',
    header: 'Pago',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.pago === true ? 'Sim' : row.original.pago === false ? 'Não' : '—',
    meta: { align: 'center' as const, width: 'w-[72px]' },
  },
  {
    accessorKey: 'faturado',
    id: 'faturado',
    header: 'Faturado',
    enableSorting: false,
    cell: ({ row }: CellContext<HistoricoConsultaAdministrativoRowDTO, unknown>) =>
      row.original.faturado === true ? 'Sim' : row.original.faturado === false ? 'Não' : '—',
    meta: { align: 'center' as const, width: 'w-[88px]' },
  },
]

export function ListagemHistoricoConsultasAdministrativoPage() {
  const { vista: vistaParam } = useParams<{ vista: string }>()
  const location = useLocation()
  const queryClient = useQueryClient()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const urlVista = vistaParam ?? ''
  const vistaValid = isValidVista(urlVista)
  const vista: HistoricoConsultaAdministrativoVista = vistaValid ? urlVista : 'datas'

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const [criteria, setCriteria] = useState<HistoricoAdmCriteria>(() => emptyHistoricoAdmCriteria())
  const [filtroModalOpen, setFiltroModalOpen] = useState(false)
  const autoPromptedRef = useRef(false)
  const userDismissedAutoModalRef = useRef(false)

  const filters = useMemo(() => buildHistoricoAdmApiFilters(vista, criteria), [vista, criteria])

  const listEnabled = vistaValid && historicoAdmListQueryEnabled(vista, criteria)

  const { data, isLoading, isError, error } = useGetHistoricoConsultasAdministrativoPaginated(
    vista,
    page,
    pageSize,
    filters,
    sorting,
    listEnabled
  )

  useEffect(() => {
    setPage(1)
  }, [vista, criteria, sorting])

  useEffect(() => {
    setCriteria(emptyHistoricoAdmCriteria())
    setFiltroModalOpen(false)
    userDismissedAutoModalRef.current = false
    autoPromptedRef.current = false
  }, [urlVista])

  useEffect(() => {
    if (
      !vistaValid ||
      autoPromptedRef.current ||
      userDismissedAutoModalRef.current ||
      isHistoricoAdmAutoDismissed(urlVista)
    ) {
      return
    }
    if (!historicoAdmListQueryEnabled(vista, criteria)) {
      setFiltroModalOpen(true)
      autoPromptedRef.current = true
    }
  }, [vistaValid, vista, urlVista])

  const handleFiltroModalOpenChange = (open: boolean) => {
    setFiltroModalOpen(open)
    if (!open && !historicoAdmListQueryEnabled(vista, criteria)) {
      userDismissedAutoModalRef.current = true
      setHistoricoAdmAutoDismissed(urlVista, true)
    }
  }

  const handleCriteriaApply = useCallback(
    (next: HistoricoAdmCriteria) => {
      setCriteria(next)
      userDismissedAutoModalRef.current = false
      setHistoricoAdmAutoDismissed(urlVista, false)
    },
    [urlVista]
  )

  const handleBack = () => {
    setFiltroModalOpen(false)
    closeLikeTabBar()
  }

  const rows = (data?.info?.data ?? []) as HistoricoConsultaAdministrativoRowDTO[]
  const pageCount = Math.max(1, data?.info?.totalPages ?? 1)
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['historico-consultas-administrativo-paginated'] })
  }, [queryClient])

  const summary = useMemo(() => criteriaSummary(vista, criteria), [vista, criteria])

  const toolbarActions: DataTableAction[] = useMemo(
    () => [
      {
        label: 'Critérios',
        icon: <SlidersHorizontal className='h-4 w-4' />,
        onClick: () => setFiltroModalOpen(true),
        variant: 'outline',
      },
      {
        label: 'Atualizar',
        icon: <RefreshCw className='h-4 w-4' />,
        onClick: refresh,
        variant: 'outline',
      },
    ],
    [refresh]
  )

  const toolbarEndPrefix = (
    <div className='text-muted-foreground flex max-w-xl flex-wrap items-center gap-2 text-sm'>
      <span className='font-medium text-foreground'>Seleção:</span>
      <span>{summary}</span>
      {!listEnabled ? (
        <Button type='button' size='sm' variant='secondary' onClick={() => setFiltroModalOpen(true)}>
          Definir critérios
        </Button>
      ) : null}
    </div>
  )

  if (!vistaValid) {
    return <Navigate to='/area-administrativa/consultas/historico/datas' replace />
  }

  const browserPath =
    typeof window !== 'undefined' ? window.location.pathname : location.pathname
  const browserSearch =
    typeof window !== 'undefined' ? window.location.search : location.search

  if (
    browserPath !== location.pathname &&
    !browserPath.includes('/consultas/historico/')
  ) {
    return <Navigate to={`${browserPath}${browserSearch}`} replace />
  }

  return (
    <>
      <PageHead title={`${TITLES[vista]} | Área Administrativa | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={TITLES[vista]} onBack={handleBack}>
          <HistoricoConsultasAdministrativoFiltroModal
            open={filtroModalOpen}
            onOpenChange={handleFiltroModalOpenChange}
            vista={vista}
            criteria={criteria}
            onApply={handleCriteriaApply}
          />
          {!listEnabled ? (
            <Alert className='mb-4'>
              <AlertTitle>Critérios em falta</AlertTitle>
              <AlertDescription>
                {vista === 'datas'
                  ? 'Indique o intervalo de datas em «Critérios» (ou aguarde o diálogo automático) para carregar a listagem.'
                  : vista === 'utentes'
                    ? 'Indique o intervalo de datas e o utente em «Critérios» para carregar o histórico.'
                    : vista === 'medicos'
                      ? 'Indique o intervalo de datas e o médico em «Critérios» para carregar o histórico.'
                      : vista === 'organismos'
                        ? 'Indique o intervalo de datas e o organismo em «Critérios» para carregar o histórico.'
                        : null}
              </AlertDescription>
            </Alert>
          ) : null}
          {isError ? (
            <div className='border-destructive/50 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm'>
              {errorMessage || 'Erro ao carregar o histórico de consultas.'}
            </div>
          ) : null}
          <DataTable
            columns={columns}
            data={listEnabled ? rows : []}
            pageCount={listEnabled ? pageCount : 1}
            totalRows={listEnabled ? totalRows : 0}
            onPaginationChange={(newPage, newPageSize) => {
              setPage(newPage)
              setPageSize(newPageSize)
            }}
            onFiltersChange={() => {}}
            onSortingChange={(newSorting) => {
              setSorting(newSorting)
              setPage(1)
            }}
            FilterControls={HistoricoConsultasFilterControls}
            initialPage={page}
            initialPageSize={pageSize}
            initialSorting={sorting}
            initialFilters={[]}
            isLoading={listEnabled && isLoading}
            hideToolbarFilters
            toolbarEndPrefix={toolbarEndPrefix}
            toolbarActions={toolbarActions}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
