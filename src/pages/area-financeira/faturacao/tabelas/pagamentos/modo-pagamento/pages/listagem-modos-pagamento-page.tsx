import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { ModoPagamentoTableDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
import { ListagemModosPagamentoTable } from '../components/listagem-modos-pagamento-table'
import { ListagemModosPagamentoFilterControls } from '../components/listagem-modos-pagamento-filter-controls'
import {
  useGetModosPagamentoPaginated,
  usePrefetchAdjacentModosPagamento,
} from '../queries/listagem-modos-pagamento-queries'
import { ModoPagamentoViewCreateModal } from '../modals/modo-pagamento-view-create-modal'
import { ModoPagamentoService } from '@/lib/services/pagamentos/modo-pagamento-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

type ModoPagamentoModalMode = 'view' | 'create' | 'edit'

export function ListagemModosPagamentoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tabelasPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModoPagamentoModalMode>('view')
  const [viewData, setViewData] = useState<ModoPagamentoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ModoPagamentoTableDTO | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [mostrarHistorico, setMostrarHistorico] = useState(false)

  const filtrarHistorico = mostrarHistorico ? true : false

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
    useGetDataPaginated: (p, ps, f, s) =>
      useGetModosPagamentoPaginated(p, ps, f, s, filtrarHistorico),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentModosPagamento(p, ps, f, filtrarHistorico),
  })

  const modos = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidateListas = () => {
    void queryClient.invalidateQueries({ queryKey: ['modos-pagamento-paginated'] })
    void queryClient.invalidateQueries({ queryKey: ['modos-pagamento-light'] })
  }

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () => {
              setViewData(null)
              setModalMode('create')
              setModalOpen(true)
            },
            variant: 'destructive' as const,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
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
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        invalidateListas()
      },
      variant: 'outline' as const,
    },
  ]

  const handleOpenDelete = (row: ModoPagamentoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await ModoPagamentoService().deleteModoPagamento(
        itemToDelete.id,
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Modo de pagamento eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar o modo de pagamento.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar o modo de pagamento.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePassarHistorico = async (row: ModoPagamentoTableDTO) => {
    if (!row.id || !canChange) return
    try {
      const response = await ModoPagamentoService().passarHistoricoModoPagamento(
        row.id,
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Modo de pagamento passado a histórico.')
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao passar modo a histórico.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao passar modo a histórico.')
    }
  }

  const handleRetirarHistorico = async (row: ModoPagamentoTableDTO) => {
    if (!row.id || !canChange) return
    try {
      const response =
        await ModoPagamentoService().retirarHistoricoModoPagamento(row.id)
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Modo de pagamento retirado do histórico.')
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao retirar modo do histórico.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao retirar modo do histórico.')
    }
  }

  return (
    <>
      <PageHead title='Modos de Pagamento | Pagamentos | Faturação | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Modos de Pagamento'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            invalidateListas()
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar modos de pagamento</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao pedir a lista de modos de pagamento.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemModosPagamentoTable
            data={modos}
            isLoading={isLoading}
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
            globalSearchColumnId='descricao'
            globalSearchPlaceholder='Procurar por descrição...'
            FilterControls={ListagemModosPagamentoFilterControls}
            mostrarHistorico={mostrarHistorico}
            onMostrarHistoricoChange={setMostrarHistorico}
            onOpenView={(row) => {
              if (!canView) return
              setViewData(row)
              setModalMode('view')
              setModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    setViewData(row)
                    setModalMode('edit')
                    setModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={canDelete ? handleOpenDelete : undefined}
            onPassarHistorico={canChange ? handlePassarHistorico : undefined}
            onRetirarHistorico={canChange ? handleRetirarHistorico : undefined}
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />

          <ModoPagamentoViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            onSuccess={invalidateListas}
          />

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              if (!isDeleting) {
                setDeleteDialogOpen(open)
                if (!open) setItemToDelete(null)
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar modo de pagamento</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar &quot;
                  {itemToDelete?.descricao ?? itemToDelete?.codigo ?? ''}
                  &quot;? Esta ação não pode ser revertida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    void handleConfirmDelete()
                  }}
                  disabled={isDeleting}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  {isDeleting ? 'A eliminar...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
