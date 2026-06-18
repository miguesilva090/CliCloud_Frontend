import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
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
import type { FamiliaArtigoTableDTO } from '@/types/dtos/stocks/familia-artigo.dtos'
import { ListagemFamiliasArtigoTable } from '../components/listagem-familias-artigo-table'
import { ListagemFamiliasArtigoFilterControls } from '../components/listagem-familias-artigo-filter-controls'
import {
  useGetFamiliaArtigoAncestors,
  useGetFamiliasArtigoPaginated,
  usePrefetchAdjacentFamiliasArtigo,
} from '../queries/listagem-familias-artigo-queries'
import { FamiliaArtigoViewCreateModal } from '../modals/familia-artigo-view-create-modal'
import { FamiliaArtigoService } from '@/lib/services/stocks/familia-artigo-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { navigateManagedWindow } from '@/utils/window-utils'

const BASE_PATH = '/area-financeira/faturacao/tabelas/familias-artigo'
const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

type FamiliaArtigoModalMode = 'view' | 'create' | 'edit'

function getListagemTitle(parentNivel: number | null): string {
  if (parentNivel === 1) return 'Classes de Artigos'
  if (parentNivel === 2) return 'Sub-Classes de Artigos'
  return 'Famílias de Artigos'
}

export function ListagemFamiliasArtigoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get('parentId') || undefined

  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tabelasPermId)
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<FamiliaArtigoModalMode>('view')
  const [viewData, setViewData] = useState<FamiliaArtigoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<FamiliaArtigoTableDTO | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: ancestorsRes } = useGetFamiliaArtigoAncestors(parentId)
  const ancestors = ancestorsRes?.info?.data ?? []

  const parentNivel =
    ancestors.length > 0 ? ancestors[ancestors.length - 1].nivel : null
  const pageTitle = getListagemTitle(parentNivel)

  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        title: 'Famílias de Artigos',
        link: BASE_PATH,
      },
    ]
    ancestors.forEach((item) => {
      items.push({
        title: item.descricao,
        link: `${BASE_PATH}?parentId=${item.id}`,
      })
    })
    return items
  }, [ancestors])

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
      useGetFamiliasArtigoPaginated(p, ps, f, s, parentId),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentFamiliasArtigo(p, ps, f, parentId),
  })

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const invalidateListas = () => {
    void queryClient.invalidateQueries({
      queryKey: ['familias-artigo-paginated'],
    })
    void queryClient.invalidateQueries({ queryKey: ['familias-artigo-light'] })
    void queryClient.invalidateQueries({
      queryKey: ['familias-artigo-ancestors'],
    })
  }

  const handleNavigateChildren = (row: FamiliaArtigoTableDTO) => {
    if (row.nivel >= 3) return
    navigateManagedWindow(
      navigate,
      `${BASE_PATH}?parentId=${row.id}`,
      { title: row.descricao },
    )
  }

  const handleBack = () => {
    if (ancestors.length > 1) {
      const previous = ancestors[ancestors.length - 2]
      navigateManagedWindow(navigate, `${BASE_PATH}?parentId=${previous.id}`)
      return
    }
    if (ancestors.length === 1) {
      navigateManagedWindow(navigate, BASE_PATH)
    }
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

  const handleOpenDelete = (row: FamiliaArtigoTableDTO) => {
    if (row.temFilhos) {
      toast.error('Registo referenciado por filhos e não pode ser eliminado.')
      return
    }
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await FamiliaArtigoService().deleteFamiliaArtigo(
        itemToDelete.id,
      )
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Registo eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        invalidateListas()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar o registo.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o registo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title={`${pageTitle} | Artigos | Faturação | Área Financeira | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={pageTitle}
          showBackButton={ancestors.length > 0}
          onBack={ancestors.length > 0 ? handleBack : undefined}
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            invalidateListas()
          }}
        >
          <div className='mb-4'>
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar famílias de artigo</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao pedir a lista de famílias de artigo.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemFamiliasArtigoTable
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
            globalSearchColumnId='descricao'
            globalSearchPlaceholder='Procurar por descrição...'
            FilterControls={ListagemFamiliasArtigoFilterControls}
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
            onOpenChildren={handleNavigateChildren}
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />

          <FamiliaArtigoViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            parentId={parentId}
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
                <AlertDialogTitle>Eliminar registo</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar &quot;
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