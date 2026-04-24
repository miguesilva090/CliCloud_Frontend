import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
import { Plus, List, RotateCw, RefreshCw, X } from 'lucide-react'
import {
  useGetConcelhosPaginated,
  usePrefetchAdjacentConcelhos} from '@/pages/base/concelhos/queries/concelhos-queries'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConcelhosListagemTable } from '@/pages/base/concelhos/components/concelhos-table/concelhos-listagem-table'
import { ListagemConcelhosFilterControls } from '../components/listagem-concelhos-filter-controls'
import { ConcelhoViewCreateModal } from '../modals/concelho-view-create-modal'
import type { DataTableAction } from '@/components/shared/data-table'
import type { ConcelhoTableDTO } from '@/types/dtos/base/concelhos.dtos'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_CONCELHO_PERM_ID = modules.utilitarios.permissions.concelhos.id

type ConcelhoModalMode = 'view' | 'create' | 'edit'

export function ListagemConcelhosPage() {
  const { canAdd } = useAreaComumEntityListPermissions(LISTAGEM_CONCELHO_PERM_ID)
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ConcelhoModalMode>('view')
  const [viewData, setViewData] = useState<ConcelhoTableDTO | null>(null)

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
    useGetDataPaginated: useGetConcelhosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentConcelhos})

  const concelhos = data?.info?.data ?? []
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
          queryClient.invalidateQueries({ queryKey: ['concelhos-paginated'] })
        },
        variant: 'outline',
      }
    )
    return actions
  }, [canAdd, pageSize, queryClient, handleFiltersChange, handlePaginationChange])

  return (
    <>
      <PageHead title='Listagem de Concelhos | Geográficas | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Listagem de Concelhos</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['concelhos-paginated']})
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
            <AlertTitle>Falha ao carregar concelhos</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de concelhos.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ConcelhosListagemTable
          data={concelhos}
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
          FilterControls={ListagemConcelhosFilterControls}
          hiddenColumns={['nomeFim']}
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
          rowActionsFuncionalidadeId={LISTAGEM_CONCELHO_PERM_ID}
        />
        <ConcelhoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['concelhos-paginated'] })
          }}
        />
      </DashboardPageContainer>
    </>
  )
}



