import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
import type { OrganismoTableDTO } from '@/types/dtos/saude/organismos.dtos'
import { ListagemOrganismosTable } from '../components/listagem-organismos-table'
import { ListagemOrganismosFilterControls } from '../components/listagem-organismos-filter-controls'
import {
  useGetOrganismosPaginated,
  usePrefetchAdjacentOrganismos,
} from '../queries/listagem-organismos-queries'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  useCloseCurrentWindowLikeTabBar,
  openOrganismoCreationInApp,
  openEntityEditInApp,
  openPathInApp,
} from '@/utils/window-utils'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const organismosPermId = modules.areaComum.permissions.organismos.id

export function ListagemOrganismosPage() {
  const navigate = useNavigate()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(organismosPermId)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<OrganismoTableDTO | null>(
    null
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
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetOrganismosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentOrganismos,
  })

  const organismos = data?.info?.data ?? []
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
            onClick: () => openOrganismoCreationInApp(navigate, addWindow),
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
          queryKey: ['organismos-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (item: OrganismoTableDTO) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await OrganismoService().deleteOrganismo(String(id))
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Organismo eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['organismos-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao eliminar Organismo.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar o Organismo.'
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
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Organismos</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['organismos-paginated'],
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
              title='Voltar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar organismos</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de organismos.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemOrganismosTable
          data={organismos}
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
          expandableSearch
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar...'
          FilterControls={ListagemOrganismosFilterControls}
          hiddenColumns={[]}
          onOpenView={(item) => {
            if (!canView) return
            const id = item.id ?? (item as { Id?: string }).Id
            const nome = item.nome ?? (item as { Nome?: string }).Nome
            if (id)
              openPathInApp(
                navigate,
                addWindow,
                `/organismos/${id}`,
                nome ? `Organismo: ${nome}` : 'Organismo'
              )
          }}
          onOpenEdit={
            canChange
              ? (item) => {
                  const id = item.id ?? (item as { Id?: string }).Id
                  const nome = item.nome ?? (item as { Nome?: string }).Nome
                  if (id)
                    openEntityEditInApp(
                      navigate,
                      addWindow,
                      `/organismos/${id}/editar`,
                      String(id),
                      nome ? `Organismo: ${nome}` : null
                    )
                }
              : undefined
          }
          onOpenDelete={canDelete ? handleOpenDelete : undefined}
          canView={canView}
          canChange={canChange}
          canDelete={canDelete}
        />
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={handleCloseDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Organismo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o organismo &quot;
                {itemToDelete?.nome ?? ''}
                &quot;? Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
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
