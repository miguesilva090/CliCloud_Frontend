import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Button } from '@/components/ui/button'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { DataTableAction } from '@/components/shared/data-table'
import { usePageData } from '@/utils/page-data-utils'
import { toast } from '@/utils/toast-utils'
import type { MapaBodyChartTableDTO } from '@/types/dtos/processo-clinico/body-chart.dtos'
import { ResponseStatus } from '@/types/api/responses'
import { MapaBodyChartService } from '@/lib/services/processo-clinico/body-chart-service'
import { MapasBodyChartTable } from '../components/mapas-body-chart-table'
import { MapasBodyChartFilterControls } from '../components/mapas-body-chart-filter-controls'
import { MapaBodyChartViewCreateModal } from '../modals/mapa-body-chart-view-create-modal'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import {
  useGetMapasBodyChartPaginated,
  usePrefetchAdjacentMapasBodyChart,
} from '../queries/mapas-body-chart-queries'

type MapaBodyChartModalMode = 'view' | 'create' | 'edit'

export function MapasBodyChartPage() {
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<MapaBodyChartModalMode>('view')
  const [viewData, setViewData] = useState<MapaBodyChartTableDTO | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MapaBodyChartTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const mapasBodyChartPermissionId = modules.areaClinica.permissions.mapasBodyChart.id
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(mapasBodyChartPermissionId)

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
    useGetDataPaginated: useGetMapasBodyChartPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentMapasBodyChart,
  })

  const mapas = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [{
          label: 'Adicionar',
          icon: <Plus className='h-4 w-4' />,
          onClick: () => {
            setViewData(null)
            setModalMode('create')
            setModalOpen(true)
          },
          variant: 'destructive' as const,
          className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        }]
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
        queryClient.invalidateQueries({ queryKey: ['mapas-body-chart-paginated'] })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (rowData: MapaBodyChartTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return

    setIsDeleting(true)
    try {
      const response = await MapaBodyChartService().delete(id)
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Mapa de Body Chart eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['mapas-body-chart-paginated'] })
      } else {
        const msg = response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar Mapa de Body Chart.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o Mapa de Body Chart.')
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
      <PageHead title='Mapas de Body Chart | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Mapas de Body Chart'>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar mapas de Body Chart</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de mapas de Body Chart.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <MapasBodyChartTable
          data={mapas}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting.length > 0 ? sorting : [{ id: 'nome', desc: false }]}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          toolbarActions={toolbarActions}
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar por nome...'
          FilterControls={MapasBodyChartFilterControls}
          hiddenColumns={[]}
          onOpenView={
            canView
              ? (rowData: MapaBodyChartTableDTO) => {
                  setViewData(rowData)
                  setModalMode('view')
                  setModalOpen(true)
                }
              : undefined
          }
          onOpenEdit={
            canChange
              ? (rowData: MapaBodyChartTableDTO) => {
                  setViewData(rowData)
                  setModalMode('edit')
                  setModalOpen(true)
                }
              : undefined
          }
          onOpenDelete={canDelete ? handleOpenDelete : undefined}
          rowActionPermissions={{ canView, canChange, canDelete }}
        />

        {canView || canAdd || canChange ? (
          <MapaBodyChartViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['mapas-body-chart-paginated'] })
            }}
          />
        ) : null}

        {canDelete ? (
          <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Mapa de Body Chart</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar o mapa &quot;{itemToDelete?.nome ?? ''}&quot;? Esta
                  ação não pode ser revertida.
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
        ) : null}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
