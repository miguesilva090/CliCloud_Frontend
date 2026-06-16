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
import type { CondicaoPagamentoTableDTO } from '@/types/dtos/pagamentos/condicao-pagamento.dtos'
import { ListagemCondicoesPagamentoTable } from '../components/listagem-condicoes-pagamento-table'
import { ListagemCondicoesPagamentoFilterControls } from '../components/listagem-condicoes-pagamento-filter-controls'
import {
  useGetCondicoesPagamentoPaginated,
  usePrefetchAdjacentCondicoesPagamento,
} from '../queries/listagem-condicoes-pagamento-queries'
import { CondicaoPagamentoViewCreateModal } from '../modals/condicao-pagamento-view-create-modal'
import { CondicaoPagamentoService } from '@/lib/services/pagamentos/condicao-pagamento-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

type CondicaoPagamentoModalMode = 'view' | 'create' | 'edit'

export function ListagemCondicoesPagamentoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tabelasPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CondicaoPagamentoModalMode>('view')
  const [viewData, setViewData] = useState<CondicaoPagamentoTableDTO | null>(
    null,
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] =
    useState<CondicaoPagamentoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    useGetDataPaginated: useGetCondicoesPagamentoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentCondicoesPagamento,
  })

  const condicoes = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidateListas = () => {
    void queryClient.invalidateQueries({
      queryKey: ['condicoes-pagamento-paginated'],
    })
    void queryClient.invalidateQueries({
      queryKey: ['condicoes-pagamento-light'],
    })
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

  const handleOpenDelete = (row: CondicaoPagamentoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await CondicaoPagamentoService().deleteCondicaoPagamento(
        itemToDelete.id,
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Condição de pagamento eliminada com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar a condição de pagamento.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar a condição de pagamento.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title='Condições de Pagamento | Pagamentos | Faturação | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Condições de Pagamento'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            invalidateListas()
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar condições de pagamento</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao pedir a lista de condições de pagamento.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemCondicoesPagamentoTable
            data={condicoes}
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
            FilterControls={ListagemCondicoesPagamentoFilterControls}
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
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />

          <CondicaoPagamentoViewCreateModal
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
                <AlertDialogTitle>Eliminar condição de pagamento</AlertDialogTitle>
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
