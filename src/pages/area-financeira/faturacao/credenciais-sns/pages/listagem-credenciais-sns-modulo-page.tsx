import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { openPathInApp } from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Layers, List, Plus, RotateCw, Trash2 } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertModal } from '@/components/shared/alert-modal'
import { usePageData } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import type { CredenciaisSnsLoteTableDTO } from '@/types/dtos/faturacao/credenciais-sns.dtos'
import type { CredenciaisSnsModulo } from '@/types/dtos/faturacao/credenciais-sns.dtos'
import { ListagemCredenciaisSnsTable } from '../components/listagem-credenciais-sns-table'
import {
  CREDENCIAIS_SNS_PERM_ID,
  createCredenciaisSnsPaginatedHook,
  createCredenciaisSnsPrefetchHook,
  credenciaisSnsPaginatedQueryKey,
} from '../queries/listagem-credenciais-sns-queries'
import { useDeleteCredenciaisSns } from '../queries/credenciais-sns-mutations'
import {
  credenciaisSnsModuloHasBackendDelete,
  credenciaisSnsPageTitle,
} from '../credenciais-sns-modulo-config'
import {
  CredenciaisSnsOperacoesModal,
  type CredenciaisSnsOperacaoTipo,
} from '../modals/credenciais-sns-operacoes-modal'
import { CredenciaisSnsFaturaModal } from '../modals/credenciais-sns-fatura-modal'
import {
  credenciaisSnsOperacaoEmBreve,
  emitirCredenciaisSnsListagemRelatorio,
} from '../utils/credenciais-sns-acoes'

type ListagemCredenciaisSnsModuloPageProps = {
  modulo: CredenciaisSnsModulo
}

export function ListagemCredenciaisSnsModuloPage({
  modulo,
}: ListagemCredenciaisSnsModuloPageProps) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const queryClient = useQueryClient()
  const title = credenciaisSnsPageTitle(modulo)
  const { canView, canDelete } = useAreaComumEntityListPermissions(
    CREDENCIAIS_SNS_PERM_ID
  )
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [operacaoOpen, setOperacaoOpen] = useState(false)
  const [faturaOpen, setFaturaOpen] = useState(false)
  const [operacaoTipo, setOperacaoTipo] = useState<CredenciaisSnsOperacaoTipo | null>(
    null
  )
  const deleteMutation = useDeleteCredenciaisSns(modulo)

  const useGetPaginated = useMemo(
    () => createCredenciaisSnsPaginatedHook(modulo),
    [modulo]
  )
  const usePrefetchAdjacent = useMemo(
    () => createCredenciaisSnsPrefetchHook(modulo),
    [modulo]
  )

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
    useGetDataPaginated: useGetPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacent,
  })

  const rows: CredenciaisSnsLoteTableDTO[] = data?.info?.data ?? []
  const deleteSupported = credenciaisSnsModuloHasBackendDelete(modulo)

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: credenciaisSnsPaginatedQueryKey(modulo),
    })

  const openOperacao = (tipo: CredenciaisSnsOperacaoTipo | 'fatura') => {
    if (tipo === 'fatura') {
      setFaturaOpen(true)
      return
    }
    setOperacaoTipo(tipo)
    setOperacaoOpen(true)
  }

  const handleView = (row: CredenciaisSnsLoteTableDTO) => {
    if (modulo === 'especialidades') {
      openPathInApp(
        navigate,
        addWindow,
        `/area-administrativa/credenciais?indicelote=${row.indice}`,
        'Lançamento de Credenciais'
      )
      return
    }
    if (modulo === 'exames') {
      credenciaisSnsOperacaoEmBreve('Consulta de exames')
      return
    }
    credenciaisSnsOperacaoEmBreve('Lançamento de credenciais (fisioterapia)')
  }

  const selectedIndices = rows
    .filter((row) => selectedRows.includes(row.id))
    .map((row) => row.indice)

  const handleBulkDeleteConfirm = async () => {
    if (selectedIndices.length === 0) return
    try {
      const response = await deleteMutation.mutateAsync({ indices: selectedIndices })
      const result = handleApiResponse(
        response,
        'Lote(s) eliminado(s) com sucesso',
        'Erro ao eliminar lote(s)',
        'Lote(s) eliminado(s) com avisos'
      )
      if (result.success) {
        setBulkDeleteOpen(false)
        setSelectedRows([])
      }
    } catch {
      toast.error('Erro ao eliminar lote(s)')
      setBulkDeleteOpen(false)
    }
  }

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={title}>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar credenciais SNS</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar a lista.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemCredenciaisSnsTable
            modulo={modulo}
            data={rows}
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
            onOpenView={handleView}
            rowActionPermissions={{
              canView,
              canDelete: deleteSupported ? canDelete : false,
              canChange: false,
            }}
            selectedRows={deleteSupported ? selectedRows : undefined}
            onRowSelectionChange={deleteSupported ? setSelectedRows : undefined}
            toolbarActions={[
              {
                label: 'Fatura',
                icon: <Plus className='h-4 w-4' />,
                onClick: () => openOperacao('fatura'),
                variant: 'destructive' as const,
              },
              {
                label: 'Verbete',
                icon: <FileText className='h-4 w-4' />,
                onClick: () => openOperacao('verbete'),
                variant: 'outline' as const,
              },
              {
                label: 'Relação Lotes',
                icon: <Layers className='h-4 w-4' />,
                onClick: () => openOperacao('relacao-lotes'),
                variant: 'outline' as const,
              },
              {
                label: 'Listagens',
                icon: <List className='h-4 w-4' />,
                onClick: emitirCredenciaisSnsListagemRelatorio,
                variant: 'outline' as const,
              },
              ...(deleteSupported && canDelete && selectedIndices.length > 0
                ? [
                    {
                      label: `Apagar (${selectedIndices.length})`,
                      icon: <Trash2 className='h-4 w-4' />,
                      onClick: () => setBulkDeleteOpen(true),
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
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

      <CredenciaisSnsFaturaModal
        open={faturaOpen}
        modulo={modulo}
        onClose={() => setFaturaOpen(false)}
      />

      <CredenciaisSnsOperacoesModal
        open={operacaoOpen}
        tipo={operacaoTipo}
        onClose={() => {
          setOperacaoOpen(false)
          setOperacaoTipo(null)
        }}
      />

      <AlertModal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        loading={deleteMutation.isPending}
        title='Eliminar lotes selecionados'
        description={`Confirma a eliminação de ${selectedIndices.length} lote(s)?`}
      />
    </>
  )
}
