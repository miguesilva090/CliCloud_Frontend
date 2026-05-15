import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Archive, List, Plus, RotateCw, Wrench } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  usePageData,
} from '@/utils/page-data-utils'
import { useEntityListPermissionsFromMany } from '@/hooks/use-area-comum-entity-list-permissions'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import type { LoteDirectTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'
import { ListagemLoteDirectTable } from '../components/listagem-lote-direct-table'
import { LoteDirectViewModal } from '../modals/lote-direct-view-modal'
import { LoteDirectFormModal } from '../modals/lote-direct-form-modal'
import { CorrigirLotesModal } from '../modals/corrigir-lotes-modal'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openLoteDirectCreationInApp } from '@/utils/window-utils'
import {
  useGetLoteDirectPaginated,
  usePrefetchAdjacentLoteDirect,
  loteDirectPermissionIds,
  useLoteDirectFuncionalidadeId,
} from '../queries/listagem-lote-direct-queries'

export function ListagemLoteDirectPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const permId = useLoteDirectFuncionalidadeId()
  const { canView, canAdd, canChange, canDelete } = useEntityListPermissionsFromMany([
    ...loteDirectPermissionIds,
  ])
  const queryClient = useQueryClient()
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create')
  const [corrigirLotesOpen, setCorrigirLotesOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<LoteDirectTableDTO | null>(null)
  const [historicoAtivo, setHistoricoAtivo] = useState(false)

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
    useGetDataPaginated: useGetLoteDirectPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentLoteDirect,
  })

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['lote-direct-paginated'] })

  const toggleHistorico = () => {
    setHistoricoAtivo((prev) => {
      const next = !prev
      applyFiltersIfChanged(
        filters,
        buildFiltersWithValue(filters, 'historico', next ? 'true' : 'false'),
        handleFiltersChange
      )
      return next
    })
  }

  return (
    <>
      <PageHead title='Lançamento de Credenciais | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Lançamento de Credenciais'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar credenciais</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar a lista de credenciais.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemLoteDirectTable
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
            toolbarActions={[
              ...(!historicoAtivo && canView
                ? [
                    {
                      label: 'Corrigir Lotes',
                      icon: <Wrench className='h-4 w-4' />,
                      onClick: () => setCorrigirLotesOpen(true),
                      variant: 'outline' as const,
                      className:
                        'border-amber-400 bg-amber-300 text-amber-950 hover:bg-amber-200',
                    },
                  ]
                : []),
              ...(!historicoAtivo && canAdd
                ? [
                    {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                        openLoteDirectCreationInApp(navigate, addWindow)
                      },
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
              {
                label: 'Listagens',
                icon: <List className='h-4 w-4' />,
                onClick: () => {},
                variant: 'outline' as const,
              },
              {
                label: historicoAtivo ? 'Histórico x' : 'Histórico',
                icon: <Archive className='h-4 w-4' />,
                onClick: toggleHistorico,
                variant: historicoAtivo ? ('emerald' as const) : ('outline' as const),
              },
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline' as const,
              },
            ]}
            onOpenView={(row: LoteDirectTableDTO) => {
              setSelectedId(row.id)
              setViewModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row: LoteDirectTableDTO) => {
                    setFormModalMode('edit')
                    setSelectedRow(row)
                    setSelectedId(row.id)
                    setFormModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={
              canDelete
                ? async (row) => {
                    if (!row?.id) return
                    const response = await LoteDirectService(permId).delete(row.id)
                    if (response.info.status === ResponseStatus.Success) {
                      toast.success('Registo eliminado.')
                      refresh()
                    }
                  }
                : undefined
            }
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />

          <LoteDirectViewModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            loteId={selectedId}
          />
          <LoteDirectFormModal
            open={formModalOpen}
            onOpenChange={setFormModalOpen}
            mode={formModalMode}
            loteId={selectedId}
            viewData={selectedRow}
            onSuccess={refresh}
          />
          <CorrigirLotesModal
            open={corrigirLotesOpen}
            onOpenChange={setCorrigirLotesOpen}
            onSuccess={refresh}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}