import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
import {
  useGetRuasPaginated,
  usePrefetchAdjacentRuas,
} from '@/pages/base/ruas/queries/ruas-queries'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RuasListagemTable } from '@/pages/base/ruas/components/ruas-table/ruas-listagem-table'
import { ListagemRuasFilterControls } from '../components/listagem-ruas-filter-controls'
import { RuaViewCreateModal } from '../modals/rua-view-create-modal'
import type { DataTableAction } from '@/components/shared/data-table'
import type { RuaTableDTO } from '@/types/dtos/base/ruas.dtos'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_RUA_PERM_ID = modules.utilitarios.permissions.ruas.id

type RuaModalMode = 'view' | 'create' | 'edit'

export function ListagemRuasPage() {
  const [searchParams] = useSearchParams()
  const { canAdd } = useAreaComumEntityListPermissions(LISTAGEM_RUA_PERM_ID)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<RuaModalMode>('view')
  const [viewData, setViewData] = useState<RuaTableDTO | null>(null)

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
    useGetDataPaginated: useGetRuasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentRuas,
  })

  const ruas = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''
  const createContext = useMemo(
    () => ({
      paisId: searchParams.get('paisId') ?? '',
      distritoId: searchParams.get('distritoId') ?? '',
      concelhoId: searchParams.get('concelhoId') ?? '',
      freguesiaId: searchParams.get('freguesiaId') ?? '',
      codigoPostalId: searchParams.get('codigoPostalId') ?? '',
    }),
    [searchParams]
  )

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
          queryClient.invalidateQueries({ queryKey: ['ruas-paginated'] })
        },
        variant: 'outline',
      }
    )
    return actions
  }, [canAdd, pageSize, queryClient, handleFiltersChange, handlePaginationChange])

  return (
    <>
      <PageHead title='Listagem de Ruas | Geográficas | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Listagem de Ruas'
          onRefresh={() => {
            handleFiltersChange([])
            handlePaginationChange(1, pageSize)
            queryClient.invalidateQueries({ queryKey: ['ruas-paginated'] })
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar ruas</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista de ruas.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <RuasListagemTable
            data={ruas}
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
            FilterControls={ListagemRuasFilterControls}
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
            rowActionsFuncionalidadeId={LISTAGEM_RUA_PERM_ID}
          />
          <RuaViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={viewData}
            context={createContext}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['ruas-paginated'] })
            }}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
