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
import type { GrupoViasAdministracaoTableDTO } from '@/types/dtos/artigos/grupo-vias-administracao.dtos'
import { ListagemGrupoViasAdministracaoTable } from '../components/listagem-grupo-vias-administracao-table'
import { ListagemGrupoViasAdministracaoFilterControls } from '../components/listagem-grupo-vias-administracao-filter-controls'
import {
  useGetGruposViasAdministracaoPaginated,
  usePrefetchAdjacentGruposViasAdministracao,
} from '../queries/listagem-grupo-vias-administracao-queries'
import { GrupoViasAdministracaoService } from '@/lib/services/artigos/grupo-vias-administracao-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  useCloseCurrentWindowLikeTabBar,
  openEntityEditInApp,
  openPathInApp,
} from '@/utils/window-utils'
import { ResponseStatus } from '@/types/api/responses'

export function ListagemGrupoViasAdministracaoPage() {
  const navigate = useNavigate()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] =
    useState<GrupoViasAdministracaoTableDTO | null>(null)
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
    useGetDataPaginated: useGetGruposViasAdministracaoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentGruposViasAdministracao,
  })

  const grupos = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: () =>
        openPathInApp(
          navigate,
          addWindow,
          '/area-comum/tabelas/stocks/grupo-vias-administracao/novo',
          'Novo Grupo Vias de Administração',
        ),
      variant: 'destructive',
      className:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
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
          queryKey: ['grupos-vias-administracao-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (data: GrupoViasAdministracaoTableDTO) => {
    setItemToDelete(data)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await GrupoViasAdministracaoService().deleteGrupoViasAdministracao(
        String(id),
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Grupo de Vias de Administração eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({
          queryKey: ['grupos-vias-administracao-paginated'],
        })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar Grupo de Vias de Administração.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar o Grupo de Vias de Administração.',
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
      <PageHead title='Grupo Vias de Administração | Stocks | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Grupo Vias de Administração</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['grupos-vias-administracao-paginated'],
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
            <AlertTitle>
              Falha ao carregar grupos de vias de administração
            </AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de grupos de vias de administração.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemGrupoViasAdministracaoTable
          data={grupos}
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
          globalSearchColumnId='descricao'
          globalSearchPlaceholder='Procurar...'
          FilterControls={ListagemGrupoViasAdministracaoFilterControls}
          hiddenColumns={[]}
          onOpenView={(data) => {
            const id = data.id ?? (data as { Id?: string }).Id
            if (!id) return
            openPathInApp(
              navigate,
              addWindow,
              `/area-comum/tabelas/stocks/grupo-vias-administracao/${id}`,
              data.descricao ? `Grupo Vias: ${data.descricao}` : 'Grupo Vias',
            )
          }}
          onOpenEdit={(data) => {
            const id = data.id ?? (data as { Id?: string }).Id
            const descricao =
              data.descricao ?? (data as { Descricao?: string }).Descricao
            if (!id) return
            openEntityEditInApp(
              navigate,
              addWindow,
              `/area-comum/tabelas/stocks/grupo-vias-administracao/${id}/editar`,
              String(id),
              descricao ? `Grupo Vias: ${descricao}` : null,
            )
          }}
          onOpenDelete={handleOpenDelete}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Grupo de Vias de Administração</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o grupo &quot;
                {itemToDelete?.descricao ?? ''}&quot;? Esta ação não pode ser revertida.
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

