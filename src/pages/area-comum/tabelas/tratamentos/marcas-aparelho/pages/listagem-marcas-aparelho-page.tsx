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
import type { MarcaAparelhoTableDTO } from '@/types/dtos/marca-aparelho/marca-aparelho.dtos'
import { ListagemMarcasAparelhoTable } from '../components/listagem-marcas-aparelho-table'
import { ListagemMarcasAparelhoFilterControls } from '../components/listagem-marcas-aparelho-filter-controls'
import {
  useGetMarcaAparelhoPaginated,
  usePrefetchAdjacentMarcaAparelho} from '../queries/listagem-marcas-aparelho-queries'
import { MarcasAparelhoViewCreateModal } from '../modals/marcas-aparelho-view-create-modal'
import { MarcaAparelhoService } from '@/lib/services/marca-aparelho'
import { ResponseStatus } from '@/types/api/responses'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const marcasAparelhoPermId = modules.areaComum.permissions.marcasAparelho.id

type MarcaAparelhoModalMode = 'view' | 'create' | 'edit'

export function ListagemMarcasAparelhoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(marcasAparelhoPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<MarcaAparelhoModalMode>('view')
  const [viewData, setViewData] = useState<MarcaAparelhoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MarcaAparelhoTableDTO | null>(null)
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
    useGetDataPaginated: useGetMarcaAparelhoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentMarcaAparelho})

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
        queryClient.invalidateQueries({ queryKey: ['marcas-aparelho-paginated'] })
      },
      variant: 'outline'},
  ]

  const handleOpenDelete = (rowData: MarcaAparelhoTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await MarcaAparelhoService().deleteMarcaAparelho(String(id))
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Marca de aparelho eliminada com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['marcas-aparelho-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          'Falha ao eliminar Marca de Aparelho.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar a Marca de Aparelho.')
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

  const designacaoDisplay =
    itemToDelete?.designacao ?? (itemToDelete as { Designacao?: string })?.Designacao ?? ''

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Marcas de Aparelho'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({ queryKey: ['marcas-aparelho-paginated'] })
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar marcas de aparelho</AlertTitle>
            <AlertDescription>
              {errorMessage ?? 'Ocorreu um erro ao pedir a lista de marcas de aparelho.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemMarcasAparelhoTable
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
          FilterControls={ListagemMarcasAparelhoFilterControls}
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
        <MarcasAparelhoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['marcas-aparelho-paginated'] })
          }}
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Marca de Aparelho</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar a marca de aparelho &quot;
                {designacaoDisplay}
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
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}

