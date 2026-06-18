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
import type { ArmazemTableDTO } from '@/types/dtos/stocks/armazem.dtos'
import { ListagemArmazensTable } from '../components/listagem-armazens-table'
import { ListagemArmazensFilterControls } from '../components/listagem-armazens-filter-controls'
import {
  useGetArmazensPaginated,
  usePrefetchAdjacentArmazens,
} from '../queries/listagem-armazens-queries'
import { ArmazemViewCreateModal } from '../modals/armazem-view-create-modal'
import { ArmazemService } from '@/lib/services/stocks/armazem-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

type ArmazemModalMode = 'view' | 'create' | 'edit'

export function ListagemArmazensPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tabelasPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ArmazemModalMode>('view')
  const [viewData, setViewData] = useState<ArmazemTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ArmazemTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [apenasArmazemGeral, setApenasArmazemGeral] = useState(false)

  const filtroArmazemGeral = apenasArmazemGeral ? true : undefined

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
    useGetDataPaginated: (p, ps, f, s) =>
      useGetArmazensPaginated(p, ps, f, s, filtroArmazemGeral),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentArmazens(p, ps, f, filtroArmazemGeral),
  })

  const armazens = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidateListas = () => {
    void queryClient.invalidateQueries({ queryKey: ['armazens-paginated'] })
    void queryClient.invalidateQueries({ queryKey: ['armazens-light'] })
  }

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
      variant: 'outline' as const,
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        invalidateListas()
      },
      variant: 'outline' as const,
    },
  ]

  const handleOpenDelete = (row: ArmazemTableDTO) => {
    if (row.armazemGeral) {
      toast.error('O armazém geral não pode ser eliminado.')
      return
    }
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await ArmazemService().deleteArmazem(itemToDelete.id)
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Armazém eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar o armazém.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o armazém.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title='Armazéns | Artigos | Faturação | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Armazéns'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            invalidateListas()
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar armazéns</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista de armazéns.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemArmazensTable
            data={armazens}
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
            globalSearchColumnId='nome'
            globalSearchPlaceholder='Procurar por nome...'
            FilterControls={ListagemArmazensFilterControls}
            apenasArmazemGeral={apenasArmazemGeral}
            onApenasArmazemGeralChange={setApenasArmazemGeral}
            onOpenView={(row) => {
              if (!canView) return
              setViewData(row)
              setModalMode('view')
              setModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    setViewData(row)
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

          <ArmazemViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            onSuccess={invalidateListas}
          />

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              if (!isDeleting) {
                setDeleteDialogOpen(open)
                if (!open) setItemToDelete(null)
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar armazém</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar &quot;
                  {itemToDelete?.nome ?? itemToDelete?.codigo ?? ''}
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
                    void handleConfirmDelete()
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