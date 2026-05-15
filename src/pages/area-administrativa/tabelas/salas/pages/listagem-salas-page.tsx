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
import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
import { ListagemSalasTable } from '../components/listagem-salas-table'
import { ListagemSalasFilterControls } from '../components/listagem-salas-filter-controls'
import { useGetSalasPaginated, usePrefetchAdjacentSalas } from '../queries/listagem-salas-queries'
import { SalaViewCreateModal } from '../modals/sala-view-create-modal'
import { SalaService } from '@/lib/services/consultas/sala-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

type ModalMode = 'view' | 'create' | 'edit'
const permId = modules.areaAdministrativa.permissions.salas.id

export function ListagemSalasPage() {
  const { canView, canAdd, canChange, canDelete } = useAreaComumEntityListPermissions(permId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [viewData, setViewData] = useState<SalaTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<SalaTableDTO | null>(null)
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
    useGetDataPaginated: useGetSalasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentSalas,
  })

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => {
    handleFiltersChange([])
    handlePaginationChange(1, pageSize)
    queryClient.invalidateQueries({ queryKey: ['salas-paginated'] })
  }

  const toolbarActions: DataTableAction[] = [
    ...(canAdd ? [{
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => {
        setViewData(null)
        setModalMode('create')
        setModalOpen(true)
      },
      variant: 'destructive' as const,
      className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    }] : []),
    { label: 'Listagens', icon: <List className='h-4 w-4' />, onClick: () => {}, variant: 'outline' },
    { label: 'Atualizar', icon: <RotateCw className='h-4 w-4' />, onClick: refresh, variant: 'outline' },
  ]

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await SalaService().deleteSala(itemToDelete.id)
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Sala eliminada com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        refresh()
      } else {
        toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar sala.')
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao eliminar sala.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title='Salas | Área Administrativa | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Salas' onRefresh={refresh}>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar salas</AlertTitle>
              <AlertDescription>{errorMessage || 'Erro ao pedir lista de salas.'}</AlertDescription>
            </Alert>
          ) : null}

          <ListagemSalasTable
            data={rows}
            isLoading={isLoading}
            pageCount={pageCount}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting.length > 0 ? sorting : [{ id: 'nome', desc: false }]}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={toolbarActions}
            globalSearchColumnId='nome'
            globalSearchPlaceholder='Procurar por nome...'
            FilterControls={ListagemSalasFilterControls}
            onOpenView={(row) => {
              if (!canView) return
              setViewData(row)
              setModalMode('view')
              setModalOpen(true)
            }}
            onOpenEdit={canChange ? (row) => {
              setViewData(row)
              setModalMode('edit')
              setModalOpen(true)
            } : undefined}
            onOpenDelete={canDelete ? (row) => {
              setItemToDelete(row)
              setDeleteDialogOpen(true)
            } : undefined}
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />

          <SalaViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            onSuccess={refresh}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar sala</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar &quot;{itemToDelete?.nome ?? ''}&quot;?
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
