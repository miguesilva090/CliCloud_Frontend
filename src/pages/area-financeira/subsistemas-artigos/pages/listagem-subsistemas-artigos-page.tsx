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
import type { SubsistemaArtigoTableDTO } from '@/types/dtos/stocks/subsistema-artigo.dtos'
import { ListagemSubsistemasArtigosTable } from '../components/listagem-subsistemas-artigos-table'
import { ListagemSubsistemasArtigosFilterControls } from '../components/listagem-subsistemas-artigos-filter-controls'
import {
  useGetSubsistemasArtigoPaginated,
  usePrefetchAdjacentSubsistemasArtigo,
} from '../queries/listagem-subsistemas-artigos-queries'
import { SubsistemaArtigoViewCreateModal } from '../modals/subsistema-artigo-view-create-modal'
import { SubsistemaArtigoService } from '@/lib/services/stocks/subsistema-artigo-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

type ModalMode = 'view' | 'create' | 'edit'

export function ListagemSubsistemasArtigosPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tabelasPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [viewData, setViewData] = useState<SubsistemaArtigoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] =
    useState<SubsistemaArtigoTableDTO | null>(null)
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
    useGetDataPaginated: useGetSubsistemasArtigoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentSubsistemasArtigo,
  })

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidateListas = () => {
    void queryClient.invalidateQueries({
      queryKey: ['subsistemas-artigo-paginated'],
    })
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

  const handleOpenDelete = (row: SubsistemaArtigoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await SubsistemaArtigoService().deleteSubsistemaArtigo(
        itemToDelete.id,
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Subsistema de artigo eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        invalidateListas()
      } else {
        toast.error(
          response.info.messages?.['$']?.[0] ??
            'Falha ao eliminar o subsistema de artigo.',
        )
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar o subsistema de artigo.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title='Subsistemas de Artigos | Artigos | Faturação | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Subsistemas de Artigos'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            invalidateListas()
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar subsistemas de artigos</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao pedir a lista de subsistemas de artigos.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemSubsistemasArtigosTable
            data={rows}
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
            globalSearchColumnId='artigoDescricao'
            globalSearchPlaceholder='Procurar por artigo, organismo ou cartão...'
            FilterControls={ListagemSubsistemasArtigosFilterControls}
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

          <SubsistemaArtigoViewCreateModal
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
                <AlertDialogTitle>Eliminar subsistema de artigo</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar &quot;
                  {itemToDelete?.codigoCartaoInstituicao ??
                    itemToDelete?.artigoDescricao ??
                    ''}
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
