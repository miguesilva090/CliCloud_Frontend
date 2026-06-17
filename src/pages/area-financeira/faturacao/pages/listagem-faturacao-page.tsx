import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileDown, List, Mail, Plus, RotateCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { DataTableAction } from '@/components/shared/data-table'
import type {
  AtualizarValidacaoTransporteRequest,
  DocumentoDetalhesAdmissoesDTO,
  DocumentoTableDTO,
} from '@/types/dtos/faturacao/documento.dtos'
import { toast } from '@/utils/toast-utils'
import {
  getCurrentWindowId,
  navigateManagedWindow,
  useCloseCurrentWindowLikeTabBar,
} from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  buildNovoDocumentoFicheiroEletronicoUrl,
  resolveSiglaFromSlug,
  type FicheiroEletronicoSiglaSlug,
} from '@/pages/area-financeira/ficheiros-eletronicos/constants/ficheiro-eletronico-siglas'
import { modules } from '@/config/modules'
import { FicheirosEletronicosService } from '@/lib/services/faturacao/ficheiros-eletronicos-service'
import { downloadFicheiroEletronicoGerado } from '@/pages/area-financeira/ficheiros-eletronicos/utils/ficheiro-eletronico-download'
import {
  getFaturacaoApiErrorMessage,
  isFaturacaoApiSuccess,
} from '../utils/faturacao-api-utils'
import type { PageFilter } from '@/utils/page-data-utils'
import { ListagemFaturacaoTable } from '../components/listagem-faturacao-table'
import { ListagemFaturacaoFilterControls } from '../components/listagem-faturacao-filter-controls'
import { ListagemFaturacaoRowActions } from '../components/listagem-faturacao-row-actions'
import { AnularDocumentoDialog } from '../components/anular-documento-dialog'
import { NotaCreditoDialog } from '../components/nota-credito-dialog'
import { ValidacaoTransporteDialog } from '../components/validacao-transporte-dialog'
import { DetalhesAdmissoesDialog } from '../components/detalhes-admissoes-dialog'
import {
  documentoQueryKeys,
  useAtualizarValidacaoTransporteMutation,
  useDocumentoLiquidacaoContextoMutation,
  useGetDocumentoByIdMutation,
  useGetDocumentoDetalhesAdmissoesMutation,
  useDocumentoPrintOriginalMutation,
  useDocumentoPrintMutation,
  useEnviarDocumentoEmailMutation,
  useGetDocumentosPaginatedPageData,
  usePrefetchAdjacentDocumentos,
} from '../queries/listagem-faturacao-queries'
import { podeEditarDocumento, podeEnviarEmailDocumento } from '../utils/listagem-faturacao-acoes'

const ID_FUNCIONALIDADE = 'documentos'
const ID_FUNCIONALIDADE_FE =
  modules.areaFinanceira.permissions.ficheirosEletronicos.id

export function ListagemFaturacaoPage() {
  const navigate = useNavigate()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const siglaFicheiroSlug = searchParams.get('siglaFicheiro')
  const origemFicheiroEletronico =
    searchParams.get('origem') === 'ficheiro-eletronico'
  const siglaFicheiroLabel = resolveSiglaFromSlug(siglaFicheiroSlug ?? undefined)
  const emContextoFicheiroEletronico =
    origemFicheiroEletronico && !!siglaFicheiroLabel

  const defaultFilters = useMemo((): PageFilter[] => {
    if (!siglaFicheiroSlug) return []
    return [{ id: 'siglaficheiro', value: siglaFicheiroSlug }]
  }, [siglaFicheiroSlug])

  useEffect(() => {
    if (!emContextoFicheiroEletronico || !siglaFicheiroLabel) return
    const windowId = getCurrentWindowId()
    if (windowId) {
      updateWindowState(windowId, {
        title: `Ficheiro Eletrónico - ${siglaFicheiroLabel}`,
      })
    }
  }, [emContextoFicheiroEletronico, siglaFicheiroLabel, updateWindowState])
  const [anularDocumento, setAnularDocumento] = useState<DocumentoTableDTO | null>(
    null,
  )
  const [notaCreditoDocumento, setNotaCreditoDocumento] =
    useState<DocumentoTableDTO | null>(null)
  const [validacaoTransporteDocumento, setValidacaoTransporteDocumento] =
    useState<DocumentoTableDTO | null>(null)
  const [detalhesAdmissoesOpen, setDetalhesAdmissoesOpen] = useState(false)
  const [detalhesAdmissoes, setDetalhesAdmissoes] =
    useState<DocumentoDetalhesAdmissoesDTO | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const printMutation = useDocumentoPrintMutation(ID_FUNCIONALIDADE)
  const printOriginalMutation = useDocumentoPrintOriginalMutation(ID_FUNCIONALIDADE)
  const emailMutation = useEnviarDocumentoEmailMutation(ID_FUNCIONALIDADE)
  const liquidacaoMutation = useDocumentoLiquidacaoContextoMutation(ID_FUNCIONALIDADE)
  const getDocumentoByIdMutation = useGetDocumentoByIdMutation(ID_FUNCIONALIDADE)
  const getDetalhesAdmissoesMutation =
    useGetDocumentoDetalhesAdmissoesMutation(ID_FUNCIONALIDADE)
  const validacaoTransporteMutation = useAtualizarValidacaoTransporteMutation(ID_FUNCIONALIDADE)

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
      useGetDocumentosPaginatedPageData(p, ps, f, s, ID_FUNCIONALIDADE),
    usePrefetchAdjacentData: (p, ps, f, s) =>
      usePrefetchAdjacentDocumentos(p, ps, f, s, ID_FUNCIONALIDADE),
    defaultFilters,
  })

  const documentos: DocumentoTableDTO[] = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => {
    setSelectedRows([])
    handleFiltersChange(defaultFilters)
    handlePaginationChange(1, pageSize)
    queryClient.invalidateQueries({ queryKey: documentoQueryKeys.all })
  }

  const handleEnviarEmail = async (row: DocumentoTableDTO) => {
    try {
      await emailMutation.mutateAsync({ id: row.id, payload: {} })
      toast.success('Documento enviado por email com sucesso.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao enviar email.'
      toast.error(msg)
    }
  }

  const handleHistoricoReimpressao = async (row: DocumentoTableDTO) => {
    try {
      const res = await getDocumentoByIdMutation.mutateAsync(row.id)
      const obs = res.info?.data?.observacoes ?? ''
      const linhas = obs
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter((x) => x.startsWith('[REIMP_ORIGINAL]'))

      if (linhas.length === 0) {
        toast.info('Sem histórico de reimpressão original.')
        return
      }

      toast.info(linhas.join(' | '))
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Falha ao obter histórico de reimpressão.'
      toast.error(msg)
    }
  }

  const handleEmitirFatura = async (row: DocumentoTableDTO) => {
    try {
      const res = await getDetalhesAdmissoesMutation.mutateAsync(row.id)
      const itens = res.info?.data?.itens ?? []
      const primeiroComAdmissao = itens.find((i) => !!i.admissaoId)
      if (primeiroComAdmissao?.admissaoId) {
        navigate(
          `/area-financeira/faturacao/novo-documento?admissaoId=${primeiroComAdmissao.admissaoId}`,
        )
        return
      }

      const primeiroComConsulta = itens.find((i) => !!i.consultaId)
      if (primeiroComConsulta?.consultaId) {
        navigate(
          `/area-financeira/faturacao/novo-documento?consultaId=${primeiroComConsulta.consultaId}`,
        )
        return
      }

      toast.error('Sem origem clínica associada para conversão automática em fatura.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao preparar emissão de fatura.'
      toast.error(msg)
    }
  }

  const handleDetalhesAdmissoes = async (row: DocumentoTableDTO) => {
    try {
      const res = await getDetalhesAdmissoesMutation.mutateAsync(row.id)
      setDetalhesAdmissoes(res.info?.data ?? null)
      setDetalhesAdmissoesOpen(true)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Falha ao obter detalhes de admissões.'
      toast.error(msg)
    }
  }

  const handleMotivoAnulacao = async (row: DocumentoTableDTO) => {
    try {
      const res = await getDocumentoByIdMutation.mutateAsync(row.id)
      const motivo =
        res.info?.data?.motivoAnulacao?.trim() || 'Sem motivo de anulação registado.'
      toast.info(motivo)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Falha ao obter motivo de anulação.'
      toast.error(msg)
    }
  }

  const handleImprimirOriginal = async (row: DocumentoTableDTO) => {
    try {
      const res = await printOriginalMutation.mutateAsync(row.id)
      const template = res.info?.data?.template ?? 'TFatura'
      navigate(
        `/area-financeira/faturacao/documento/${row.id}?print=1&original=1&template=${encodeURIComponent(template)}`,
      )
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Falha ao preparar impressão original.'
      toast.error(msg)
    }
  }

  const handleReimprimir = async (row: DocumentoTableDTO) => {
    try {
      const res = await printMutation.mutateAsync(row.id)
      const template = res.info?.data?.template ?? 'TFatura'
      navigate(
        `/area-financeira/faturacao/documento/${row.id}?print=1&template=${encodeURIComponent(template)}`,
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao preparar reimpressão.'
      toast.error(msg)
    }
  }

  const handleLiquidar = async (row: DocumentoTableDTO) => {
    try {
      const res = await liquidacaoMutation.mutateAsync(row.id)
      const ctx = res.info?.data
      if (!ctx) {
        toast.error('Não foi possível obter contexto de liquidação.')
        return
      }

      if (ctx.isUtente && ctx.utenteId) {
        navigate(`/area-financeira/faturacao/liquidacao-utente?documentoId=${row.id}`)
        return
      }

      if (!ctx.isUtente && ctx.organismoId) {
        navigate(`/area-financeira/faturacao/liquidacao-organismo?documentoId=${row.id}`)
        return
      }

      toast.error('Documento sem entidade para liquidação.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao preparar liquidação.'
      toast.error(msg)
    }
  }

  const pageTitle = emContextoFicheiroEletronico
    ? `Ficheiro Eletrónico - ${siglaFicheiroLabel}`
    : 'Faturação'

  const selectedDocumentos = documentos.filter((d) => selectedRows.includes(d.id))
  const selectedEmailDocumentos = selectedDocumentos.filter((d) =>
    podeEnviarEmailDocumento(d),
  )

  const gerarFicheiroMutation = useMutation({
    mutationFn: (documentoId: string) =>
      FicheirosEletronicosService(ID_FUNCIONALIDADE_FE).gerar({
        documentoId,
        sigla: siglaFicheiroLabel!,
      }),
    onSuccess: (res) => {
      const info = res.info
      if (!info || !isFaturacaoApiSuccess(info) || !info.data) {
        toast.error(getFaturacaoApiErrorMessage(info, 'Falha ao gerar ficheiro.'))
        return
      }

      downloadFicheiroEletronicoGerado(info.data)

      if (info.data.erros?.length) {
        toast.warning(
          `Ficheiro gerado com avisos: ${info.data.erros.join(' · ')}`,
        )
      } else {
        toast.success('Ficheiro eletrónico gerado.')
      }

      void queryClient.invalidateQueries({ queryKey: ['ficheiros-eletronicos'] })
    },
    onError: () => toast.error('Falha ao gerar ficheiro eletrónico.'),
  })

  const toolbarActions: DataTableAction[] = [
    {
      label: emContextoFicheiroEletronico ? 'Adicionar' : 'Novo Documento',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => {
        const path =
          emContextoFicheiroEletronico && siglaFicheiroSlug
            ? buildNovoDocumentoFicheiroEletronicoUrl(
                siglaFicheiroSlug as FicheiroEletronicoSiglaSlug,
              )
            : '/area-financeira/faturacao/novo-documento'

        navigateManagedWindow(navigate, path, {
          title: emContextoFicheiroEletronico
            ? `Novo Documento — ${siglaFicheiroLabel}`
            : 'Novo Documento',
          forceNewInstance: true,
        })
      },
      variant: 'destructive',
    },
    ...(emContextoFicheiroEletronico
      ? [
          {
            label: 'Gerar ficheiro',
            icon: <FileDown className='h-4 w-4' />,
            onClick: () => {
              if (selectedRows.length !== 1) {
                toast.error('Selecione exactamente uma fatura.')
                return
              }
              const doc = documentos.find((d) => d.id === selectedRows[0])
              if (!doc?.organismoId) {
                toast.error('A fatura seleccionada não é a organismo.')
                return
              }
              if (!doc.estaEmitido || doc.anulado) {
                toast.error('Seleccione uma fatura emitida e não anulada.')
                return
              }
              gerarFicheiroMutation.mutate(doc.id)
            },
            variant: 'secondary' as const,
            className:
              'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
            disabled:
              selectedRows.length !== 1 || gerarFicheiroMutation.isPending,
          },
        ]
      : []),
    {
      label: 'Enviar emails (seleção)',
      icon: <Mail className='h-4 w-4' />,
      onClick: async () => {
        if (selectedRows.length === 0) {
          toast.error('Selecione pelo menos um documento.')
          return
        }

        if (selectedEmailDocumentos.length === 0) {
          toast.error('Nenhum documento selecionado está elegível para envio por email.')
          return
        }

        let successCount = 0
        let failCount = 0

        for (const doc of selectedEmailDocumentos) {
          try {
            await emailMutation.mutateAsync({ id: doc.id, payload: {} })
            successCount += 1
          } catch {
            failCount += 1
          }
        }

        if (successCount > 0) {
          toast.success(`Emails enviados: ${successCount}`)
        }
        if (failCount > 0) {
          toast.error(`Falhas no envio: ${failCount}`)
        }
      },
      variant: 'outline',
      disabled: selectedRows.length === 0 || emailMutation.isPending,
    },
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () =>
        toast.info('Listagens em preparação (legado: TfaturaListagemReport).'),
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: refresh,
      variant: 'outline',
    },
  ]

  return (
    <>
      <PageHead
        title={
          emContextoFicheiroEletronico
            ? `${pageTitle} | Área Financeira | CliCloud`
            : 'Faturação | Área Financeira | CliCloud'
        }
      />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={pageTitle}
          onBack={closeLikeTabBar}
          onRefresh={refresh}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar documentos</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar a lista'}
              </AlertDescription>
            </Alert>
          ) : null}
          <ListagemFaturacaoTable
            data={documentos}
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
            FilterControls={ListagemFaturacaoFilterControls}
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
            onOpenView={(row) =>
              navigateManagedWindow(
                navigate,
                `/area-financeira/faturacao/documento/${row.id}`,
                {
                  title: `Ver — ${row.numeroExibicao ?? row.id}`,
                  forceNewInstance: true,
                },
              )
            }
            onOpenEdit={(row) => {
              if (!podeEditarDocumento(row)) {
                toast.error('Documento anulado não pode ser editado.')
                return
              }
              navigateManagedWindow(
                navigate,
                `/area-financeira/faturacao/documento/${row.id}?edit=1`,
                {
                  title: `Editar — ${row.numeroExibicao ?? row.id}`,
                  forceNewInstance: true,
                },
              )
            }}
            renderExtraActions={(row) => (
              <ListagemFaturacaoRowActions
                row={row}
                onEnviarEmail={handleEnviarEmail}
                onHistoricoReimpressao={handleHistoricoReimpressao}
                onEmitirFatura={handleEmitirFatura}
                onDetalhesAdmissoes={handleDetalhesAdmissoes}
                onMotivoAnulacao={handleMotivoAnulacao}
                onValidacaoTransporte={setValidacaoTransporteDocumento}
                onImprimirOriginal={handleImprimirOriginal}
                onReimprimir={handleReimprimir}
                onLiquidar={handleLiquidar}
                onAnular={setAnularDocumento}
                onNotaCredito={setNotaCreditoDocumento}
              />
            )}
          />
          <AnularDocumentoDialog
            documento={anularDocumento}
            onOpenChange={(open) => {
              if (!open) setAnularDocumento(null)
            }}
          />
          <NotaCreditoDialog
            documento={notaCreditoDocumento}
            onOpenChange={(open) => {
              if (!open) setNotaCreditoDocumento(null)
            }}
          />
          <ValidacaoTransporteDialog
            documento={validacaoTransporteDocumento}
            isSaving={validacaoTransporteMutation.isPending}
            onSave={async (payload: AtualizarValidacaoTransporteRequest) => {
              if (!validacaoTransporteDocumento) return
              await validacaoTransporteMutation.mutateAsync({
                id: validacaoTransporteDocumento.id,
                payload,
              })
            }}
            onOpenChange={(open) => {
              if (!open) setValidacaoTransporteDocumento(null)
            }}
          />
          <DetalhesAdmissoesDialog
            open={detalhesAdmissoesOpen}
            detalhes={detalhesAdmissoes}
            onOpenChange={setDetalhesAdmissoesOpen}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
