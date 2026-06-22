import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  openArtigoCreationInApp,
  openArtigoEditInApp,
} from '@/utils/window-utils'
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
import type {
  ArtigoTableDTO,
  TipoArtigoStocks,
} from '@/types/dtos/stocks/artigo.dtos'
import { ListagemArtigosTable } from '../components/listagem-artigos-table'
import { ListagemArtigosFilterControls } from '../components/listagem-artigos-filter-controls'
import {
  useGetArtigosPaginated,
  usePrefetchAdjacentArtigos,
} from '../queries/listagem-artigos-queries'
import { ArtigoService } from '@/lib/services/stocks/artigo-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

export function ListagemArtigosPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tabelasPermId)
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ArtigoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [apenasInativos, setApenasInativos] = useState(false)
  const [apenasDescontinuados, setApenasDescontinuados] = useState(false)
  const [tipoArtigo, setTipoArtigo] = useState<TipoArtigoStocks | undefined>(
    undefined,
  )

  const filtroInativo = apenasInativos ? true : undefined
  const filtroDescontinuado = apenasDescontinuados ? true : undefined

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
      useGetArtigosPaginated(
        p,
        ps,
        f,
        s,
        filtroInativo,
        filtroDescontinuado,
        tipoArtigo,
      ),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentArtigos(
        p,
        ps,
        f,
        filtroInativo,
        filtroDescontinuado,
        tipoArtigo,
      ),
  })

  const artigos = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidateListas = () => {
    void queryClient.invalidateQueries({ queryKey: ['artigos-paginated'] })
    void queryClient.invalidateQueries({ queryKey: ['artigos-light'] })
  }

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () => openArtigoCreationInApp(navigate, addWindow),
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

  const handleOpenDelete = (row: ArtigoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await ArtigoService().deleteArtigo(itemToDelete.id)
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Artigo eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar o artigo.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o artigo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title='Artigos | Faturação | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Artigos'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            invalidateListas()
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar artigos</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista de artigos.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemArtigosTable
            data={artigos}
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
            globalSearchPlaceholder='Procurar por descrição...'
            FilterControls={ListagemArtigosFilterControls}
            apenasInativos={apenasInativos}
            onApenasInativosChange={setApenasInativos}
            apenasDescontinuados={apenasDescontinuados}
            onApenasDescontinuadosChange={setApenasDescontinuados}
            tipoArtigo={tipoArtigo}
            onTipoArtigoChange={setTipoArtigo}
            onOpenView={(row) => {
              if (!canView || !row.id) return
              openArtigoEditInApp(
                navigate,
                addWindow,
                row.id,
                row.descricao,
                'view',
              )
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    if (!row.id) return
                    openArtigoEditInApp(
                      navigate,
                      addWindow,
                      row.id,
                      row.descricao,
                      'edit',
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
            onOpenChange={(open) => {
              if (!isDeleting) {
                setDeleteDialogOpen(open)
                if (!open) setItemToDelete(null)
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar artigo</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar &quot;
                  {itemToDelete?.descricao ?? itemToDelete?.numeroArtigo ?? ''}
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
