import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Eraser, Plus, RotateCw } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  usePageData,
} from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import type { OrdemEntradaTableDTO } from '@/types/dtos/consultas/ordem-entrada.dtos'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { ListagemOrdemEntradaTable } from '../components/listagem-ordem-entrada-table'
import { OrdemEntradaDefinirOrdemModal } from '../modals/ordem-entrada-definir-ordem-modal'
import { OrdemEntradaAnularModal } from '../modals/ordem-entrada-anular-modal'
import { AdmissaoViewEditModal } from '../../admissoes/modals/admissao-view-edit-modal'
import { AdmissaoObservacoesModal } from '../../admissoes/modals/admissao-observacoes-modal'
import { AdmissaoDesmarcarModal } from '../../admissoes/modals/admissao-desmarcar-modal'
import { ordemEntradaToAdmissaoTable } from '../utils/ordem-entrada-admissao-map'
import {
  ORDEM_ENTRADA_PAGINATED_QUERY_KEY,
  useGetOrdemEntradaPaginated,
  usePrefetchAdjacentOrdemEntrada,
} from '../queries/listagem-ordem-entrada-queries'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'

const listPermId = modules.areaAdministrativa.permissions.consultas.id
const dataRef = getDataTrabalhoIsoDate()

type AdmissaoModalMode = 'view' | 'edit' | 'create'

export function ListagemOrdemEntradaPage() {
  const navigate = useNavigate()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const { canView, canChange, canDelete, canAdd } =
    useAreaComumEntityListPermissions(listPermId)
  const queryClient = useQueryClient()
  const [definirOpen, setDefinirOpen] = useState(false)
  const [anularOpen, setAnularOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<OrdemEntradaTableDTO | null>(null)
  const [admissaoModalOpen, setAdmissaoModalOpen] = useState(false)
  const [admissaoModalMode, setAdmissaoModalMode] = useState<AdmissaoModalMode>('view')
  const [admissaoRow, setAdmissaoRow] = useState<AdmissaoTableDTO | null>(null)
  const [obsOpen, setObsOpen] = useState(false)
  const [obsRow, setObsRow] = useState<OrdemEntradaTableDTO | null>(null)
  const [desmarcarOpen, setDesmarcarOpen] = useState(false)
  const [desmarcarRow, setDesmarcarRow] = useState<OrdemEntradaTableDTO | null>(null)

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetOrdemEntradaPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentOrdemEntrada,
    defaultFilters: [
      { id: 'dataDe', value: dataRef },
      { id: 'dataAte', value: dataRef },
    ],
  })

  const consultasDesmarcadas =
    filters?.some((f) => f.id === 'incluirHistorico' && f.value === '1') ?? false

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: ORDEM_ENTRADA_PAGINATED_QUERY_KEY })

  const runAction = async (fn: () => Promise<unknown>, success: string) => {
    try {
      const res = (await fn()) as {
        info?: { status?: ResponseStatus; messages?: Record<string, string[]> }
      }
      if (res.info?.status === ResponseStatus.Success) {
        toast.success(success)
        refresh()
      } else {
        toast.error(res.info?.messages?.['$']?.[0] ?? 'Operação falhou.')
      }
    } catch {
      toast.error('Operação falhou.')
    }
  }

  const openAdmissao = (row: OrdemEntradaTableDTO, mode: 'view' | 'edit') => {
    setAdmissaoRow(ordemEntradaToAdmissaoTable(row))
    setAdmissaoModalMode(mode)
    setAdmissaoModalOpen(true)
  }

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const dataLabel = getDataTrabalhoIsoDate()

  return (
    <>
      <PageHead title='Entrada de Marcações | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={`Entrada de Marcações (${dataLabel})`}
          onBack={() => {
            closeLikeTabBar()
            navigate('/area-administrativa/consultas/marcacoes')
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar ordem de entrada</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar os dados.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemOrdemEntradaTable
            data={data?.info?.data ?? []}
            isLoading={isLoading}
            pageCount={data?.info?.totalPages ?? 0}
            totalRows={data?.info?.totalCount ?? 0}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
            consultasDesmarcadas={consultasDesmarcadas}
            onDefinirOrdem={(row) => {
              setSelectedRow(row)
              setDefinirOpen(true)
            }}
            onAnularOrdem={(row) => {
              setSelectedRow(row)
              setAnularOpen(true)
            }}
            onTogglePresente={(row, value) =>
              void runAction(
                () => AdmissaoAdministrativoService(listPermId).confirmar(row.id, value),
                value ? 'Presença confirmada.' : 'Presença desmarcada.'
              )
            }
            onOpenView={(row) => openAdmissao(row, 'view')}
            onOpenEdit={canChange ? (row) => openAdmissao(row, 'edit') : undefined}
            onOpenDelete={
              canDelete
                ? (row) => {
                    setDesmarcarRow(row)
                    setDesmarcarOpen(true)
                  }
                : undefined
            }
            onOpenObservacoes={(row) => {
              setObsRow(row)
              setObsOpen(true)
            }}
            toolbarActions={[
              {
                label: consultasDesmarcadas
                  ? 'Consultas desmarcadas ✓'
                  : 'Consultas desmarcadas',
                icon: <Eraser className='h-4 w-4' />,
                onClick: () => {
                  applyFiltersIfChanged(
                    filters,
                    buildFiltersWithValue(
                      filters,
                      'incluirHistorico',
                      consultasDesmarcadas ? '0' : '1'
                    ),
                    handleFiltersChange
                  )
                },
                variant: consultasDesmarcadas ? ('emerald' as const) : ('outline' as const),
              },
              ...(canAdd
                ? [
                    {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                        setAdmissaoRow(null)
                        setAdmissaoModalMode('create')
                        setAdmissaoModalOpen(true)
                      },
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline' as const,
              },
            ]}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <OrdemEntradaDefinirOrdemModal
        open={definirOpen}
        onOpenChange={setDefinirOpen}
        row={selectedRow}
        listPermId={listPermId}
        onSaved={refresh}
      />

      <OrdemEntradaAnularModal
        open={anularOpen}
        onOpenChange={setAnularOpen}
        row={selectedRow}
        listPermId={listPermId}
        onSaved={refresh}
      />

      <AdmissaoViewEditModal
        open={admissaoModalOpen}
        onOpenChange={setAdmissaoModalOpen}
        mode={admissaoModalMode}
        row={admissaoRow}
        onSaved={refresh}
      />

      <AdmissaoObservacoesModal
        open={obsOpen}
        onOpenChange={setObsOpen}
        admissaoId={obsRow?.id ?? null}
        utenteLabel={
          obsRow
            ? [obsRow.utenteNumero, obsRow.utenteNome].filter(Boolean).join(' — ')
            : undefined
        }
        listPermId={listPermId}
        readOnly={!canChange}
        onSaved={refresh}
      />

      <AdmissaoDesmarcarModal
        open={desmarcarOpen}
        onOpenChange={setDesmarcarOpen}
        row={desmarcarRow ? ordemEntradaToAdmissaoTable(desmarcarRow) : null}
        listPermId={listPermId}
        onDesmarcada={refresh}
      />
    </>
  )
}
