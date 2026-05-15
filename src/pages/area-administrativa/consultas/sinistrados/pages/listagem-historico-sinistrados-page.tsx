import { useQueryClient } from '@tanstack/react-query'
import { RotateCw, List, ArchiveRestore } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePageData } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { SinistradoService } from '@/lib/services/sinistrados/sinistrado-service'
import { ListagemSinistradosTable } from '../components/listagem-sinistrados-table'
import {
  useGetSinistradosPaginated,
  usePrefetchAdjacentSinistrados,
} from '../queries/listagem-sinistrados-queries'
const permId = modules.areaComum.permissions.historicoSinistrados.id
const listPermId = modules.areaAdministrativa.permissions.sinistrados.id

export function ListagemHistoricoSinistradosPage() {
  const { canView, canChange } = useAreaComumEntityListPermissions(permId)
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
  } =
    usePageData({
      useGetDataPaginated: useGetSinistradosPaginated,
      usePrefetchAdjacentData: usePrefetchAdjacentSinistrados,
      defaultFilters: [{ id: 'historico', value: '1' }],
    })
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['sinistrados-paginated'] })

  return (
    <>
      <PageHead title='Histórico de Sinistrados | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Histórico de Sinistrados'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar histórico</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao carregar o histórico de sinistrados.'}
              </AlertDescription>
            </Alert>
          ) : null}
          <ListagemSinistradosTable
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
                label: 'Listagens',
                icon: <List className='h-4 w-4' />,
                onClick: () => {},
                variant: 'outline' as const,
              },
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline' as const,
              },
            ]}
            onOpenView={() => {}}
            onOpenEdit={undefined}
            onOpenDelete={undefined}
            renderExtraActions={(row) =>
              canChange ? (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  title='Restaurar sinistrado'
                  onClick={async () => {
                    const response = await SinistradoService(listPermId).restoreFromHistory(row.id)
                    if (response.info.status === ResponseStatus.Success) {
                      toast.success('Sinistrado restaurado.')
                      refresh()
                    }
                  }}
                >
                  <ArchiveRestore className='h-4 w-4' />
                </Button>
              ) : null
            }
            canView={canView}
            canChange={canChange}
            canDelete={false}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
