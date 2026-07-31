import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, List, RotateCw } from 'lucide-react'
import { usePageData, type PageFilter } from '@/utils/page-data-utils'
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
import { useScopedFuncionalidadeId } from '@/hooks/use-scoped-funcionalidade-id'
import { modules } from '@/config/modules'
import { getEntityRoutesForPathname } from '@/config/entity-routes'
import { getTratamentosTecnicoStickyFromListagem } from '../constants/tipo-tecnico'

export function ListagemTecnicosPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const routes = getEntityRoutesForPathname(pathname)
  const listagemPath = routes.tecnicos.listagem
  const sticky = getTratamentosTecnicoStickyFromListagem(listagemPath)
  const entityLabel = sticky?.entityLabel ?? 'Técnico'
  const pageTitle = sticky?.pageTitle ?? 'Técnicos'
  const tecnicosPermId = useScopedFuncionalidadeId(
    modules.areaComum.permissions.tecnicos.id,
    modules.areaAdministrativa.permissions.fisioterapeutas.id
  )
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tecnicosPermId)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TecnicoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const contextFilters = sticky
    ? [{ id: 'tipoTecnico', value: String(sticky.tipoTecnico) }]
    : []

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
    defaultFilters: contextFilters.length ? contextFilters : undefined,
  })

  const ensureStickyTipo = (next: PageFilter[]): PageFilter[] => {
    if (!sticky) return next
    const rest = next.filter((f) => f.id !== 'tipoTecnico')
    return [
      ...rest,
      { id: 'tipoTecnico', value: String(sticky.tipoTecnico) },
    ]
  }

  const onFiltersChangeSticky = (next: PageFilter[]) => {
    handleFiltersChange(ensureStickyTipo(next))
  }

  const resetListFilters = () => {
    handleFiltersChange(contextFilters)
    handlePaginationChange(1, pageSize)
    queryClient.invalidateQueries({
      queryKey: ['tecnicos-paginated'],
    })
  }

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
                routes.tecnicos.novo,
                `Novo ${entityLabel}`,
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
      onClick: () =>
        toast.info(`Listagens de ${pageTitle.toLowerCase()} em desenvolvimento.`),
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: resetListFilters,
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
        toast.success(`${entityLabel} eliminado com sucesso.`)
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['tecnicos-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? `Falha ao eliminar ${entityLabel}.`
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? `Ocorreu um erro ao eliminar o ${entityLabel.toLowerCase()}.`
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
      <PageHead title={`${pageTitle} | Entidades | Tabelas | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title={pageTitle}
            onRefresh={resetListFilters}
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
          onFiltersChange={onFiltersChangeSticky}
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
                routes.tecnicos.detail(String(id)),
                nome ? `${entityLabel}: ${nome}` : entityLabel,
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
                      routes.tecnicos.editar(String(id)),
                      String(id),
                      nome ? `${entityLabel}: ${nome}` : null
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
              <AlertDialogTitle>{`Eliminar ${entityLabel}`}</AlertDialogTitle>
              <AlertDialogDescription>
                {`Tem a certeza que pretende eliminar o ${entityLabel.toLowerCase()} `}
                &quot;
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