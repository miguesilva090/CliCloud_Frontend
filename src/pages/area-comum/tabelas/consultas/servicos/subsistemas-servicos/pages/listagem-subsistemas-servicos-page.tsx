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
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import { ListagemSubsistemasServicosTable } from '../components/listagem-subsistemas-servicos-table'
import {
  useGetSubsistemasServicosPaginated,
  usePrefetchAdjacentSubsistemasServicos} from '../queries/listagem-subsistemas-servicos-queries'
import { SubsistemaServicoViewCreateModal } from '../modals/subsistema-servico-view-create-modal'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

export function ListagemSubsistemasServicosPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [selectedRow, setSelectedRow] =
    useState<SubsistemaServicoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] =
    useState<SubsistemaServicoTableDTO | null>(null)
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
    useGetDataPaginated: (p, ps, f, s) =>
      useGetSubsistemasServicosPaginated(p, ps, f, s),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentSubsistemasServicos(p, ps, f, null)})

  const subsistemas = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const abrirModalNovo = () => {
    setSelectedRow(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: abrirModalNovo,
      variant: 'destructive',
      className:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90'},
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
          queryKey: ['subsistemas-servicos-paginated']})
      },
      variant: 'outline'},
  ]

  const EmptyFilterControls: React.ComponentType<{
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
  }> = () => null

  const handleOpenView = (row: SubsistemaServicoTableDTO) => {
    setSelectedRow(row)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleOpenEdit = (row: SubsistemaServicoTableDTO) => {
    setSelectedRow(row)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleOpenDelete = (row: SubsistemaServicoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return

    setIsDeleting(true)
    try {
      const response = await SubsistemaServicoService().deleteSubsistemaServico(
        String(id)
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Subsistema de Serviço eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({
          queryKey: ['subsistemas-servicos-paginated']})
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar Subsistema de Serviço.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar o Subsistema de Serviço.'
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
      <PageHead title='Subsistemas de Serviços | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Subsistemas de Serviços</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['subsistemas-servicos-paginated']})
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
            <AlertTitle>Falha ao carregar Subsistemas de Serviços</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de Subsistemas de Serviços.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemSubsistemasServicosTable
          data={subsistemas}
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
          globalSearchColumnId='servicoId'
          globalSearchPlaceholder='Procurar...'
          FilterControls={EmptyFilterControls}
          onOpenView={handleOpenView}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenDelete}
        />

        <SubsistemaServicoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={selectedRow}
          onSuccess={() =>
            queryClient.invalidateQueries({
              queryKey: ['subsistemas-servicos-paginated']})
          }
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Subsistema de Serviço</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o Subsistema de Serviço com
                serviço &quot;
                {itemToDelete?.servicoId ?? ''}
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



