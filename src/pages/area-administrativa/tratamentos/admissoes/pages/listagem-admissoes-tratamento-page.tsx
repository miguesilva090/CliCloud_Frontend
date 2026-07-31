import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RotateCw, Search } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePageData, buildFiltersWithValue } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import {
  ModoListagemAdmissaoTratamento,
  type AdmissaoTratamentoTableDTO,
} from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'
import { AdmissaoTratamentoAdministrativoService } from '@/lib/services/tratamentos/admissao-tratamento-administrativo-service/admissao-tratamento-administrativo-client'
import { ListagemAdmissoesTratamentoTable } from '../components/listagem-admissoes-tratamento-table'
import { buildAdmissoesTratamentoColumns } from '../components/listagem-admissoes-tratamento-table.columns'
import {
  invalidateAdmissoesTratamentoQueries,
  useGetAdmissoesTratamentoPaginated,
  usePrefetchAdjacentAdmissoesTratamento,
} from '../queries/listagem-admissoes-tratamento-queries'
import type { DataTableAction } from '@/components/shared/data-table'
import { SelecionarLocalTratamentoModal } from '../modals/selecionar-local-tratamento-modal'

const listPermId = modules.areaAdministrativa.permissions.admissoes.id

const TITLE: Record<ModoListagemAdmissaoTratamento, string> = {
  [ModoListagemAdmissaoTratamento.UtentesHora]: 'Admissões — Utentes/Hora',
  [ModoListagemAdmissaoTratamento.Presentes]: 'Admissões — Utentes Presentes',
  [ModoListagemAdmissaoTratamento.LocalTratamento]:
    'Admissões — Local de Tratamento',
}

export function ListagemAdmissoesTratamentoPage({
  modo = ModoListagemAdmissaoTratamento.UtentesHora,
}: {
  modo?: ModoListagemAdmissaoTratamento
}) {
  const { canView, canChange } = useAreaComumEntityListPermissions(listPermId)
  const queryClient = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)
  const isModoLocal = modo === ModoListagemAdmissaoTratamento.LocalTratamento
  const [localModalOpen, setLocalModalOpen] = useState(false)

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
    useGetDataPaginated: (p, ps, f, s) =>
      useGetAdmissoesTratamentoPaginated(modo, p, ps, f, s),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentAdmissoesTratamento(modo, p, ps, f),
    defaultFilters: [{ id: 'data', value: today }],
  })

  const localId =
    filters.find((f) => f.id === 'localTratamentoId')?.value ?? ''

  useEffect(() => {
    if (isModoLocal && !localId) {
      setLocalModalOpen(true)
    }
  }, [isModoLocal, localId])

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const applyLocal = (id: string) => {
    handleFiltersChange(
      buildFiltersWithValue(
        filters.length ? filters : [{ id: 'data', value: today }],
        'localTratamentoId',
        id
      )
    )
    handlePaginationChange(1, pageSize)
  }

  const onToggle = async (
    row: AdmissaoTratamentoTableDTO,
    campo: 'confirmado' | 'efetuado' | 'faltou',
    valor: 0 | 1
  ) => {
    if (!canChange || !row.id) return

    if (campo === 'confirmado' && valor === 1 && row.faltou === 1) {
      toast.error(
        'Não é possível marcar confirmado: a sessão já está marcada como faltou.'
      )
      return
    }
    if (campo === 'efetuado' && valor === 1 && row.faltou === 1) {
      toast.error(
        'Não é possível marcar efectuado: a sessão já está marcada como faltou.'
      )
      return
    }
    if (campo === 'faltou' && valor === 1 && row.efetuado === 1) {
      toast.error(
        'Não é possível marcar faltou: a sessão já está marcada como efectuada.'
      )
      return
    }
    if (campo === 'faltou' && valor === 1 && row.confirmado === 1) {
      toast.error(
        'Não é possível marcar faltou: a sessão já está marcada como confirmada. Desmarque confirmado primeiro.'
      )
      return
    }

    try {
      const res = await AdmissaoTratamentoAdministrativoService(
        listPermId
      ).updateSituacao(row.id, { campo, valor })
      if (res.info?.status === ResponseStatus.Success) {
        invalidateAdmissoesTratamentoQueries(queryClient)
      } else {
        const msg =
          res.info?.messages?.['$']?.[0] ??
          'Não foi possível actualizar a situação.'
        toast.error(msg)
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Erro ao actualizar situação.')
    }
  }

  const refresh = () => invalidateAdmissoesTratamentoQueries(queryClient)

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: refresh,
      variant: 'outline',
    },
    ...(isModoLocal
      ? [
          {
            label: 'Nova pesquisa',
            icon: <Search className='h-4 w-4' />,
            onClick: () => setLocalModalOpen(true),
            variant: 'outline' as const,
          },
        ]
      : []),
  ]

  const columns = buildAdmissoesTratamentoColumns({
    canChange,
    showConfirmado: modo !== ModoListagemAdmissaoTratamento.Presentes,
    showFaltou: modo !== ModoListagemAdmissaoTratamento.Presentes,
    onToggle,
  })

  if (!canView) {
    return (
      <DashboardPageContainer>
        <Alert variant='destructive'>
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>
            Não tem permissão para ver admissões de tratamentos.
          </AlertDescription>
        </Alert>
      </DashboardPageContainer>
    )
  }

  return (
    <>
      <PageHead title={`${TITLE[modo]} | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={TITLE[modo]}
          onRefresh={refresh}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar admissões</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Erro ao pedir a lista.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemAdmissoesTratamentoTable
            data={rows}
            columns={columns}
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
            modo={modo}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      {isModoLocal ? (
        <SelecionarLocalTratamentoModal
          open={localModalOpen}
          onOpenChange={setLocalModalOpen}
          initialLocalId={localId}
          onConfirm={applyLocal}
        />
      ) : null}
    </>
  )
}

export function ListagemAdmissoesTratamentoPresentesPage() {
  return (
    <ListagemAdmissoesTratamentoPage
      modo={ModoListagemAdmissaoTratamento.Presentes}
    />
  )
}

export function ListagemAdmissoesTratamentoLocalPage() {
  return (
    <ListagemAdmissoesTratamentoPage
      modo={ModoListagemAdmissaoTratamento.LocalTratamento}
    />
  )
}
