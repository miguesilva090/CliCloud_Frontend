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
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { CategoriaProcedimentoTableDTO } from '@/types/dtos/exames/categoria-procedimento'
import { ListagemCategoriaProcedimentoTable } from '../components/listagem-categoria-procedimento-table'
import { ListagemCategoriaProcedimentoFilterControls } from '../components/listagem-categoria-procedimento-filter-controls'
import {
  useGetCategoriaProcedimentosPaginated,
  usePrefetchAdjacentCategoriaProcedimentos,
} from '../queries/listagem-categoria-procedimento-queries'
import { CategoriaProcedimentoViewCreateModal } from '../modals/categoria-procedimento-view-create-modal'
import { CategoriaProcedimentoService } from '@/lib/services/exames/categoria-procedimento-service'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const categoriasProcedimentoPermId =
  modules.areaComum.permissions.categoriasProcedimento.id

type CategoriaProcedimentoModalMode = 'view' | 'create' | 'edit'

export function ListagemCategoriaProcedimentoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(categoriasProcedimentoPermId)
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] =
    useState<CategoriaProcedimentoModalMode>('view')
  const [viewData, setViewData] =
    useState<CategoriaProcedimentoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] =
    useState<CategoriaProcedimentoTableDTO | null>(null)
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
    useGetDataPaginated: useGetCategoriaProcedimentosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentCategoriaProcedimentos,
  })

  const categorias = data?.info?.data ?? []
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
          queryKey: ['categoria-procedimento-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (rowData: CategoriaProcedimentoTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await CategoriaProcedimentoService().deleteCategoriaProcedimento(
        String(id)
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Categoria de procedimento eliminada com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({
          queryKey: ['categoria-procedimento-paginated'],
        })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar Categoria de procedimento.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ??
          'Ocorreu um erro ao eliminar a Categoria de procedimento.'
      )
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
      <PageHead title='Categorias de Procedimento | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Categorias de Procedimento</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['categoria-procedimento-paginated'],
                })
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
            <AlertTitle>Falha ao carregar categorias de procedimento</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de categorias de procedimento.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemCategoriaProcedimentoTable
          data={categorias}
          pageCount={pageCount}
          totalRows={totalRows}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          toolbarActions={toolbarActions}
          globalSearchColumnId='descricao'
          globalSearchPlaceholder='Procurar por descrição...'
          FilterControls={ListagemCategoriaProcedimentoFilterControls}
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

        <CategoriaProcedimentoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['categoria-procedimento-paginated'],
            })
          }}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Categoria de Procedimento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar a categoria &quot;
                {itemToDelete?.descricao ?? ''}
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

