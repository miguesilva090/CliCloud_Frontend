import { useCallback, useEffect, useMemo, useState } from 'react'
import { startOfMonth } from 'date-fns'
import type {
  ComunicacaoFaturasModoListagem,
  ComunicacaoFaturasRowDTO,
  ComunicacaoFaturasTipoPreFatura,
  ComunicacaoFaturasTotaisDTO,
  PreFaturaTableDTO,
} from '@/types/dtos/faturacao/comunicacao-faturas.dtos'
import { getDataTrabalhoDate } from '@/lib/utils/data-trabalho'
import { toast } from '@/utils/toast-utils'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { DataTable } from '@/components/shared/data-table'
import { PageHead } from '@/components/shared/page-head'
import { ComunicacaoFaturasActionBar } from '../components/comunicacao-faturas-action-bar'
import {
  ComunicacaoFaturasFilterPanel,
  type ComunicacaoFaturasFilterDraft,
} from '../components/comunicacao-faturas-filter-panel'
import { ComunicacaoFaturasPreFaturasDialog } from '../components/comunicacao-faturas-pre-faturas-dialog'
import { ComunicacaoFaturasSummaryBar } from '../components/comunicacao-faturas-summary-bar'
import { getComunicacaoFaturasColumns } from '../components/comunicacao-faturas-table.columns'
import {
  COMUNICACAO_FATURAS_TIPO_CONFIG,
  toPreFaturasOpcoes,
} from '../constants/comunicacao-faturas-tipo-config'

const EMPTY_TOTAIS: ComunicacaoFaturasTotaisDTO = {
  totalFrPagina: 0,
  totalFr: 0,
  totalAdsePagina: 0,
  totalAdse: 0,
}

const SEM_REGISTOS_MSG = 'Não encontrou registos para a pesquisa pedida'

function createDefaultFilterDraft(): ComunicacaoFaturasFilterDraft {
  const dataFinal = getDataTrabalhoDate()
  return {
    dataInicial: startOfMonth(dataFinal),
    dataFinal,
    estadoComunicacao: '',
    utenteId: '',
    utenteLabel: '',
  }
}

function ComunicacaoFaturasNoopFilterControls(_: {
  table: unknown
  columns: unknown[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

type ComunicacaoFaturasPageProps = {
  tipoPreFatura: ComunicacaoFaturasTipoPreFatura
}

export function ComunicacaoFaturasPage({
  tipoPreFatura,
}: ComunicacaoFaturasPageProps) {
  const tipoConfig = COMUNICACAO_FATURAS_TIPO_CONFIG[tipoPreFatura]
  const pageTitle = tipoConfig.pageTitle
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const [filterDraft, setFilterDraft] = useState(createDefaultFilterDraft)
  const [modoListagem, setModoListagem] =
    useState<ComunicacaoFaturasModoListagem>('pre-faturas')
  const [numeroPreFatura, setNumeroPreFatura] = useState(
    tipoConfig.numeroPreFaturaInicial
  )
  const [preFaturasOpcoes, setPreFaturasOpcoes] = useState(() =>
    toPreFaturasOpcoes(tipoConfig.preFaturasMock)
  )
  const [isRefreshingPreFaturas, setIsRefreshingPreFaturas] = useState(false)
  const [preFaturasDialogOpen, setPreFaturasDialogOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [rows, setRows] = useState<ComunicacaoFaturasRowDTO[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<Array<{ id: string; value: string }>>(
    []
  )
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([
    { id: 'dataInicio', desc: false },
  ])

  const columns = useMemo(
    () =>
      getComunicacaoFaturasColumns({
        incluirColunaRelatorio: tipoConfig.incluirColunaRelatorio,
      }),
    [tipoConfig.incluirColunaRelatorio]
  )

  const tableMinWidth = tipoConfig.incluirColunaRelatorio
    ? 'min-w-[1480px]'
    : 'min-w-[1420px]'

  const statusMessage = useMemo(() => {
    if (!hasSearched) return null
    if (rows.length > 0) return null
    return SEM_REGISTOS_MSG
  }, [hasSearched, rows.length])

  const totais = useMemo((): ComunicacaoFaturasTotaisDTO => {
    if (!rows.length) return EMPTY_TOTAIS

    const totalFrPagina = rows.reduce((acc, row) => acc + (row.valorFr ?? 0), 0)
    const totalAdsePagina = rows.reduce(
      (acc, row) => acc + (row.valorAdse ?? 0),
      0
    )

    return {
      totalFrPagina,
      totalFr: totalFrPagina,
      totalAdsePagina,
      totalAdse: totalAdsePagina,
    }
  }, [rows])

  const handleApplyFilters = useCallback(() => {
    setHasSearched(true)
    setSelectedRows([])
    setPage(1)
    setRows([])
  }, [])

  useEffect(() => {
    handleApplyFilters()
  }, [handleApplyFilters, tipoPreFatura])

  const handleClearFilters = useCallback(() => {
    setFilterDraft(createDefaultFilterDraft())
    setHasSearched(false)
    setSelectedRows([])
    setRows([])
    setPage(1)
    setNumeroPreFatura(tipoConfig.numeroPreFaturaInicial)
    setPreFaturasOpcoes(toPreFaturasOpcoes(tipoConfig.preFaturasMock))
  }, [tipoConfig.numeroPreFaturaInicial, tipoConfig.preFaturasMock])

  const handleRefreshPreFaturas = useCallback(() => {
    setIsRefreshingPreFaturas(true)
    window.setTimeout(() => {
      setPreFaturasOpcoes(toPreFaturasOpcoes(tipoConfig.preFaturasMock))
      if (tipoConfig.numeroPreFaturaInicial && !numeroPreFatura) {
        setNumeroPreFatura(tipoConfig.numeroPreFaturaInicial)
      }
      setIsRefreshingPreFaturas(false)
      toast.info('Lista de pré-faturas atualizada.')
    }, 400)
  }, [
    numeroPreFatura,
    tipoConfig.numeroPreFaturaInicial,
    tipoConfig.preFaturasMock,
  ])

  const requireSelection = useCallback(() => {
    if (!selectedRows.length) {
      toast.warning('Selecione pelo menos um registo.')
      return false
    }
    return true
  }, [selectedRows.length])

  const handleValidar = useCallback(() => {
    if (!requireSelection()) return
    toast.info('Validação ADSE — integração API em preparação.')
  }, [requireSelection])

  const handleComunicar = useCallback(() => {
    if (!requireSelection()) return
    toast.info('Comunicação ADSE — integração API em preparação.')
  }, [requireSelection])

  const handleEliminar = useCallback(() => {
    if (!requireSelection()) return
    toast.info('Eliminação de pré-faturas — integração API em preparação.')
  }, [requireSelection])

  const handleLibertar = useCallback(() => {
    if (!requireSelection()) return
    toast.info('Libertar devoluções — integração API em preparação.')
  }, [requireSelection])

  const handleModoListagemChange = useCallback(
    (modo: ComunicacaoFaturasModoListagem) => {
      setModoListagem(modo)
      setPage(1)
      setSelectedRows([])
      setHasSearched(true)
      setRows([])
    },
    []
  )

  const handlePreFaturaConfirm = useCallback(
    (preFatura: PreFaturaTableDTO | null) => {
      if (!preFatura) return
      setNumeroPreFatura(preFatura.numeroPreFatura)
      setPreFaturasOpcoes((current) => {
        if (current.some((opt) => opt.value === preFatura.numeroPreFatura)) {
          return current
        }
        return [
          ...current,
          {
            value: preFatura.numeroPreFatura,
            label: preFatura.numeroPreFatura,
          },
        ]
      })
    },
    []
  )

  return (
    <>
      <PageHead title={`${pageTitle} | Área Financeira`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={pageTitle} onBack={closeLikeTabBar}>
          <div className='space-y-4'>
            <ComunicacaoFaturasFilterPanel
              draft={filterDraft}
              onDraftChange={setFilterDraft}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />

            <ComunicacaoFaturasActionBar
              modoListagem={modoListagem}
              onModoListagemChange={handleModoListagemChange}
              numeroPreFatura={numeroPreFatura}
              onNumeroPreFaturaChange={setNumeroPreFatura}
              preFaturasOpcoes={preFaturasOpcoes}
              onRefreshPreFaturas={handleRefreshPreFaturas}
              onOpenPreFaturas={() => setPreFaturasDialogOpen(true)}
              onValidar={handleValidar}
              onComunicar={handleComunicar}
              onEliminar={handleEliminar}
              onLibertar={handleLibertar}
              statusMessage={statusMessage}
              isRefreshing={isRefreshingPreFaturas}
            />

            <DataTable
              columns={columns}
              data={rows}
              pageCount={Math.max(1, Math.ceil(rows.length / pageSize) || 1)}
              totalRows={rows.length}
              initialPage={page}
              initialPageSize={pageSize}
              initialFilters={filters}
              initialSorting={sorting}
              selectedRows={selectedRows}
              onRowSelectionChange={setSelectedRows}
              onPaginationChange={(newPage, newPageSize) => {
                setPage(newPage)
                setPageSize(newPageSize)
              }}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters)
                setPage(1)
              }}
              onSortingChange={setSorting}
              FilterControls={ComunicacaoFaturasNoopFilterControls}
              hideToolbar
              tableClassName={`table-fixed ${tableMinWidth}`}
            />

            <ComunicacaoFaturasSummaryBar
              totais={totais}
              statusMessage={statusMessage}
              statusTone={modoListagem === 'devolucoes' ? 'error' : 'warning'}
            />
          </div>
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <ComunicacaoFaturasPreFaturasDialog
        open={preFaturasDialogOpen}
        onOpenChange={setPreFaturasDialogOpen}
        tipoPreFatura={tipoPreFatura}
        numeroPreFaturaSelecionado={numeroPreFatura}
        onConfirm={handlePreFaturaConfirm}
      />
    </>
  )
}
