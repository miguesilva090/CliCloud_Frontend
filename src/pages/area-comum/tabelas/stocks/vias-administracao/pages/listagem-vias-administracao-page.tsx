import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
import { Plus, List, RotateCw, RefreshCw, X } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
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
  AlertDialogTitle} from '@/components/ui/alert-dialog'
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { ViaAdministracaoTableDTO } from '@/types/dtos/artigos/via-administracao.dtos'
import { ListagemViasAdministracaoTable } from '../components/listagem-vias-administracao-table'
import { ListagemViasAdministracaoFilterControls } from '../components/listagem-vias-administracao-filter-controls'
import {
  useGetViasAdministracaoPaginated,
  usePrefetchAdjacentViasAdministracao} from '../queries/listagem-vias-administracao-queries'
import { ViaAdministracaoViewCreateModal } from '../modals/via-administracao-view-create-modal'
import { ViaAdministracaoService } from '@/lib/services/artigos/via-administracao-service'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const viasAdministracaoPermId = modules.areaComum.permissions.viasAdministracao.id

type ViaAdministracaoModalMode = 'view' | 'create' | 'edit'

export function ListagemViasAdministracaoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(viasAdministracaoPermId)
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ViaAdministracaoModalMode>('view')
  const [viewData, setViewData] = useState<ViaAdministracaoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ViaAdministracaoTableDTO | null>(null)
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
    handleSortingChange} = usePageData({
    useGetDataPaginated: useGetViasAdministracaoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentViasAdministracao})

  const vias = data?.info?.data ?? []
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
      variant: 'outline'},
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({
          queryKey: ['vias-administracao-paginated']})
      },
      variant: 'outline'},
  ]

  const handleOpenDelete = (data: ViaAdministracaoTableDTO) => {
    setItemToDelete(data)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await ViaAdministracaoService().deleteViaAdministracao(
        String(id),
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Via de Administração eliminada com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['vias-administracao-paginated'] })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar Via de Administração.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar a Via de Administração.')
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
      <PageHead title='Vias de Administração | Stocks | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Vias de Administração</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['vias-administracao-paginated']})
              }}
              title='Atualizar'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={closeWindowTab}
              title='Voltar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar vias de administração</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de vias de administração.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemViasAdministracaoTable
          data={vias}
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
          globalSearchPlaceholder='Procurar...'
          FilterControls={ListagemViasAdministracaoFilterControls}
          hiddenColumns={[]}
          onOpenView={(data) => {
            if (!canView) return
            setViewData(data)
            setModalMode('view')
            setModalOpen(true)
          }}
          onOpenEdit={
            canChange
              ? (data) => {
                  setViewData(data)
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
        <ViaAdministracaoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['vias-administracao-paginated']})
          }}
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Via de Administração</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar a via de administração &quot;
                {itemToDelete?.descricao ?? ''}&quot;? Esta ação não pode ser revertida.
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
      </DashboardPageContainer>
    </>
  )
}



