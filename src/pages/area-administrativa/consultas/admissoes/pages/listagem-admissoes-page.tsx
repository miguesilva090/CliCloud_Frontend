import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Archive, Plus, RotateCw } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePageData } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import {
  ModoListagemAdmissao,
  type AdmissaoTableDTO,
} from '@/types/dtos/consultas/admissao.dtos'
import { ListagemAdmissoesTable } from '../components/listagem-admissoes-table'
import { AdmissaoViewEditModal } from '../modals/admissao-view-edit-modal'
import { AdmissaoObservacoesModal } from '../modals/admissao-observacoes-modal'
import { AdmissaoDesmarcarModal } from '../modals/admissao-desmarcar-modal'
import {
  invalidateAdmissoesListQueries,
  useGetAdmissoesPaginated,
  usePrefetchAdjacentAdmissoes,
  useRefetchAdmissoesOnListTabActive,
} from '../queries/listagem-admissoes-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openAdmissaoCreationInApp } from '@/utils/window-utils'
import { AdmissoesListaAcoesMenu } from '../components/admissoes-lista-acoes-menu'

const listPermId = modules.areaAdministrativa.permissions.admissoes.id

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function useGetAdmissoesDiaPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  return useGetAdmissoesPaginated(
    ModoListagemAdmissao.Dia,
    pageNumber,
    pageSize,
    filters,
    sorting
  )
}

function usePrefetchAdmissoesDia(page: number, pageSize: number, filters: Filters) {
  return usePrefetchAdjacentAdmissoes(ModoListagemAdmissao.Dia, page, pageSize, filters)
}

function useGetAdmissoesPendentesPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  return useGetAdmissoesPaginated(
    ModoListagemAdmissao.Pendentes,
    pageNumber,
    pageSize,
    filters,
    sorting
  )
}

function usePrefetchAdmissoesPendentes(
  page: number,
  pageSize: number,
  filters: Filters
) {
  return usePrefetchAdjacentAdmissoes(
    ModoListagemAdmissao.Pendentes,
    page,
    pageSize,
    filters
  )
}

function ListagemAdmissoesPageInner({
  title,
  useGetDataPaginated,
  usePrefetchAdjacentData,
}: {
  title: string
  useGetDataPaginated: typeof useGetAdmissoesDiaPaginated
  usePrefetchAdjacentData: typeof usePrefetchAdmissoesDia
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canChange, canDelete, canAdd } =
    useAreaComumEntityListPermissions(listPermId)
  const queryClient = useQueryClient()
  useRefetchAdmissoesOnListTabActive()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [selectedRow, setSelectedRow] = useState<AdmissaoTableDTO | null>(null)
  const [obsModalOpen, setObsModalOpen] = useState(false)
  const [obsRow, setObsRow] = useState<AdmissaoTableDTO | null>(null)
  const [desmarcarModalOpen, setDesmarcarModalOpen] = useState(false)
  const [desmarcarRow, setDesmarcarRow] = useState<AdmissaoTableDTO | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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
    useGetDataPaginated,
    usePrefetchAdjacentData,
  })

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => {
    invalidateAdmissoesListQueries(queryClient)
    setSelectedIds([])
  }

  const svc = () => AdmissaoAdministrativoService(listPermId)

  const gridToggles = {
    canChange: Boolean(canChange),
    onTogglePresente: (row: AdmissaoTableDTO, value: boolean) =>
      void runAction(
        () => svc().confirmar(row.id, value),
        value ? 'Presente confirmado.' : 'Presente desmarcado.'
      ),
    onToggleConfirmaConsulta: (row: AdmissaoTableDTO, value: boolean) =>
      void runAction(
        () => svc().setConfirmaConsulta(row.id, value),
        value ? 'Confirmação marcada.' : 'Confirmação desmarcada.'
      ),
    onToggleEmTratamento: (row: AdmissaoTableDTO, value: boolean) =>
      void runAction(
        () => svc().setEmTratamento(row.id, value),
        value ? 'Em tratamento.' : 'Tratamento desmarcado.'
      ),
  }

  const runAction = async (fn: () => Promise<unknown>, success: string) => {
    try {
      const res = (await fn()) as { info?: { status?: ResponseStatus } }
      if (res.info?.status === ResponseStatus.Success) {
        toast.success(success)
        refresh()
      } else {
        const msg =
          (res.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          (res.info as { messages?: string[] })?.messages?.[0]
        toast.error(msg ?? 'Operação falhou.')
      }
    } catch {
      toast.error('Operação falhou.')
    }
  }

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={title}>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar admissões</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar a lista.'}
              </AlertDescription>
            </Alert>
          ) : null}
          <ListagemAdmissoesTable
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
            onOpenView={(row) => {
              setSelectedRow(row)
              setModalMode('view')
              setModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    setSelectedRow(row)
                    setModalMode('edit')
                    setModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={
              canDelete
                ? (row) => {
                    setDesmarcarRow(row)
                    setDesmarcarModalOpen(true)
                  }
                : undefined
            }
            gridToggles={gridToggles}
            selectedRows={selectedIds}
            onRowSelectionChange={setSelectedIds}
            renderExtraActions={(row) =>
              canView ? (
                <AdmissoesListaAcoesMenu
                  row={row}
                  listPermId={listPermId}
                  runAction={runAction}
                  onPromoted={refresh}
                  canChange={canChange}
                  onOpenObservacoes={(r) => {
                    setObsRow(r)
                    setObsModalOpen(true)
                  }}
                />
              ) : null
            }
            toolbarActions={[
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
              },
              ...(canChange && selectedIds.length > 0
                ? [
                    {
                      label: `Passar para histórico (${selectedIds.length})`,
                      icon: <Archive className='h-4 w-4' />,
                      onClick: () => {
                        void runAction(
                          () => svc().promoverLote({ ids: selectedIds }),
                          'Admissões passadas para histórico.'
                        )
                      },
                    },
                  ]
                : []),
              ...(canAdd
                ? [
                    {
                      label: 'Nova admissão',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                        openAdmissaoCreationInApp(navigate, addWindow)
                      },
                    },
                  ]
                : []),
            ]}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
      <AdmissaoViewEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        row={selectedRow}
        onSaved={refresh}
      />
      <AdmissaoObservacoesModal
        open={obsModalOpen}
        onOpenChange={setObsModalOpen}
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
        open={desmarcarModalOpen}
        onOpenChange={setDesmarcarModalOpen}
        row={desmarcarRow}
        listPermId={listPermId}
        onDesmarcada={refresh}
      />
    </>
  )
}

export function ListagemAdmissoesDiaPage() {
  return (
    <ListagemAdmissoesPageInner
      title='Admissões'
      useGetDataPaginated={useGetAdmissoesDiaPaginated}
      usePrefetchAdjacentData={usePrefetchAdmissoesDia}
    />
  )
}

export function ListagemAdmissoesPendentesPage() {
  return (
    <ListagemAdmissoesPageInner
      title='Admissões Pendentes'
      useGetDataPaginated={useGetAdmissoesPendentesPaginated}
      usePrefetchAdjacentData={usePrefetchAdmissoesPendentes}
    />
  )
}
