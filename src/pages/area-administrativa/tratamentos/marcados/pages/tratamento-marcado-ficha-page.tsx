import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { TratamentoService } from '@/lib/services/tratamentos/tratamento-service'
import { ResponseStatus } from '@/types/api/responses'
import type { TratamentoDTO } from '@/types/dtos/tratamentos/tratamento.dtos'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

function fmtDate(v?: string | null) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-PT')
}

const EmptyFilterControls = () => null

const columns: DataTableColumnDef<TratamentoDTO>[] = [
  {
    accessorKey: 'designacao',
    header: 'Designação',
    enableSorting: false,
    cell: ({ row }) => row.original.designacao?.trim() || '—',
  },
  {
    accessorKey: 'nomePatologia',
    header: 'Patologia',
    enableSorting: false,
    cell: ({ row }) => row.original.nomePatologia?.trim() || '—',
  },
  {
    accessorKey: 'numSessao',
    header: 'N.º sessões',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.numSessao != null ? String(row.original.numSessao) : '—',
  },
  {
    accessorKey: 'dataInic',
    header: 'Data início',
    enableSorting: false,
    cell: ({ row }) => fmtDate(row.original.dataInic),
  },
  {
    accessorKey: 'dataFim',
    header: 'Data fim',
    enableSorting: false,
    cell: ({ row }) => fmtDate(row.original.dataFim),
  },
  {
    accessorKey: 'data',
    header: 'Data',
    enableSorting: false,
    cell: ({ row }) => fmtDate(row.original.data),
  },
  {
    accessorKey: 'obs',
    header: 'Observações',
    enableSorting: false,
    cell: ({ row }) => row.original.obs?.trim() || '—',
  },
  {
    accessorKey: 'tecObs',
    header: 'Obs. técnicas',
    enableSorting: false,
    cell: ({ row }) => row.original.tecObs?.trim() || '—',
  },
]

export function TratamentoMarcadoFichaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const { canView } = useAreaComumEntityListPermissions(listPermId)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tratamento-marcado-ficha', id],
    queryFn: () => TratamentoService(listPermId).getById(id!),
    enabled: !!id && canView,
  })

  const dto =
    data?.info?.status === ResponseStatus.Success ? data.info.data : null
  const apiMsg = Object.values(data?.info?.messages ?? {})
    .flat()
    .find(Boolean)
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const handleBack = () => {
    closeLikeTabBar()
    navigate('/area-administrativa/tratamentos/tratamentos-marcados')
  }

  if (!canView) {
    return (
      <DashboardPageContainer>
        <Alert variant='destructive'>
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>
            Não tem permissão para ver este tratamento.
          </AlertDescription>
        </Alert>
      </DashboardPageContainer>
    )
  }

  const rows = dto ? [dto] : []
  const title =
    dto?.designacao?.trim() ||
    dto?.nomePatologia?.trim() ||
    'Ficha de Tratamento'

  return (
    <>
      <PageHead title='Ficha de Tratamento | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={title} onBack={handleBack}>
          {isError || (!isLoading && !dto) ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar ficha</AlertTitle>
              <AlertDescription>
                {apiMsg || errorMessage || 'Tratamento não encontrado.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            pageCount={1}
            totalRows={rows.length}
            initialPage={1}
            initialPageSize={10}
            FilterControls={EmptyFilterControls}
            hideToolbarFilters
            onPaginationChange={() => undefined}
            onFiltersChange={() => undefined}
            onSortingChange={() => undefined}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
