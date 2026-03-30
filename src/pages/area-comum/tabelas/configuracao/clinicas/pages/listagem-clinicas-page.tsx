import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, X } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { DataTableAction } from '@/components/shared/data-table'
import { ListagemClinicasTable } from '../components/listagem-clinicas-table'
import { ListagemClinicasFilterControls } from '../components/listagem-clinicas-filter-controls'
import {
  useGetClinicasPaginated,
  usePrefetchAdjacentClinicas,
  useSetDefaultClinica,
} from '../queries/clinicas-queries'
import {
  openEntityEditInApp,
  openPathInApp,
  useCloseCurrentWindowLikeTabBar,
} from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'

const LISTAGEM_PATH = '/area-comum/tabelas/configuracao/clinicas'

export function ListagemClinicasPage() {
  const navigate = useNavigate()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const setDefaultClinica = useSetDefaultClinica()

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
    useGetDataPaginated: useGetClinicasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentClinicas,
  })

  const clinicas = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Atualizar',
      icon: <RefreshCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({ queryKey: ['clinicas-paginated'] })
      },
      variant: 'outline',
    },
  ]

  return (
    <>
      <PageHead title='Configuração| CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Definições da Clínica</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['clinicas-paginated'],
                })
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
              title='Voltar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar clínicas</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de clínicas.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemClinicasTable
          data={clinicas}
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
          globalSearchPlaceholder='Procurar...'
          FilterControls={ListagemClinicasFilterControls}
          hiddenColumns={[]}
          onOpenView={(item) => {
            const id = item.id
            const nome = item.nome
            openPathInApp(
              navigate,
              addWindow,
              `${LISTAGEM_PATH}/${id}`,
              nome ? `Clínica: ${nome}` : 'Clínica',
            )
          }}
          onOpenEdit={(item) => {
            const id = item.id
            const nome = item.nome
            openEntityEditInApp(
              navigate,
              addWindow,
              `${LISTAGEM_PATH}/${id}/editar`,
              String(id),
              nome ? `Clínica: ${nome}` : null,
            )
          }}
          onSetDefault={(id, porDefeito) => {
            setDefaultClinica.mutate({ id, porDefeito })
          }}
        />
      </DashboardPageContainer>
    </>
  )
}

