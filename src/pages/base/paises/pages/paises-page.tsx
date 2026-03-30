import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, List, RotateCw } from 'lucide-react'
import {
  useGetPaisesPaginated,
  usePrefetchAdjacentPaises,
} from '@/pages/base/paises/queries/paises-queries'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import Heading from '@/components/shared/heading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PaisesTable } from '../components/paises-table/paises-table'
import type { DataTableAction } from '@/components/shared/data-table'

export function PaisesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
    useGetDataPaginated: useGetPaisesPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentPaises,
  })

  const paises = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => navigate('/utilitarios/tabelas/geograficas/paises/create'),
      variant: 'destructive',
      className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
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
        queryClient.invalidateQueries({ queryKey: ['paises-paginated'] })
      },
      variant: 'outline',
    },
  ]

  return (
    <>
      <PageHead title='Países | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-6'>
          <Heading title='Países' description='Tabela de países' />
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar países</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de países.'}
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !isError && totalRows === 0 ? (
          <Alert className='mb-4'>
            <AlertTitle>Nenhum país encontrado</AlertTitle>
            <AlertDescription>
              Não foi encontrado nenhum país. Verifique os filtros ou adicione
              dados na base.
            </AlertDescription>
          </Alert>
        ) : null}

        <PaisesTable
          data={paises}
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
          expandableSearch
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar...'
        />
      </DashboardPageContainer>
    </>
  )
}

