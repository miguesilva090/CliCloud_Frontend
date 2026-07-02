import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
import type { SeguradoraTableDTO } from '@/types/dtos/seguradoras/seguradora.dtos'
import { ListagemSeguradorasTable } from '../components/listagem-seguradoras-table'
import { ListagemSeguradorasFilterControls } from '../components/listagem-seguradoras-filter-controls'
import {
  useGetSeguradorasPaginated,
  usePrefetchAdjacentSeguradoras,
} from '../queries/listagem-seguradora-queries'
import { SeguradoraViewCreateModal } from '../modals/seguradora-view-create-modal'
import { SeguradoraService } from '@/lib/services/seguradoras/seguradora-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const seguradorasPermId = modules.areaComum.permissions.seguradoras.id

type SeguradoraModalMode = 'view' | 'create' | 'edit'

export function ListagemSeguradorasPage() {
  const location = useLocation()
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(seguradorasPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<SeguradoraModalMode>('view')
  const [viewData, setViewData] = useState<SeguradoraTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<SeguradoraTableDTO | null>(null)
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
    useGetDataPaginated: useGetSeguradorasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentSeguradoras,
  })

  const seguradoras = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  useEffect(() => {
    if (location.pathname.endsWith('/nova')) {
      setViewData(null)
      setModalMode('create')
      setModalOpen(true)
    }
  }, [location.pathname])

  const openCreate = () => {
    setViewData(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: openCreate,
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
        queryClient.invalidateQueries({ queryKey: ['seguradoras-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['entity-quick-create', 'seguradora', 'light'] })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (row: SeguradoraTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await SeguradoraService(seguradorasPermId).deleteSeguradora(
        itemToDelete.id,
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Seguradora eliminada com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['seguradoras-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['entity-quick-create', 'seguradora', 'light'] })
      } else {
        const msg = response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar seguradora.'
        toast.error(msg)
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast.error(e?.message ?? 'Ocorreu um erro ao eliminar a seguradora.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <>
      <PageHead title='Seguradoras | Entidades | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Seguradoras'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            queryClient.invalidateQueries({ queryKey: ['seguradoras-paginated'] })
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar seguradoras</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista de seguradoras.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemSeguradorasTable
            data={seguradoras}
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
            globalSearchColumnId='nome'
            globalSearchPlaceholder='Procurar por nome...'
            FilterControls={ListagemSeguradorasFilterControls}
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

          <SeguradoraViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['seguradoras-paginated'] })
              queryClient.invalidateQueries({ queryKey: ['entity-quick-create', 'seguradora', 'light'] })
            }}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar seguradora</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar a seguradora &quot;
                  {itemToDelete?.nome ?? ''}
                  &quot;? Esta ação não pode ser revertida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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
