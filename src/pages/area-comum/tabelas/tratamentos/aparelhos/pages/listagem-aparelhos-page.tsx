import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import type { AparelhoTableDTO } from '@/types/dtos/aparelho/aparelho.dtos'
import { ListagemAparelhosTable } from '../components/listagem-aparelhos-table'
import { ListagemAparelhosFilterControls } from '../components/listagem-aparelhos-filter-controls'
import { useGetAparelhoPaginated, usePrefetchAdjacentAparelho } from '../queries/listagem-aparelhos-queries'
import { AparelhosViewCreateModal } from '../modals/aparelhos-view-create-modal'
import { AparelhoService } from '@/lib/services/aparelho'
import { ResponseStatus } from '@/types/api/responses'
import {
  useCloseCurrentWindowLikeTabBar,
  navigateManagedWindow,
} from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const aparelhosPermId = modules.areaComum.permissions.aparelhos.id

type AparelhoModalMode = 'view' | 'create' | 'edit'

export function ListagemAparelhosPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(aparelhosPermId)
  const navigate = useNavigate()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<AparelhoModalMode>('view')
  const [viewData, setViewData] = useState<AparelhoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<AparelhoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, isError, error, page, pageSize, filters, sorting, handleFiltersChange, handlePaginationChange, handleSortingChange } = usePageData({
    useGetDataPaginated: useGetAparelhoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentAparelho})

  const items = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () =>
              navigateManagedWindow(
                navigate,
                '/area-comum/tabelas/tratamentos/aparelhos/novo',
              ),
            variant: 'destructive' as const,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          },
        ]
      : []),
    { label: 'Listagens', icon: <List className='h-4 w-4' />, onClick: () => {}, variant: 'outline' },
    { label: 'Atualizar', icon: <RotateCw className='h-4 w-4' />, onClick: () => { handleFiltersChange([]); handlePaginationChange(1, pageSize); queryClient.invalidateQueries({ queryKey: ['aparelhos-paginated'] }); }, variant: 'outline' },
  ]

  const handleOpenDelete = (rowData: AparelhoTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await AparelhoService().deleteAparelho(String(id))
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Aparelho eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['aparelhos-paginated'] })
      } else {
        const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao eliminar.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Erro ao eliminar.')
    } finally {
      setIsDeleting(false)
    }
  }

  const displayLabel = itemToDelete?.codigoSerie ?? (itemToDelete as { CodigoSerie?: string })?.CodigoSerie ?? itemToDelete?.tipoAparelhoDesignacao ?? (itemToDelete as { TipoAparelhoDesignacao?: string })?.TipoAparelhoDesignacao ?? itemToDelete?.id ?? ''

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Aparelhos</h1>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => { handleFiltersChange([]); handlePaginationChange(1, pageSize); queryClient.invalidateQueries({ queryKey: ['aparelhos-paginated'] }); }} title='Atualizar'><RefreshCw className='h-4 w-4' /></Button>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={closeWindowTab} title='Fechar'><X className='h-4 w-4' /></Button>
          </div>
        </div>
        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar aparelhos</AlertTitle>
            <AlertDescription>{errorMessage ?? 'Ocorreu um erro.'}</AlertDescription>
          </Alert>
        ) : null}
        <ListagemAparelhosTable
          data={items}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting.length > 0 ? sorting : [{ id: 'codigoSerie', desc: false }]}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          toolbarActions={toolbarActions}
          expandableSearch
          globalSearchColumnId='codigoSerie'
          globalSearchPlaceholder='Procurar por código série, local ou tipo...'
          FilterControls={ListagemAparelhosFilterControls}
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
        <AparelhosViewCreateModal open={modalOpen} onOpenChange={setModalOpen} mode={modalMode} viewData={viewData} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['aparelhos-paginated'] })} />
        <AlertDialog open={deleteDialogOpen} onOpenChange={() => { if (!isDeleting) { setDeleteDialogOpen(false); setItemToDelete(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Aparelho</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o aparelho &quot;{displayLabel}&quot;? Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }} disabled={isDeleting} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                {isDeleting ? 'A eliminar...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardPageContainer>
    </>
  )
}




