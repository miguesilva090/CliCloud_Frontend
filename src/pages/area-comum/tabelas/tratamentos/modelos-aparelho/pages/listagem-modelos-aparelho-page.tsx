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
import type { ModeloAparelhoTableDTO } from '@/types/dtos/modelo-aparelho/modelo-aparelho.dtos'
import { ListagemModelosAparelhoTable } from '../components/listagem-modelos-aparelho-table'
import { ListagemModelosAparelhoFilterControls } from '../components/listagem-modelos-aparelho-filter-controls'
import { useGetModeloAparelhoPaginated, usePrefetchAdjacentModeloAparelho } from '../queries/listagem-modelos-aparelho-queries'
import { ModelosAparelhoViewCreateModal } from '../modals/modelos-aparelho-view-create-modal'
import { ModeloAparelhoService } from '@/lib/services/modelo-aparelho'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

type ModeloAparelhoModalMode = 'view' | 'create' | 'edit'

export function ListagemModelosAparelhoPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModeloAparelhoModalMode>('view')
  const [viewData, setViewData] = useState<ModeloAparelhoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ModeloAparelhoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, isError, error, page, pageSize, filters, sorting, handleFiltersChange, handlePaginationChange, handleSortingChange } = usePageData({
    useGetDataPaginated: useGetModeloAparelhoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentModeloAparelho})

  const items = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    { label: 'Adicionar', icon: <Plus className='h-4 w-4' />, onClick: () => { setViewData(null); setModalMode('create'); setModalOpen(true); }, variant: 'destructive', className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
    { label: 'Listagens', icon: <List className='h-4 w-4' />, onClick: () => {}, variant: 'outline' },
    { label: 'Atualizar', icon: <RotateCw className='h-4 w-4' />, onClick: () => { handleFiltersChange([]); handlePaginationChange(1, pageSize); queryClient.invalidateQueries({ queryKey: ['modelos-aparelho-paginated'] }); }, variant: 'outline' },
  ]

  const handleOpenDelete = (rowData: ModeloAparelhoTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await ModeloAparelhoService().deleteModeloAparelho(String(id))
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Modelo de aparelho eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['modelos-aparelho-paginated'] })
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

  const designacaoDisplay = itemToDelete?.designacao ?? (itemToDelete as { Designacao?: string })?.Designacao ?? ''

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Modelos de Aparelho</h1>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => { handleFiltersChange([]); handlePaginationChange(1, pageSize); queryClient.invalidateQueries({ queryKey: ['modelos-aparelho-paginated'] }); }} title='Atualizar'><RefreshCw className='h-4 w-4' /></Button>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={closeWindowTab} title='Fechar'><X className='h-4 w-4' /></Button>
          </div>
        </div>
        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar modelos de aparelho</AlertTitle>
            <AlertDescription>{errorMessage ?? 'Ocorreu um erro.'}</AlertDescription>
          </Alert>
        ) : null}
        <ListagemModelosAparelhoTable
          data={items}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting.length > 0 ? sorting : [{ id: 'designacao', desc: false }]}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          toolbarActions={toolbarActions}
          expandableSearch
          globalSearchColumnId='designacao'
          globalSearchPlaceholder='Procurar por designação ou marca...'
          FilterControls={ListagemModelosAparelhoFilterControls}
          hiddenColumns={[]}
          onOpenView={(row) => { setViewData(row); setModalMode('view'); setModalOpen(true); }}
          onOpenEdit={(row) => { setViewData(row); setModalMode('edit'); setModalOpen(true); }}
          onOpenDelete={handleOpenDelete}
        />
        <ModelosAparelhoViewCreateModal open={modalOpen} onOpenChange={setModalOpen} mode={modalMode} viewData={viewData} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['modelos-aparelho-paginated'] })} />
        <AlertDialog open={deleteDialogOpen} onOpenChange={() => { if (!isDeleting) { setDeleteDialogOpen(false); setItemToDelete(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Modelo de Aparelho</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar &quot;{designacaoDisplay}&quot;? Esta ação não pode ser revertida.
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




