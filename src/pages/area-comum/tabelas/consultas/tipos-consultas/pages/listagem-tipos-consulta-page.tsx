import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { List, RotateCw } from 'lucide-react'
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
import type { TipoConsultaTableDTO } from '@/types/dtos/tipos-consulta/tipo-consulta.dtos'
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'
import { ResponseStatus } from '@/types/api/responses'
import { ListagemTiposConsultaTable } from '../components/listagem-tipos-consulta-table'
import { ListagemTiposConsultaFilterControls } from '../components/listagem-tipos-consulta-filter-controls'
import {
  useGetTiposConsultaPaginated,
  usePrefetchAdjacentTiposConsulta} from '../queries/listagem-tipos-consulta-queries'
import { TipoConsultaViewEditModal } from '../modals/tipo-consulta-view-edit-modal'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const tiposConsultasPermId = modules.areaComum.permissions.tiposConsultas.id

type TipoConsultaModalMode = 'view' | 'edit'

export function ListagemTiposConsultaPage() {
  const { canView, canChange, canDelete } =
    useAreaComumEntityListPermissions(tiposConsultasPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<TipoConsultaModalMode>('view')
  const [viewData, setViewData] = useState<TipoConsultaTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TipoConsultaTableDTO | null>(
    null,
  )
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
    useGetDataPaginated: useGetTiposConsultaPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentTiposConsulta})

  const tiposConsulta = data?.info?.data ?? []
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
          queryKey: ['tipos-consulta-paginated']})
      },
      variant: 'outline'},
  ]

  const handleOpenDelete = (data: TipoConsultaTableDTO) => {
    if (!canDelete) return
    setItemToDelete(data)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id =
      itemToDelete.id ??
      (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await TipoConsultaService().deleteTipoConsulta(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Tipo de consulta eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({
          queryKey: ['tipos-consulta-paginated'],
        })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar tipo de consulta.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao eliminar tipo de consulta.')
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
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Tipos de Consulta'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['tipos-consulta-paginated']})
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar tipos de consulta</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de tipos de consulta.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemTiposConsultaTable
          data={tiposConsulta}
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
          FilterControls={ListagemTiposConsultaFilterControls}
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
          onOpenDelete={handleOpenDelete}
          canView={canView}
          canChange={canChange}
          canDelete={canDelete}
        />
        <TipoConsultaViewEditModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['tipos-consulta-paginated']})
          }}
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar tipo de consulta</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar &quot;
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
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}



