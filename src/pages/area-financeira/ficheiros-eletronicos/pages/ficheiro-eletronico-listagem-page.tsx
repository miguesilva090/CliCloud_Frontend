import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { List, Paperclip, Plus, RotateCw } from 'lucide-react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import type { DataTableAction } from '@/components/shared/data-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FicheirosEletronicosService } from '@/lib/services/faturacao/ficheiros-eletronicos-service'
import { modules } from '@/config/modules'
import {
  getFaturacaoApiErrorMessage,
  isFaturacaoApiSuccess,
} from '@/pages/area-financeira/faturacao/utils/faturacao-api-utils'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import type { FicheiroEletronicoAnexoDTO } from '@/types/dtos/faturacao/ficheiros-eletronicos.dtos'
import { toast } from '@/utils/toast-utils'
import {
  getCurrentWindowId,
  navigateManagedWindow,
  useCloseCurrentWindowLikeTabBar,
  useCurrentWindowId,
} from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useWindowPageState } from '@/stores/use-pages-store'
import {
  buildFaturacaoSiglaFicheiroUrl,
  resolveSiglaFromSlug,
  type FicheiroEletronicoSiglaSlug,
} from '../constants/ficheiro-eletronico-siglas'
import { FicheiroEletronicoTable } from '../components/ficheiro-eletronico-table'
import type { FicheiroEletronicoRow } from '../components/ficheiro-eletronico-columns'
import { SelecionarFaturaOrganismoDialog } from '../components/selecionar-fatura-organismo-dialog'
import { AnexarFicheirosDialog } from '../components/anexar-ficheiros-dialog'
import { downloadFicheiroEletronicoGerado } from '../utils/ficheiro-eletronico-download'
import { getDocumentoNumeroLabel } from '@/pages/area-financeira/faturacao/utils/faturacao-documento-display'

const PERMISSAO_ID = modules.areaFinanceira.permissions.ficheirosEletronicos.id

function sortRows(
  rows: FicheiroEletronicoRow[],
  sorting: Array<{ id: string; desc: boolean }>,
): FicheiroEletronicoRow[] {
  if (!sorting.length) {
    return [...rows].sort(
      (a, b) =>
        new Date(b.dataGeracao).getTime() - new Date(a.dataGeracao).getTime(),
    )
  }

  const { id, desc } = sorting[0]
  const factor = desc ? -1 : 1

  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[id]
    const bv = (b as Record<string, unknown>)[id]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * factor
    }
    return String(av).localeCompare(String(bv), 'pt') * factor
  })
}

export function FicheiroEletronicoListagemPage() {
  const navigate = useNavigate()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const { siglaSlug } = useParams<{ siglaSlug: string }>()
  const sigla = resolveSiglaFromSlug(siglaSlug)
  const queryClient = useQueryClient()
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const location = useLocation()
  const currentWindowId = useCurrentWindowId()
  const pageStateKey = currentWindowId || location.pathname

  const {
    filters,
    sorting,
    pagination: { page, pageSize },
    setFilters,
    setSorting,
    setPagination,
  } = useWindowPageState(pageStateKey)

  const [selecionarFaturaOpen, setSelecionarFaturaOpen] = useState(false)
  const [anexarOpen, setAnexarOpen] = useState(false)
  const [faturaSelecionada, setFaturaSelecionada] =
    useState<DocumentoTableDTO | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const handleFiltersChange = (newFilters: Array<{ id: string; value: string }>) => {
    setFilters(newFilters)
    setPagination(1, pageSize)
  }

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPagination(newPage, newPageSize)
  }

  const handleSortingChange = (
    newSorting: Array<{ id: string; desc: boolean }>,
  ) => {
    setSorting(newSorting)
  }

  useEffect(() => {
    if (!sigla) return
    const windowId = getCurrentWindowId()
    if (windowId) {
      updateWindowState(windowId, { title: `Ficheiro Eletrónico - ${sigla}` })
    }
  }, [sigla, updateWindowState])

  const historicoQuery = useQuery({
    queryKey: ['ficheiros-eletronicos', sigla],
    queryFn: () => FicheirosEletronicosService(PERMISSAO_ID).listar(sigla!),
    enabled: !!sigla,
  })

  const rawRows = useMemo(() => {
    const info = historicoQuery.data?.info
    if (!info || !isFaturacaoApiSuccess(info)) return []
    return info.data ?? []
  }, [historicoQuery.data])

  const rowsWithCodigo = useMemo((): FicheiroEletronicoRow[] => {
    const sorted = [...rawRows].sort(
      (a, b) =>
        new Date(a.dataGeracao).getTime() - new Date(b.dataGeracao).getTime(),
    )
    return rawRows.map((row) => {
      const idx = sorted.findIndex((s) => s.id === row.id)
      return {
        ...row,
        codigoVisual: idx + 1,
      }
    })
  }, [rawRows])

  const sortedRows = useMemo(
    () => sortRows(rowsWithCodigo, sorting),
    [rowsWithCodigo, sorting],
  )

  const filteredRows = useMemo(() => {
    const searchFilter = filters.find((f) => f.id === 'numeroExibicaoDocumento')
    if (!searchFilter?.value?.trim()) return sortedRows
    const q = searchFilter.value.trim().toLowerCase()
    return sortedRows.filter((row) =>
      (row.numeroExibicaoDocumento ?? row.documentoId ?? '')
        .toLowerCase()
        .includes(q),
    )
  }, [sortedRows, filters])

  const totalRows = filteredRows.length
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize))
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, page, pageSize])

  const refresh = () => {
    setSelectedRows([])
    void queryClient.invalidateQueries({ queryKey: ['ficheiros-eletronicos', sigla] })
  }

  const juntarMutation = useMutation({
    mutationFn: ({
      documentoId,
      ficheiros,
    }: {
      documentoId: string
      ficheiros: FicheiroEletronicoAnexoDTO[]
    }) =>
      FicheirosEletronicosService(PERMISSAO_ID).juntar({
        documentoId,
        sigla: sigla!,
        ficheiros,
      }),
    onSuccess: (res) => {
      const info = res.info
      if (!info || !isFaturacaoApiSuccess(info) || !info.data) {
        toast.error(getFaturacaoApiErrorMessage(info, 'Falha ao juntar ficheiros.'))
        return
      }

      downloadFicheiroEletronicoGerado(info.data)
      toast.success('Ficheiros juntados com sucesso.')
      setAnexarOpen(false)
      setFaturaSelecionada(null)
    },
    onError: () => toast.error('Falha ao juntar ficheiros.'),
  })

  if (!sigla) {
    return (
      <Navigate
        to='/area-financeira/faturacao/ficheiros-eletronicos/sad-gnr'
        replace
      />
    )
  }

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Anexar Ficheiros',
      icon: <Paperclip className='h-4 w-4' />,
      onClick: () => setSelecionarFaturaOpen(true),
      variant: 'secondary',
      className:
        'bg-amber-500 text-white hover:bg-amber-600 border-amber-500',
    },
    {
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => {
        if (!siglaSlug) return
        navigateManagedWindow(
          navigate,
          buildFaturacaoSiglaFicheiroUrl(siglaSlug as FicheiroEletronicoSiglaSlug),
          {
            title: `Ficheiro Eletrónico - ${sigla}`,
            forceNewInstance: true,
          },
        )
      },
      variant: 'destructive',
    },
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () => toast.info('Listagens — disponível numa fase posterior.'),
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: refresh,
      variant: 'outline',
    },
  ]

  const errorMessage =
    historicoQuery.error instanceof Error
      ? historicoQuery.error.message
      : historicoQuery.error
        ? String(historicoQuery.error)
        : ''

  return (
    <>
      <PageHead title={`Ficheiro Eletrónico - ${sigla} | Área Financeira | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={`Ficheiro Eletrónico - ${sigla}`}
          onBack={closeLikeTabBar}
          onRefresh={refresh}
        >
          {historicoQuery.isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar histórico</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar os registos.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <FicheiroEletronicoTable
            data={pagedRows}
            isLoading={historicoQuery.isLoading}
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
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <SelecionarFaturaOrganismoDialog
        open={selecionarFaturaOpen}
        sigla={sigla}
        onOpenChange={setSelecionarFaturaOpen}
        onConfirm={(documento) => {
          setFaturaSelecionada(documento)
          setSelecionarFaturaOpen(false)
          setAnexarOpen(true)
        }}
      />

      <AnexarFicheirosDialog
        open={anexarOpen}
        sigla={sigla}
        documentoLabel={
          faturaSelecionada
            ? getDocumentoNumeroLabel(faturaSelecionada)
            : '—'
        }
        onOpenChange={setAnexarOpen}
        isPending={juntarMutation.isPending}
        onConfirm={(anexos) => {
          if (!faturaSelecionada) {
            toast.error('Selecione a fatura.')
            return
          }
          juntarMutation.mutate({
            documentoId: faturaSelecionada.id,
            ficheiros: anexos,
          })
        }}
      />
    </>
  )
}
