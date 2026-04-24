import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
import { Plus, List, RotateCw, RefreshCw, X } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { DataTableAction } from '@/components/shared/data-table'
import type { CategoriaEspecialidadeTableDTO } from '@/types/dtos/especialidades/categoria-especialidade.dtos'
import { ListagemCategoriasEspecialidadesTable } from '../components/listagem-categorias-especialidades-table'
import { ListagemCategoriasEspecialidadesFilterControls } from '../components/listagem-categorias-especialidades-filter-controls'
import {
  useGetCategoriasEspecialidadesPaginated,
  usePrefetchAdjacentCategoriasEspecialidades} from '../queries/listagem-categorias-especialidades-queries'
import { CategoriaEspecialidadeViewCreateModal } from '../modals/categoria-especialidade-view-create-modal'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const categoriasEspecialidadesPermId =
  modules.areaComum.permissions.categoriasEspecialidades.id

type CategoriaModalMode = 'view' | 'create' | 'edit'

export function ListagemCategoriasEspecialidadesPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(categoriasEspecialidadesPermId)
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CategoriaModalMode>('view')
  const [viewData, setViewData] = useState<CategoriaEspecialidadeTableDTO | null>(
    null,
  )

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
    handleSortingChange} = usePageData({
    useGetDataPaginated: useGetCategoriasEspecialidadesPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentCategoriasEspecialidades})

  const categorias = data?.info?.data ?? []
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
      variant: 'outline'},
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({
          queryKey: ['categorias-especialidades-paginated']})
      },
      variant: 'outline'},
  ]

  return (
    <>
      <PageHead title='Categorias das Especialidades | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>
            Categorias das Especialidades
          </h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['categorias-especialidades-paginated']})
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
              title='Fechar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar categorias</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de categorias das especialidades.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemCategoriasEspecialidadesTable
          data={categorias}
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
          FilterControls={ListagemCategoriasEspecialidadesFilterControls}
          hiddenColumns={[]}
          onOpenView={(data) => {
            if (!canView) return
            setViewData(data)
            setModalMode('view')
            setModalOpen(true)
          }}
          onOpenEdit={
            canChange
              ? (data) => {
                  setViewData(data)
                  setModalMode('edit')
                  setModalOpen(true)
                }
              : undefined
          }
          canView={canView}
          canChange={canChange}
          canDelete={canDelete}
        />
        <CategoriaEspecialidadeViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['categorias-especialidades-paginated']})
          }}
        />
      </DashboardPageContainer>
    </>
  )
}



