import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, RotateCw, List } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePageData } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { EstadoSinistroService } from '@/lib/services/sinistrados/estado-sinistro-service'
import { toast } from '@/utils/toast-utils'
import type { EstadoSinistroDTO } from '@/types/dtos/sinistrados/estado-sinistro.dto'
import { ListagemEstadoSinistroTable } from '../components/listagem-estado-sinistro-table'
import { EstadoSinistroViewEditModal } from '../modals/estado-sinistro-view-edit-modal'
import {
  useGetEstadoSinistroPaginated,
  usePrefetchAdjacentEstadoSinistro,
} from '../queries/listagem-estado-sinistro-queries'

const permId = modules.areaComum.permissions.estadoSinistro.id

export function ListagemEstadoSinistroPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(permId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [selectedRow, setSelectedRow] = useState<EstadoSinistroDTO | null>(null)
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
      useGetDataPaginated: useGetEstadoSinistroPaginated,
      usePrefetchAdjacentData: usePrefetchAdjacentEstadoSinistro,
    })
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['estado-sinistro-paginated'] })

  const handleDelete = async (row: EstadoSinistroDTO) => {
    if (!row?.id) return
    const response = await EstadoSinistroService().delete(row.id)
    if (response.info.status === ResponseStatus.Success) {
      toast.success('Registo eliminado.')
      refresh()
    }
  }

  return (
    <>
      <PageHead title='Estado de Sinistro | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Estado de Sinistro'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar estado de sinistro</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao carregar a lista de estados de sinistro.'}
              </AlertDescription>
            </Alert>
          ) : null}
          <ListagemEstadoSinistroTable
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
              ...(canAdd
                ? [{
                    label: 'Adicionar',
                    icon: <Plus className='h-4 w-4' />,
                    onClick: () => {
                      setModalMode('create')
                      setSelectedRow(null)
                      setModalOpen(true)
                    },
                    variant: 'destructive' as const,
                  }]
                : []),
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
            onOpenView={(row) => {
              setModalMode('view')
              setSelectedRow(row)
              setModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    setModalMode('edit')
                    setSelectedRow(row)
                    setModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={canDelete ? handleDelete : undefined}
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />
          <EstadoSinistroViewEditModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={selectedRow}
            onSuccess={refresh}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
