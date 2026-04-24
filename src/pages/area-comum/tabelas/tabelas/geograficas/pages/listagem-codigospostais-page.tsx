import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
import { Plus, List, RotateCw, RefreshCw, X } from 'lucide-react'
import {
  useGetCodigosPostaisPaginated,
  usePrefetchAdjacentCodigosPostais} from '@/pages/base/codigospostais/queries/codigospostais-queries'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CodigosPostaisListagemTable } from '@/pages/base/codigospostais/components/codigospostais-table/codigospostais-listagem-table'
import { ListagemCodigosPostaisFilterControls } from '../components/listagem-codigospostais-filter-controls'
import { CodigoPostalViewCreateModal } from '../modals/codigopostal-view-create-modal'
import type { DataTableAction } from '@/components/shared/data-table'
import type { CodigoPostalTableDTO } from '@/types/dtos/base/codigospostais.dtos'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_CODIGO_POSTAL_PERM_ID =
  modules.utilitarios.permissions.codigospostais.id

type CodigoPostalModalMode = 'view' | 'create' | 'edit'

export function ListagemCodigosPostaisPage() {
  const { canAdd } = useAreaComumEntityListPermissions(
    LISTAGEM_CODIGO_POSTAL_PERM_ID
  )
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CodigoPostalModalMode>('view')
  const [viewData, setViewData] = useState<CodigoPostalTableDTO | null>(null)

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
    useGetDataPaginated: useGetCodigosPostaisPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentCodigosPostais})

  const codigosPostais = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = useMemo(() => {
    const actions: DataTableAction[] = []
    if (canAdd) {
      actions.push({
        label: 'Adicionar',
        icon: <Plus className='h-4 w-4' />,
        onClick: () => {
          setViewData(null)
          setModalMode('create')
          setModalOpen(true)
        },
        variant: 'destructive',
        className:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      })
    }
    actions.push(
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
            queryKey: ['codigospostais-paginated'],
          })
        },
        variant: 'outline',
      }
    )
    return actions
  }, [canAdd, pageSize, queryClient, handleFiltersChange, handlePaginationChange])

  return (
    <>
      <PageHead title='Listagem de Códigos Postais | Geográficas | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Listagem de Códigos Postais</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['codigospostais-paginated']})
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
            <AlertTitle>Falha ao carregar códigos postais</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de códigos postais.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <CodigosPostaisListagemTable
          data={codigosPostais}
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
          globalSearchPlaceholder='Procurar por código...'
          FilterControls={ListagemCodigosPostaisFilterControls}
          hiddenColumns={['codigoFim']}
          onOpenView={(data) => {
            setViewData(data)
            setModalMode('view')
            setModalOpen(true)
          }}
          onOpenEdit={(data) => {
            setViewData(data)
            setModalMode('edit')
            setModalOpen(true)
          }}
          rowActionsFuncionalidadeId={LISTAGEM_CODIGO_POSTAL_PERM_ID}
        />
        <CodigoPostalViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['codigospostais-paginated']})
          }}
        />
      </DashboardPageContainer>
    </>
  )
}



