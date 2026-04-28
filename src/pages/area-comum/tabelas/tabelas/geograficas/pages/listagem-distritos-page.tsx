import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
import { Plus, List, RotateCw, RefreshCw } from 'lucide-react'
import {
  useGetDistritosPaginated,
  usePrefetchAdjacentDistritos} from '@/pages/base/distritos/queries/distritos-queries'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DistritosListagemTable } from '@/pages/base/distritos/components/distritos-table/distritos-listagem-table'
import { ListagemDistritosFilterControls } from '../components/listagem-distritos-filter-controls'
import { DistritoViewCreateModal } from '../modals/distrito-view-create-modal'
import type { DataTableAction } from '@/components/shared/data-table'
import type { DistritoTableDTO } from '@/types/dtos/base/distritos.dtos'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_DISTRITO_PERM_ID = modules.utilitarios.permissions.distritos.id

type DistritoModalMode = 'view' | 'create' | 'edit'

export function ListagemDistritosPage() {
  const { canAdd } = useAreaComumEntityListPermissions(LISTAGEM_DISTRITO_PERM_ID)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<DistritoModalMode>('view')
  const [viewData, setViewData] = useState<DistritoTableDTO | null>(null)

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
    useGetDataPaginated: useGetDistritosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentDistritos})

  const distritos = data?.info?.data ?? []
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
          queryClient.invalidateQueries({ queryKey: ['distritos-paginated'] })
        },
        variant: 'outline',
      }
    )
    return actions
  }, [canAdd, pageSize, queryClient, handleFiltersChange, handlePaginationChange])

  return (
    <>
      <PageHead title='Listagem de Distritos | Geográficas | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Listagem de Distritos'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['distritos-paginated']})
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar distritos</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de distritos.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <DistritosListagemTable
          data={distritos}
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
          FilterControls={ListagemDistritosFilterControls}
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
          rowActionsFuncionalidadeId={LISTAGEM_DISTRITO_PERM_ID}
        />
        <DistritoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['distritos-paginated'] })
          }}
        />
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}



