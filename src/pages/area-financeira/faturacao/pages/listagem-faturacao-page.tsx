import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Ban,
  CreditCard,
  FileQuestion,
  FileText,
  History,
  List,
  Mail,
  Plus,
  Printer,
  RotateCw,
  Truck,
} from 'lucide-react'
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
import { ListagemFaturacaoTable } from '../components/listagem-faturacao-table'
import { ListagemFaturacaoFilterControls } from '../components/listagem-faturacao-filter-controls'
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
} from '../queries/documento-queries'
import {
  podeAnularDocumento,
  podeCriarNotaCredito,
  podeEnviarEmailDocumento,
  podeImprimirOriginalDocumento,
  podeEmitirFaturaDocumento,
  podeLiquidarDocumento,
  podeReimprimirDocumento,
  podeValidarTransporteDocumento,
} from '../utils/listagem-faturacao-acoes'

const ID_FUNCIONALIDADE = 'documentos'

export function ListagemFaturacaoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
  })

  const documentos = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => {
    setSelectedRows([])
    handleFiltersChange([])
    handlePaginationChange(1, pageSize)
    queryClient.invalidateQueries({ queryKey: documentoQueryKeys.all })
  }

  const selectedDocumentos = documentos.filter((d: DocumentoTableDTO) =>
    selectedRows.includes(d.id),
  )
  const selectedEmailDocumentos = selectedDocumentos.filter((d: DocumentoTableDTO) =>
    podeEnviarEmailDocumento(d),
  )

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Novo Documento',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => navigate('/area-financeira/faturacao/novo-documento'),
      variant: 'destructive',
    },
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
      <PageHead title='Faturação | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Faturação' onRefresh={refresh}>
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
              navigate(`/area-financeira/faturacao/documento/${row.id}`)
            }
            renderExtraActions={(row) => {
              const canAnular = podeAnularDocumento(row)
              const canNc = podeCriarNotaCredito(row)
              const canReimprimir = podeReimprimirDocumento(row)
              const canOriginal = podeImprimirOriginalDocumento(row)
              const canEmail = podeEnviarEmailDocumento(row)
              const canLiquidar = podeLiquidarDocumento(row)
              const canValidarTransporte = podeValidarTransporteDocumento(row)
              const canEmitirFatura = podeEmitirFaturaDocumento(row)

              return (
                <>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Histórico reimpressão original'
                    disabled={!canOriginal}
                    onClick={async () => {
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
                          e instanceof Error
                            ? e.message
                            : 'Falha ao obter histórico de reimpressão.'
                        toast.error(msg)
                      }
                    }}
                  >
                    <History className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Emitir fatura'
                    disabled={!canEmitirFatura}
                    onClick={async () => {
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

                        toast.error(
                          'Sem origem clínica associada para conversão automática em fatura.',
                        )
                      } catch (e) {
                        const msg =
                          e instanceof Error ? e.message : 'Falha ao preparar emissão de fatura.'
                        toast.error(msg)
                      }
                    }}
                  >
                    <FileText className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Detalhes admissões'
                    onClick={async () => {
                      try {
                        const res = await getDetalhesAdmissoesMutation.mutateAsync(row.id)
                        setDetalhesAdmissoes(res.info?.data ?? null)
                        setDetalhesAdmissoesOpen(true)
                      } catch (e) {
                        const msg =
                          e instanceof Error ? e.message : 'Falha ao obter detalhes de admissões.'
                        toast.error(msg)
                      }
                    }}
                  >
                    <List className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Ver motivo de anulação'
                    disabled={!row.anulado}
                    onClick={async () => {
                      try {
                        const res = await getDocumentoByIdMutation.mutateAsync(row.id)
                        const motivo =
                          res.info?.data?.motivoAnulacao?.trim() ||
                          'Sem motivo de anulação registado.'
                        toast.info(motivo)
                      } catch (e) {
                        const msg =
                          e instanceof Error ? e.message : 'Falha ao obter motivo de anulação.'
                        toast.error(msg)
                      }
                    }}
                  >
                    <FileQuestion className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Validação de transporte'
                    disabled={!canValidarTransporte}
                    onClick={() => setValidacaoTransporteDocumento(row)}
                  >
                    <Truck className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Imprimir original'
                    disabled={!canOriginal}
                    onClick={async () => {
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
                    }}
                  >
                    <Printer className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Enviar email'
                    disabled={!canEmail}
                    onClick={async () => {
                      try {
                        await emailMutation.mutateAsync({ id: row.id, payload: {} })
                        toast.success('Documento enviado por email com sucesso.')
                      } catch (e) {
                        const msg = e instanceof Error ? e.message : 'Falha ao enviar email.'
                        toast.error(msg)
                      }
                    }}
                  >
                    <Mail className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Liquidar/Pagamento'
                    disabled={!canLiquidar}
                    onClick={async () => {
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
                    }}
                  >
                    <CreditCard className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Reimprimir'
                    disabled={!canReimprimir}
                    onClick={async () => {
                      try {
                        const res = await printMutation.mutateAsync(row.id)
                        const template = res.info?.data?.template ?? 'TFatura'
                        navigate(`/area-financeira/faturacao/documento/${row.id}?print=1&template=${encodeURIComponent(template)}`)
                      } catch (e) {
                        const msg = e instanceof Error ? e.message : 'Falha ao preparar reimpressão.'
                        toast.error(msg)
                      }
                    }}
                  >
                    <Printer className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Anular'
                    disabled={!canAnular}
                    onClick={() => setAnularDocumento(row)}
                  >
                    <Ban className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Nota de Crédito'
                    disabled={!canNc}
                    onClick={() => setNotaCreditoDocumento(row)}
                  >
                    <FileText className='h-4 w-4' />
                  </Button>
                </>
              )
            }}
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
