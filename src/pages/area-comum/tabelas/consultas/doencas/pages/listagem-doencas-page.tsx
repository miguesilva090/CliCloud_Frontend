import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
import { List, RotateCw, RefreshCw, X, ChevronRight } from 'lucide-react'
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
import type { DoencaTableDTO } from '@/types/dtos/doencas/doenca.dtos'
import { ListagemDoencasTable } from '../components/listagem-doencas-table'
import { ListagemDoencasFilterControls } from '../components/listagem-doencas-filter-controls'
import {
  useGetDoencasPaginated,
  usePrefetchAdjacentDoencas} from '../queries/listagem-doencas-queries'
import { DoencaViewEditModal } from '../modals/doenca-view-edit-modal'
import { DoencaService } from '@/lib/services/doencas/doenca-service'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

type DoencaModalMode = 'view' | 'edit'

type BreadcrumbItem = { id: string; code: string; title: string }

export function ListagemDoencasPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [path, setPath] = useState<BreadcrumbItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<DoencaModalMode>('view')
  const [viewData, setViewData] = useState<DoencaTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<DoencaTableDTO | null>(null)
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
    useGetDataPaginated: useGetDoencasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentDoencas})

  const handleDrillDown = (row: DoencaTableDTO) => {
    const item: BreadcrumbItem = {
      id: row.id,
      code: row.code ?? '',
      title: row.title}
    setPath((prev) => [...prev, item])
    handleFiltersChange([
      ...filters.filter((f) => f.id !== 'parentId'),
      { id: 'parentId', value: row.id },
    ])
  }

  const handleBackToRoot = () => {
    setPath([])
    handleFiltersChange(filters.filter((f) => f.id !== 'parentId'))
  }

  const handleBreadcrumbClick = (index: number) => {
    const newPath = path.slice(0, index + 1)
    setPath(newPath)
    handleFiltersChange([
      ...filters.filter((f) => f.id !== 'parentId'),
      { id: 'parentId', value: newPath[index].id },
    ])
  }

  const handleFiltersChangePreservingParent = (
    newFilters: Array<{ id: string; value: string }>
  ) => {
    const base = newFilters.filter((f) => f.id !== 'parentId')
    const withParent =
      path.length > 0
        ? [...base, { id: 'parentId', value: path[path.length - 1].id }]
        : base
    handleFiltersChange(withParent)
  }

  const doencas = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
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
          queryKey: ['doencas-paginated']})
      },
      variant: 'outline'},
  ]

  const handleOpenDelete = (rowData: DoencaTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await DoencaService().deleteDoenca(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Doença eliminada com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['doencas-paginated'] })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar Doença.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar a Doença.')
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
      <PageHead title='Doenças | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Doenças</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['doencas-paginated']})
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
            <AlertTitle>Falha ao carregar doenças</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de doenças.'}
            </AlertDescription>
          </Alert>
        ) : null}

        {(path.length > 0 || filters.some((f) => f.id === 'parentId')) ? (
          <div className='flex flex-wrap items-center gap-1 mb-3 text-sm text-muted-foreground'>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 font-medium'
              onClick={handleBackToRoot}
            >
              Início
            </Button>
            {path.map((item, i) => (
              <span key={item.id} className='flex items-center gap-1'>
                <ChevronRight className='h-4 w-4 shrink-0' />
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 font-medium max-w-[200px] truncate'
                  onClick={() => handleBreadcrumbClick(i)}
                  title={item.title}
                >
                  {item.code ? `${item.code} – ` : ''}
                  {item.title}
                </Button>
              </span>
            ))}
          </div>
        ) : null}

        <ListagemDoencasTable
          data={doencas}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting.length > 0 ? sorting : [{ id: 'code', desc: false }]}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChangePreservingParent}
          onSortingChange={handleSortingChange}
          toolbarActions={toolbarActions}
          globalSearchColumnId='title'
          globalSearchPlaceholder='Procurar por título ou código...'
          FilterControls={ListagemDoencasFilterControls}
          hiddenColumns={[]}
          onOpenView={(rowData) => {
            setViewData(rowData)
            setModalMode('view')
            setModalOpen(true)
          }}
          onOpenEdit={(rowData) => {
            setViewData(rowData)
            setModalMode('edit')
            setModalOpen(true)
          }}
          onOpenDelete={handleOpenDelete}
          onDrillDown={handleDrillDown}
        />
        <DoencaViewEditModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['doencas-paginated']})
          }}
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Doença</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar a doença &quot;
                {itemToDelete?.title ?? ''}
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


