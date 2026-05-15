import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Plus, RotateCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  useGetAdmissoesPaginated,
  usePrefetchAdjacentAdmissoes,
} from '../queries/listagem-admissoes-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openAdmissaoCreationInApp } from '@/utils/window-utils'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [selectedRow, setSelectedRow] = useState<AdmissaoTableDTO | null>(null)

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

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['admissoes-paginated'] })

  const runAction = async (fn: () => Promise<unknown>, success: string) => {
    try {
      const res = (await fn()) as { info?: { status?: ResponseStatus } }
      if (res.info?.status === ResponseStatus.Success) {
        toast.success(success)
        refresh()
      } else {
        toast.error('Operação falhou.')
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
                    void runAction(
                      () => AdmissaoAdministrativoService(listPermId).delete(row.id),
                      'Admissão eliminada.'
                    )
                  }
                : undefined
            }
            renderExtraActions={(row) =>
              canChange ? (
                <AdmissaoRowExtraActions row={row} runAction={runAction} listPermId={listPermId} />
              ) : null
            }
            toolbarActions={[
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
              },
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
    </>
  )
}

function AdmissaoRowExtraActions({
  row,
  runAction,
  listPermId,
}: {
  row: AdmissaoTableDTO
  runAction: (fn: () => Promise<unknown>, success: string) => Promise<void>
  listPermId: string
}) {
  return (
    <div className='flex gap-1'>
      <Button
        type='button'
        size='icon'
        variant='ghost'
        title={row.confirmado ? 'Desconfirmar' : 'Confirmar'}
        onClick={() =>
          void runAction(
            () =>
              AdmissaoAdministrativoService(listPermId).confirmar(row.id, !row.confirmado),
            row.confirmado ? 'Desconfirmada.' : 'Confirmada.'
          )
        }
      >
        <Check className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        size='icon'
        variant='ghost'
        title={row.efetuado ? 'Marcar não efetuado' : 'Marcar efetuado'}
        onClick={() =>
          void runAction(
            () =>
              AdmissaoAdministrativoService(listPermId).setEfetuado(row.id, !row.efetuado),
            'Estado de efetuado atualizado.'
          )
        }
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
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
