import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  usePageData,
} from '@/utils/page-data-utils'
import { ListagemLoteDirectAgregadosTable } from '../components/listagem-lote-direct-agregados-table'
import {
  useGetLoteDirectAgregadosPaginated,
  usePrefetchAdjacentLoteDirectAgregados,
} from '../queries/listagem-lote-direct-agregados-queries'

export function ListagemLoteDirectAgregadosPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const appliedUrlFilters = useRef(false)

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
    useGetDataPaginated: useGetLoteDirectAgregadosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentLoteDirectAgregados,
  })

  useEffect(() => {
    if (appliedUrlFilters.current) return
    const mes = searchParams.get('mes')
    const ano = searchParams.get('ano')
    if (!mes && !ano) return

    appliedUrlFilters.current = true
    let next = filters
    if (mes) next = buildFiltersWithValue(next, 'mes', mes)
    if (ano) next = buildFiltersWithValue(next, 'ano', ano)
    applyFiltersIfChanged(filters, next, handleFiltersChange)
  }, [searchParams, filters, handleFiltersChange])

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['lote-direct-agregados-paginated'] })

  return (
    <>
      <PageHead title='Lotes Agregados (Credenciais) | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Lotes Agregados — Credenciais (Consultas)'>
          <p className='mb-4 text-sm text-muted-foreground'>
            Resultado da correção de lotes. Estes agregados alimentam a faturação
            SNS (especialidades).
          </p>

          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar lotes agregados</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar a lista.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemLoteDirectAgregadosTable
            data={data?.info?.data ?? []}
            isLoading={isLoading}
            pageCount={data?.info?.totalPages ?? 0}
            totalRows={data?.info?.totalCount ?? 0}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={[
              {
                label: 'Lançamentos',
                icon: <ArrowLeft className='h-4 w-4' />,
                onClick: () => navigate('/area-administrativa/credenciais'),
                variant: 'outline' as const,
              },
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline' as const,
              },
            ]}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
