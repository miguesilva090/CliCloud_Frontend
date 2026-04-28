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
  AlertDialogTitle} from '@/components/ui/alert-dialog'
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { TipoAparelhoTableDTO } from '@/types/dtos/tipo-aparelho/tipo-aparelho.dtos'
import { ListagemTiposAparelhoTable } from '../components/listagem-tipos-aparelho-table'
import { ListagemTiposAparelhoFilterControls } from '../components/listagem-tipos-aparelho-filter-controls'
import {
  useGetTipoAparelhoPaginated,
  usePrefetchAdjacentTipoAparelho} from '../queries/listagem-tipos-aparelho-queries'
import { TiposAparelhoViewCreateModal } from '../modals/tipos-aparelho-view-create-modal'
import { TipoAparelhoService } from '@/lib/services/tipo-aparelho'
import { ResponseStatus } from '@/types/api/responses'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const tiposAparelhoPermId = modules.areaComum.permissions.tiposAparelho.id

type TipoAparelhoModalMode = 'view' | 'create' | 'edit'

export function ListagemTiposAparelhoPage() {
  const { canView, canChange, canDelete } =
    useAreaComumEntityListPermissions(tiposAparelhoPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<TipoAparelhoModalMode>('view')
  const [viewData, setViewData] = useState<TipoAparelhoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TipoAparelhoTableDTO | null>(null)
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
    useGetDataPaginated: useGetTipoAparelhoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentTipoAparelho})

  const items = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => {
        setViewData(null)
        setModalMode('create')
        setModalOpen(true)
      },
      variant: 'destructive',
      className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'},
    { label: 'Listagens', icon: <List className='h-4 w-4' />, onClick: () => {}, variant: 'outline' },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({ queryKey: ['tipos-aparelho-paginated'] })
      },
      variant: 'outline'},
  ]

  const handleOpenDelete = (rowData: TipoAparelhoTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await TipoAparelhoService().deleteTipoAparelho(String(id))
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Tipo de aparelho eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['tipos-aparelho-paginated'] })
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
        <AreaComumListagemPageShell
            title='Tipos de Aparelho'
            onRefresh={() => {
                handleFiltersChange([]); handlePaginationChange(1, pageSize); queryClient.invalidateQueries({ queryKey: ['tipos-aparelho-paginated'] });
            }}
        >
        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar tipos de aparelho</AlertTitle>
            <AlertDescription>{errorMessage ?? 'Ocorreu um erro.'}</AlertDescription>
          </Alert>
        ) : null}
        <ListagemTiposAparelhoTable
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
          globalSearchColumnId='designacao'
          globalSearchPlaceholder='Procurar por designação...'
          FilterControls={ListagemTiposAparelhoFilterControls}
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
        <TiposAparelhoViewCreateModal open={modalOpen} onOpenChange={setModalOpen} mode={modalMode} viewData={viewData} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tipos-aparelho-paginated'] })} />
        <AlertDialog open={deleteDialogOpen} onOpenChange={() => { if (!isDeleting) { setDeleteDialogOpen(false); setItemToDelete(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Tipo de Aparelho</AlertDialogTitle>
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
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}

