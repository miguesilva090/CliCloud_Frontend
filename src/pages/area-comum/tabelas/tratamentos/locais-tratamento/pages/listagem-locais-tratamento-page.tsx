import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import type { LocalTratamentoTableDTO } from '@/types/dtos/locais-tratamento/local-tratamento.dtos'
import { ListagemLocaisTratamentoTable } from '../components/listagem-locais-tratamento-table'
import { ListagemLocaisTratamentoFilterControls } from '../components/listagem-locais-tratamento-filter-controls'
import {
  useGetLocaisTratamentoPaginated,
  usePrefetchAdjacentLocaisTratamento,
} from '../queries/listagem-locais-tratamento-queries'
import { LocalTratamentoViewCreateModal } from '../modals/local-tratamento-view-create-modal'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const locaisTratamentoPermId = modules.areaComum.permissions.locaisTratamento.id

type LocalTratamentoModalMode = 'view' | 'create' | 'edit'

export function ListagemLocaisTratamentoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(locaisTratamentoPermId)
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<LocalTratamentoModalMode>('view')
  const [viewData, setViewData] = useState<LocalTratamentoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<LocalTratamentoTableDTO | null>(null)
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
    useGetDataPaginated: useGetLocaisTratamentoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentLocaisTratamento})

  const locaisTratamento = data?.info?.data ?? []
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
          queryKey: ['locais-tratamento-paginated']})
      },
      variant: 'outline'},
  ]

  const handleOpenDelete = (rowData: LocalTratamentoTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await LocalTratamentoService().deleteLocalTratamento(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Local de Tratamento eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['locais-tratamento-paginated'] })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar Local de Tratamento.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o Local de Tratamento.')
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
      <PageHead title='Locais de Tratamentos | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Locais de Tratamentos</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['locais-tratamento-paginated']})
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
              title='Fechar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar locais de tratamento</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de locais de tratamento.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemLocaisTratamentoTable
          data={locaisTratamento}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={
            sorting.length > 0 ? sorting : [{ id: 'designacao', desc: false }]
          }
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          toolbarActions={toolbarActions}
          globalSearchColumnId='designacao'
          globalSearchPlaceholder='Procurar por designação...'
          FilterControls={ListagemLocaisTratamentoFilterControls}
          hiddenColumns={[]}
          onOpenView={(rowData) => {
            if (!canView) return
            setViewData(rowData)
            setModalMode('view')
            setModalOpen(true)
          }}
          onOpenEdit={
            canChange
              ? (rowData) => {
                  setViewData(rowData)
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
        <LocalTratamentoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['locais-tratamento-paginated']})
          }}
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Local de Tratamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o local de tratamento &quot;
                {itemToDelete?.designacao ?? ''}
                &quot;? Esta ação não pode ser revertida.
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



