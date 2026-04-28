import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw, RefreshCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Button } from '@/components/ui/button'
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
import type { NotificacaoTipoTableDTO } from '@/types/dtos/notificacoes/notificacao-tipo.dtos'
import { ListagemNotificacaoTiposTable } from '../components/listagem-notificacao-tipos-table'
import { ListagemNotificacaoTiposFilterControls } from '../components/listagem-notificacao-tipos-filter-controls'
import {
  useGetNotificacaoTiposPaginated,
  usePrefetchAdjacentNotificacaoTipos,
} from '../queries/listagem-notificacao-tipos-queries'
import { NotificacaoTipoViewCreateModal } from '../modals/notificacao-tipo-view-create-modal'
import { NotificacaoTipoService } from '@/lib/services/notificacoes/notificacao-tipo-service'
import { ResponseStatus } from '@/types/api/responses'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const permId = modules.areaComum.permissions.notificacaoTipos.id

type ModalMode = 'view' | 'create' | 'edit'

export function ListagemNotificacaoTiposPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(permId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [viewData, setViewData] = useState<NotificacaoTipoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<NotificacaoTipoTableDTO | null>(
    null,
  )
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
    useGetDataPaginated: useGetNotificacaoTiposPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentNotificacaoTipos,
  })

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

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
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({
          queryKey: ['notificacao-tipos-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (row: NotificacaoTipoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await NotificacaoTipoService().deleteNotificacaoTipo(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Tipo eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['notificacao-tipos-paginated'] })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar o tipo.'
        toast.error(msg)
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Erro ao eliminar.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title='Tipos de notificação | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Tipos de notificação'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['notificacao-tipos-paginated'],
                })
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemNotificacaoTiposTable
          data={rows}
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
          globalSearchColumnId='designacaoTipo'
          globalSearchPlaceholder='Procurar por designação...'
          FilterControls={ListagemNotificacaoTiposFilterControls}
          hiddenColumns={[]}
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
        <NotificacaoTipoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['notificacao-tipos-paginated'],
            })
          }}
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
              <AlertDialogTitle>Eliminar tipo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar &quot;
                {itemToDelete?.designacaoTipo ?? ''}
                &quot;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirmDelete()
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
