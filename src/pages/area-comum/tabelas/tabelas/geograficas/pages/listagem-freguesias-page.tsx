import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
import { Plus, List, RotateCw, RefreshCw } from 'lucide-react'
import {
  useGetFreguesiasPaginated,
  usePrefetchAdjacentFreguesias} from '@/pages/base/freguesias/queries/freguesias-queries'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FreguesiasListagemTable } from '@/pages/base/freguesias/components/freguesias-table/freguesias-listagem-table'
import { ListagemFreguesiasFilterControls } from '../components/listagem-freguesias-filter-controls'
import { FreguesiaViewCreateModal } from '../modals/freguesia-view-create-modal'
import type { DataTableAction } from '@/components/shared/data-table'
import type { FreguesiaTableDTO } from '@/types/dtos/base/freguesias.dtos'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_FREGUESIA_PERM_ID = modules.utilitarios.permissions.freguesias.id

type FreguesiaModalMode = 'view' | 'create' | 'edit'

export function ListagemFreguesiasPage() {
  const { canAdd } = useAreaComumEntityListPermissions(LISTAGEM_FREGUESIA_PERM_ID)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<FreguesiaModalMode>('view')
  const [viewData, setViewData] = useState<FreguesiaTableDTO | null>(null)

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
    useGetDataPaginated: useGetFreguesiasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentFreguesias})

  const freguesias = data?.info?.data ?? []
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
          queryClient.invalidateQueries({ queryKey: ['freguesias-paginated'] })
        },
        variant: 'outline',
      }
    )
    return actions
  }, [canAdd, pageSize, queryClient, handleFiltersChange, handlePaginationChange])

  return (
    <>
      <PageHead title='Listagem de Freguesias | Geográficas | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Listagem de Freguesias'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({ queryKey: ['freguesias-paginated'] })
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar freguesias</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de freguesias.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <FreguesiasListagemTable
          data={freguesias}
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
          FilterControls={ListagemFreguesiasFilterControls}
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
          rowActionsFuncionalidadeId={LISTAGEM_FREGUESIA_PERM_ID}
        />
        <FreguesiaViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={viewData}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['freguesias-paginated'] })
          }}
        />
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}



