import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
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
import type { EstadosDentariosTableDTO } from '@/types/dtos/odontologia/estados-dentarios.dtos'
import { ListagemEstadosDentariosTable } from '../components/listagem-estados-dentarios-table'
import { ListagemEstadosDentariosFilterControls } from '../components/listagem-estados-dentarios-filter-controls'
import {
  useGetEstadosDentariosPaginated,
  usePrefetchAdjacentEstadosDentarios,
} from '../queries/estados-dentarios-queries'
import { EstadoDentarioViewCreateModal } from '../modals/estado-dentario-view-create-modal'
import { EstadosDentariosService } from '@/lib/services/processo-clinico/odontologia/estados-dentarios-service'
import { ResponseStatus } from '@/types/api/responses'
import { useEntityListPermissionsFromMany } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const estadosDentariosPermId = modules.areaClinica.permissions.estadosDentarios.id

type EstadoDentarioModalMode = 'view' | 'create' | 'edit'

export function EstadosDentariosPage() {
  const { canView, canAdd, canChange, canDelete } =
    useEntityListPermissionsFromMany([estadosDentariosPermId])
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<EstadoDentarioModalMode>('view')
  const [viewData, setViewData] = useState<EstadosDentariosTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<EstadosDentariosTableDTO | null>(null)
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
    useGetDataPaginated: useGetEstadosDentariosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentEstadosDentarios,
  })

  const estadosDentarios = data?.info?.data ?? []
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
          queryKey: ['estados-dentarios-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (rowData: EstadosDentariosTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await EstadosDentariosService(estadosDentariosPermId).delete(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Estado dentário eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({
          queryKey: ['estados-dentarios-paginated'],
        })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar estado dentário.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o estado dentário.')
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
      <PageHead title='Estados Dentários | Área Clínica | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Estados Dentários'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            queryClient.invalidateQueries({
              queryKey: ['estados-dentarios-paginated'],
            })
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar estados dentários</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista de estados dentários.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemEstadosDentariosTable
            data={estadosDentarios}
            isLoading={isLoading}
            pageCount={pageCount}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting.length > 0 ? sorting : [{ id: 'codigo', desc: false }]}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={toolbarActions}
            globalSearchColumnId='descricao'
            globalSearchPlaceholder='Procurar por código ou descrição...'
            FilterControls={ListagemEstadosDentariosFilterControls}
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

          <EstadoDentarioViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ['estados-dentarios-paginated'],
              })
            }}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Estado Dentário</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar o estado dentário &quot;
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
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
