import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { NotificacaoTableDTO } from '@/types/dtos/notificacoes/notificacao.dtos'
import { ListagemNotificacoesTable } from './listagem-notificacoes-table'
import { ListagemNotificacoesFilterControls } from './listagem-notificacoes-filter-controls'
import {
  createPrefetchNotificacoesForMode,
  createUseNotificacoesPaginatedForMode,
} from '../queries/listagem-notificacoes-queries'
import { NotificacaoViewModal } from '../modals/notificacao-view-modal'
import { NotificacaoCreateModal } from '../modals/notificacao-create-modal'
import { NotificacaoService } from '@/lib/services/notificacoes/notificacao-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
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

function permIdForNotificacoesListMode(listMode: number): string {
  if (listMode === 1) return modules.areaComum.permissions.notificacoesEnviadas.id
  if (listMode === 2) return modules.areaComum.permissions.notificacoesAtualizacao.id
  return modules.areaComum.permissions.notificacoes.id
}

export function ListagemNotificacoesSection({ listMode }: { listMode: number }) {
  const queryClient = useQueryClient()
  const permId = permIdForNotificacoesListMode(listMode)
  const { canView, canAdd, canDelete } = useAreaComumEntityListPermissions(permId)
  const showToolbarAdicionar = listMode !== 1 && canAdd
  const [viewOpen, setViewOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<NotificacaoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const useGetPaged = useMemo(
    () => createUseNotificacoesPaginatedForMode(listMode),
    [listMode],
  )
  const usePrefetch = useMemo(
    () => createPrefetchNotificacoesForMode(listMode),
    [listMode],
  )

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
    useGetDataPaginated: useGetPaged,
    usePrefetchAdjacentData: usePrefetch,
  })

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notificacoes-paginated', listMode] })
  }

  const toolbarActions: DataTableAction[] = [
    ...(showToolbarAdicionar
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () => setCreateOpen(true),
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
        invalidate()
      },
      variant: 'outline',
    },
  ]

  const handleMarcarLida = async (row: NotificacaoTableDTO) => {
    const id = row.id
    if (!id) return
    try {
      const res = await NotificacaoService().marcarComoLida(String(id))
      if (res.info.status === ResponseStatus.Success) {
        toast.success('Marcada como lida.')
        invalidate()
      } else {
        toast.error(res.info.messages?.['$']?.[0] ?? 'Não foi possível marcar como lida.')
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? 'Erro.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const res = await NotificacaoService().deleteNotificacao(String(itemToDelete.id))
      if (res.info.status === ResponseStatus.Success) {
        toast.success('Notificação eliminada.')
        setDeleteOpen(false)
        setItemToDelete(null)
        invalidate()
      } else {
        toast.error(res.info.messages?.['$']?.[0] ?? 'Falha ao eliminar.')
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? 'Erro ao eliminar.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {isError ? (
        <Alert variant='destructive' className='mb-4'>
          <AlertTitle>Falha ao carregar</AlertTitle>
          <AlertDescription>
            {errorMessage || 'Ocorreu um erro ao pedir a lista.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <ListagemNotificacoesTable
        listMode={listMode}
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
        globalSearchColumnId='titulo'
        globalSearchPlaceholder='Procurar por título...'
        FilterControls={ListagemNotificacoesFilterControls}
        hiddenColumns={[]}
        onOpenView={(row) => {
          if (!canView) return
          setViewId(String(row.id))
          setViewOpen(true)
        }}
        onOpenDelete={canDelete ? (row) => {
          setItemToDelete(row)
          setDeleteOpen(true)
        } : undefined}
        onMarcarLida={listMode === 0 ? handleMarcarLida : undefined}
        canView={canView}
        canDelete={canDelete}
      />

      <NotificacaoViewModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        notificacaoId={viewId}
      />
      <NotificacaoCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={invalidate}
      />

      <AlertDialog open={deleteOpen} onOpenChange={(o) => !isDeleting && setDeleteOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar notificação</AlertDialogTitle>
            <AlertDialogDescription>
              Eliminar &quot;{itemToDelete?.titulo ?? ''}&quot;? Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
            >
              {isDeleting ? 'A eliminar…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
