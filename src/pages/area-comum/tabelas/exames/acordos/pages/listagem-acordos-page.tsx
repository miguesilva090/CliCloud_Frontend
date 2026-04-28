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
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { AcordosTableDTO } from '@/types/dtos/exames/acordos'
import { ListagemAcordosTable } from '../components/listagem-acordos-table'
import { ListagemAcordosFilterControls } from '../components/listagem-acordos-filter-controls'
import {
  useGetAcordosPaginated,
  usePrefetchAdjacentAcordos,
} from '../queries/listagem-acordos-queries'
import { AcordoViewCreateModal } from '../modals/acordo-view-create-modal'
import { AcordosService } from '@/lib/services/exames/acordos-service'
import { ResponseStatus } from '@/types/api/responses'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const acordosPermId = modules.areaComum.permissions.acordos.id

type AcordoModalMode = 'view' | 'create' | 'edit'

export function ListagemAcordosPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(acordosPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<AcordoModalMode>('view')
  const [viewData, setViewData] = useState<AcordosTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<AcordosTableDTO | null>(null)
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
    useGetDataPaginated: useGetAcordosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentAcordos,
  })

  const acordos = data?.info?.data ?? []
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
        queryClient.invalidateQueries({ queryKey: ['acordos-paginated'] })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (rowData: AcordosTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await AcordosService().deleteAcordos(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Acordo eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['acordos-paginated'] })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar acordo.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o acordo.')
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

  const deleteLabel =
    itemToDelete?.tipoExameDesignacao && itemToDelete?.organismoNome
      ? `${itemToDelete.tipoExameDesignacao} / ${itemToDelete.organismoNome}`
      : itemToDelete?.codigoSubsistema ?? itemToDelete?.id ?? ''

  return (
    <>
      <PageHead title='Acordos | Exames | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Acordos'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({ queryKey: ['acordos-paginated'] })
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar acordos</AlertTitle>
            <AlertDescription>
              {errorMessage ?? 'Ocorreu um erro ao pedir a lista de acordos.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemAcordosTable
          data={acordos}
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
          globalSearchColumnId='codigoSubsistema'
          globalSearchPlaceholder='Procurar por código subsistema...'
          FilterControls={ListagemAcordosFilterControls}
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

        <AcordoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['acordos-paginated'] })
          }}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Acordo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o acordo &quot;{deleteLabel}
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

