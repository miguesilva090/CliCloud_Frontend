import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, RotateCw } from 'lucide-react'
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
import type { MotivoRetencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-retencao.dtos'
import { ListagemMotivosRetencaoTable } from '../components/listagem-motivos-retencao-table'
import { ListagemMotivosRetencaoFilterControls } from '../components/listagem-motivos-retencao-filter-controls'
import {
  useGetMotivosRetencaoPaginated,
  usePrefetchAdjacentMotivosRetencao,
} from '../queries/listagem-motivos-retencao-queries'
import { MotivoRetencaoViewCreateModal } from '../modals/motivo-retencao-view-create-modal'
import { MotivoRetencaoService } from '@/lib/services/taxas-iva/motivo-retencao-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const taxasIvaPermId = modules.areaComum.permissions.taxasIva.id

type MotivoRetencaoModalMode = 'view' | 'create' | 'edit'

export function ListagemMotivosRetencaoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(taxasIvaPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<MotivoRetencaoModalMode>('view')
  const [viewData, setViewData] = useState<MotivoRetencaoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MotivoRetencaoTableDTO | null>(
    null,
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
    useGetDataPaginated: useGetMotivosRetencaoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentMotivosRetencao,
  })

  const motivos = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidateListas = () => {
    void queryClient.invalidateQueries({ queryKey: ['motivos-retencao-paginated'] })
    void queryClient.invalidateQueries({ queryKey: ['motivos-retencao-light'] })
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

  const handleOpenDelete = (row: MotivoRetencaoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await MotivoRetencaoService().deleteMotivoRetencao(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Motivo de retenção eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar o motivo de retenção.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o motivo de retenção.')
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
      <PageHead title='Motivos de Retenção | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Motivo Retenção na Fonte'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            invalidateListas()
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar motivos de retenção</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao pedir a lista de motivos de retenção.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemMotivosRetencaoTable
            data={motivos}
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
            globalSearchColumnId='codigo'
            globalSearchPlaceholder='Pesquisa...'
            expandableSearch
            FilterControls={ListagemMotivosRetencaoFilterControls}
            hiddenColumns={[]}
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
          <MotivoRetencaoViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            onSuccess={invalidateListas}
          />
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={handleCloseDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar motivo de retenção</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar o motivo &quot;
                  {itemToDelete?.descricao ?? itemToDelete?.codigo ?? ''}
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
