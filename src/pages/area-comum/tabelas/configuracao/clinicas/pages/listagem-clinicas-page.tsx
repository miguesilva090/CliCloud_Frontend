import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
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
import { openEntityEditInApp, openPathInApp } from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_PATH = '/area-comum/tabelas/configuracao/clinicas'

const configuracaoClinicaPermId =
  modules.areaComum.permissions.configuracoesClinica.id

export function ListagemClinicasPage() {
  const { canAdd } = useAreaComumEntityListPermissions(configuracaoClinicaPermId)
  const navigate = useNavigate()
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
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () =>
              openPathInApp(
                navigate,
                addWindow,
                `${LISTAGEM_PATH}/novo/editar`,
                'Nova clínica',
              ),
            variant: 'destructive' as const,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          },
        ]
      : []),
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
        <AreaComumListagemPageShell
            title='Definições da Clínica'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['clinicas-paginated'],
                })
            }}
        >

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
          expandableSearch
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
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}

