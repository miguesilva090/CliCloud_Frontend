import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  useCloseCurrentWindowLikeTabBar,
  openUtenteCreationInApp,
} from '@/utils/window-utils'
import {
  RefreshCw,
  X,
  CreditCard,
  MessageSquare,
  Plus,
  List,
  RotateCw,
} from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
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
import { usePageData } from '@/utils/page-data-utils'
import {
  useGetUtentesPaginated,
  usePrefetchAdjacentUtentes,
  useDeleteUtente,
} from '@/pages/utentes/queries/utentes-queries'
import { UtentesTable } from '@/pages/utentes/components/utentes-table/utentes-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { UtenteTableDTO } from '@/types/dtos/saude/utentes.dtos'
import { toast } from '@/utils/toast-utils'

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/utentes'

export function ListagemUtentesPage() {
  const navigate = useNavigate()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<UtenteTableDTO | null>(null)
  const del = useDeleteUtente({ onSuccessNavigateTo: LISTAGEM_PATH })
  const handleOpenDelete = (row: UtenteTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }
  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    try {
      await del.mutateAsync(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch {
      toast.error('Falha ao eliminar utente.')
    }
  }

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
    useGetDataPaginated: (p, ps, f, s) => useGetUtentesPaginated(p, ps, f, s),
    usePrefetchAdjacentData: (p, ps, f) => usePrefetchAdjacentUtentes(p, ps, f),
  })

  const utentes = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    {
      label: 'RNU',
      icon: null,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Cartão de Cidadão',
      icon: <CreditCard className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Enviar Mensagens',
      icon: <MessageSquare className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => openUtenteCreationInApp(navigate, addWindow),
      variant: 'destructive',
      className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
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
        queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
      },
      variant: 'outline',
    },
  ]

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Utentes</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
              }
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
            <AlertTitle>Falha ao carregar utentes</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de utentes.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <UtentesTable
          data={utentes}
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
          deleteReturnPath={LISTAGEM_PATH}
          onOpenDelete={handleOpenDelete}
          toolbarActions={toolbarActions}
          expandableSearch
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar por nome...'
        />
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!del.isPending) {
              setDeleteDialogOpen(open)
              if (!open) setItemToDelete(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Utente</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o utente &quot;
                {itemToDelete?.nome ?? itemToDelete?.id ?? ''}
                &quot;? Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={del.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirmDelete()
                }}
                disabled={del.isPending}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {del.isPending ? 'A eliminar...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardPageContainer>
    </>
  )
}
