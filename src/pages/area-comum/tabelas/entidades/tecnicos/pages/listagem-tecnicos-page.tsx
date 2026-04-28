import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
import type { TecnicoTableDTO } from '@/types/dtos/saude/tecnicos.dtos'
import { ListagemTecnicosTable } from '../components/listagem-tecnicos-table'
import { ListagemTecnicosFilterControls } from '../components/listagem-tecnicos-filter-controls'
import {
  useGetTecnicosPaginated,
  usePrefetchAdjacentTecnicos,
} from '../queries/listagem-tecnicos-queries'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openEntityEditInApp, openPathInApp } from '@/utils/window-utils'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/tecnicos'
const tecnicosPermId = modules.areaComum.permissions.tecnicos.id

export function ListagemTecnicosPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tecnicosPermId)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TecnicoTableDTO | null>(null)
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
    useGetDataPaginated: useGetTecnicosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentTecnicos,
  })

  const tecnicos = data?.info?.data ?? []
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
            onClick: () =>
              openPathInApp(
                navigate,
                addWindow,
                `${LISTAGEM_PATH}/novo`,
                'Novo Técnico',
              ),
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
          queryKey: ['tecnicos-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (item: TecnicoTableDTO) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await TecnicoService('tecnicos').deleteTecnico(String(id))
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Técnico eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['tecnicos-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao eliminar Técnico.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o Técnico.')
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
      <PageHead title='Técnicos | Entidades | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Técnicos'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['tecnicos-paginated'],
                })
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar técnicos</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de técnicos.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemTecnicosTable
          data={tecnicos}
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
          FilterControls={ListagemTecnicosFilterControls}
          hiddenColumns={[]}
          onOpenView={(item) => {
            if (!canView) return
            const id = item.id ?? (item as { Id?: string }).Id
            const nome = item.nome ?? (item as { Nome?: string }).Nome
            if (id) {
              openPathInApp(
                navigate,
                addWindow,
                `${LISTAGEM_PATH}/${id}`,
                nome ? `Técnico: ${nome}` : 'Técnico',
              )
            }
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
                      `${LISTAGEM_PATH}/${id}/editar`,
                      String(id),
                      nome ? `Técnico: ${nome}` : null
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
              <AlertDialogTitle>Eliminar Técnico</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o técnico &quot;
                {itemToDelete?.nome ?? ''}
                &quot;? Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}

