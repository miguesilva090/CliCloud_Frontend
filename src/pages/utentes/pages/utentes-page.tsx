import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CreditCard, MessageSquare, Plus, List, RotateCw } from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import Heading from '@/components/shared/heading'
import { PageHead } from '@/components/shared/page-head'
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
import { useNavigate } from 'react-router-dom'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openUtenteCreationInApp } from '@/utils/window-utils'
import { usePageData } from '@/utils/page-data-utils'
import {
  UTENTE_LIST_ALLOWED_SORT_IDS,
  useGetUtentesPaginated,
  usePrefetchAdjacentUtentes,
  useDeleteUtente,
} from '../queries/utentes-queries'
import { UtentesTable } from '../components/utentes-table/utentes-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { UtenteTableDTO } from '@/types/dtos/saude/utentes.dtos'
import { toast } from '@/utils/toast-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const utentesPermId = modules.areaComum.permissions.utentes.id

export function UtentesPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canAdd } = useAreaComumEntityListPermissions(utentesPermId)
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<UtenteTableDTO | null>(null)
  const del = useDeleteUtente({ onSuccessNavigateTo: '/utentes' })
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

  useEffect(() => {
    const cleaned = sorting.filter((s) =>
      UTENTE_LIST_ALLOWED_SORT_IDS.has(s.id)
    )
    const same =
      cleaned.length === sorting.length &&
      cleaned.every(
        (s, i) => s.id === sorting[i]?.id && s.desc === sorting[i]?.desc
      )
    if (!same) {
      handleSortingChange(cleaned)
    }
  }, [sorting, handleSortingChange])

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
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () => openUtenteCreationInApp(navigate, addWindow),
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
        // Limpa filtros/pesquisa e volta à 1ª página, depois faz refresh dos dados
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
        <div className='flex items-center justify-between gap-4 mb-6'>
          <Heading
            title='Utentes'
            description='Gestão de utentes'
          />
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar utentes</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de utentes.'}
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !isError && totalRows === 0 ? (
          <Alert className='mb-4'>
            <AlertTitle>Utente não encontrado</AlertTitle>
            <AlertDescription>
              Não foi encontrado nenhum utente com o nome pesquisado.
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
          deleteReturnPath='/utentes'
          onOpenDelete={handleOpenDelete}
          toolbarActions={toolbarActions}
          expandableSearch
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar...'
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
                Tem a certeza que pretende eliminar o utente &quot;{itemToDelete?.nome ?? itemToDelete?.id ?? ''}&quot;? Esta ação não pode ser revertida.
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

