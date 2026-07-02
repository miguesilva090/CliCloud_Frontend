import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  Check,
  CloudUpload,
  Eraser,
  FileText,
  FolderOpen,
  RotateCw,
  Undo2,
  X,
} from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { fieldGap, inputClass, labelClass } from '@/lib/form-styles'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'
import { useUtentesLight } from '@/pages/area-comum/tabelas/entidades/utentes/queries/utentes-queries'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import type {
  AdseComunicacaoModulo,
  AdseComunicacaoTableFilter,
} from '@/types/dtos/faturacao/adse-comunicacao.dtos'
import {
  formatDatePt,
  formatMoneyPt,
} from '@/pages/area-financeira/faturacao/utils/faturacao-documento-display'
import { AdsePreFaturasDialog } from '../components/adse-pre-faturas-dialog'
import { ADSE_PERM_ID } from '../queries/adse-config-queries'
import {
  useAdseComunicacaoPaginatedQuery,
  useAdsePreFaturasAbertasQuery,
} from '../queries/adse-comunicacao-queries'
import { useComunicarAdseDocumentosMutation } from '../queries/adse-comunicacao-mutations'
import {
  useLibertarAdseDocumentosMutation,
  useUploadAdsePdfMutation,
} from '../queries/adse-comunicacao-mutations'
import { adseComunicacaoPageTitle, ADSE_TIPO_PRE_FATURA } from '../adse-modulo-config'
import { DatePicker } from '@/components/ui/date-picker'


type Props = { modulo: AdseComunicacaoModulo }

function defaultDataInicial(): string {
  const trabalho = getDataTrabalhoIsoDate()
  const d = new Date(trabalho)
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd')
}

function defaultDataFinal(): string {
  return getDataTrabalhoIsoDate()
}

function buildFilter(applied: {
  dataInicial: string
  dataFinal: string
  estadoCom: string
  utenteId: string
  devolucoes: boolean
}): AdseComunicacaoTableFilter {
  return {
    pageNumber: 1,
    pageSize: 50,
    sorting: [],
    dataInicial: applied.dataInicial || null,
    dataFinal: applied.dataFinal || null,
    devolucoes: applied.devolucoes,
    estadoComunicacao: Number(applied.estadoCom) || null,
    utenteId: applied.utenteId || null,
  }
}

const toDate = (value: string): Date | undefined => 
  value ? new Date(`${value}T12:00:00`) : undefined


export function ComunicacaoAdseModuloPage({ modulo }: Props) {
  const title = adseComunicacaoPageTitle(modulo)
  const { canView } = useAreaComumEntityListPermissions(ADSE_PERM_ID)
  const isTratamentos = modulo === 'tratamentos'
  const isExames = modulo === 'exames'

  const [draftDataInicial, setDraftDataInicial] = useState(defaultDataInicial)
  const [draftDataFinal, setDraftDataFinal] = useState(defaultDataFinal)
  const [draftEstadoCom, setDraftEstadoCom] = useState('')
  const [draftUtenteId, setDraftUtenteId] = useState('')
  const [utenteSearch, setUtenteSearch] = useState('')
  const [debUtente] = useDebounce(utenteSearch, 300)

  const [devolucoes, setDevolucoes] = useState(false)
  const [preFaturaOrdem, setPreFaturaOrdem] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [modalPreFaturasOpen, setModalPreFaturasOpen] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<{
    documentoId: string
    origemClinicaId: string
    relatorioMedico: boolean
  } | null>(null)
  const inputUploadRef = useRef<HTMLInputElement | null>(null)

  const [applied, setApplied] = useState(() => ({
    dataInicial: defaultDataInicial(),
    dataFinal: defaultDataFinal(),
    estadoCom: '',
    utenteId: '',
    devolucoes: false,
  }))

  const filter = useMemo(
    () => ({
      ...buildFilter({...applied, devolucoes}),
      numOrdemPreFatura: preFaturaOrdem ? Number(preFaturaOrdem) : null,
    }),
    [applied, devolucoes, preFaturaOrdem],
  )

  const listQuery = useAdseComunicacaoPaginatedQuery(modulo, filter, canView)
  const preFaturasQuery = useAdsePreFaturasAbertasQuery(modulo)
  const comunicar = useComunicarAdseDocumentosMutation()
  const libertar = useLibertarAdseDocumentosMutation()
  const uploadPdf = useUploadAdsePdfMutation(modulo)
  const utentesQ = useUtentesLight(debUtente, canView)

  const linhas = listQuery.data?.info?.data?.linhas ?? []
  const totais = listQuery.data?.info?.data
  const preFaturas = preFaturasQuery.data?.info?.data ?? []

  useEffect(() => {
    if (preFaturas.length > 0 && !preFaturaOrdem) {
      setPreFaturaOrdem(String(preFaturas[0].numOrdem))
    }
  }, [preFaturas, preFaturaOrdem])

  const utenteItems = useMemo(
    () =>
      (utentesQ.data?.info?.data ?? []).map((u) => ({
        value: u.id,
        label: u.nome,
        secondary: u.numeroContribuinte ?? undefined,
      })),
    [utentesQ.data],
  )

  const aplicarFiltros = () => {
    setApplied({
      dataInicial: draftDataInicial,
      dataFinal: draftDataFinal,
      estadoCom: draftEstadoCom,
      utenteId: draftUtenteId,
      devolucoes,
    })
    setSelected([])
  }

  const limparFiltros = () => {
    const ini = defaultDataInicial()
    const fim = defaultDataFinal()
    setDraftDataInicial(ini)
    setDraftDataFinal(fim)
    setDraftEstadoCom('')
    setDraftUtenteId('')
    setUtenteSearch('')
    setDevolucoes(false)
    setApplied({
      dataInicial: ini,
      dataFinal: fim,
      estadoCom: '',
      utenteId: '',
      devolucoes: false,
    })
    setSelected([])
  }

  const toggleDevolucoes = () => {
    const next = !devolucoes
    setDevolucoes(next)
    setApplied((prev) => ({ ...prev, devolucoes: next }))
    setSelected([])
  }

  const executarOperacao = async (operacao: number) => {
    if (!preFaturaOrdem) {
      toast.error('Selecione uma pré-fatura.')
      return
    }
    if (selected.length === 0) {
      toast.error('Selecione pelo menos uma linha.')
      return
    }
    const payload = {
      tipoPreFatura: ADSE_TIPO_PRE_FATURA[modulo],
      numOrdemPreFatura: Number(preFaturaOrdem),
      operacao,
      devolucoes,
      linhas: linhas
        .filter((l) => selected.includes(l.id))
        .map((l) => ({
          origemClinicaId: l.origemClinicaId,
          documentoId: l.documentoId,
          numeroFatura: l.numeroFatura,
        })),
    }
    const res = await comunicar.mutateAsync(payload)
    const handled = handleApiResponse(res, 'Operação concluída.')
    if (handled.success) listQuery.refetch()
  }

  const executarLibertar = async () => {
    if (selected.length === 0) {
      toast.error('Selecione pelo menos uma linha.')
      return
    }
    const documentoIds = linhas
      .filter((l) => selected.includes(l.id))
      .map((l) => l.documentoId)
    const res = await libertar.mutateAsync(documentoIds)
    const handled = handleApiResponse<string>(res, 'Linhas libertadas.')
    if (handled.success) listQuery.refetch()
  }

  const abrirUpload = (row: (typeof linhas)[number], relatorioMedico: boolean) => {
    setUploadTarget({
      documentoId: row.documentoId,
      origemClinicaId: row.origemClinicaId,
      relatorioMedico,
    })
    inputUploadRef.current?.click()
  }

  const onUploadChanged = async (file?: File | null) => {
    if (!uploadTarget || !file) return
    if (file.type !== 'application/pdf') {
      toast.error('Apenas ficheiros PDF são permitidos.')
      return
    }
    const base64 = await fileToBase64(file)
    const res = await uploadPdf.mutateAsync({
      documentoId: uploadTarget.documentoId,
      origemClinicaId: uploadTarget.origemClinicaId,
      nomeFicheiro: file.name,
      conteudoBase64: base64,
      relatorioMedico: uploadTarget.relatorioMedico,
    })
    const handled = handleApiResponse(res, 'PDF registado com sucesso.')
    if (handled.success) listQuery.refetch()
  }

  if (!canView) return null

  const colOrigem = isTratamentos ? 'Trat.' : isExames ? 'Nº Mar.' : 'Nº'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumDashboardCard title={title} contentClassName='space-y-4'>
          <div className='rounded-lg border bg-background p-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              <div className={fieldGap}>
                <Label htmlFor='adse-data-inicial' className={labelClass}>Data Inicial</Label>

                <DatePicker
                  id='adse-data-inicial'
                  value={toDate(draftDataInicial)}
                  onChange={(date) => setDraftDataInicial(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholder='Data Inicial'
                  displayFormat='dd/MM/yyyy'
                  className={inputClass}
                />
              </div>
              <div className={fieldGap}>
                <Label htmlFor='adse-data-final' className={labelClass}>Data Final</Label>
                <DatePicker
                  id='adse-data-final'
                  value={toDate(draftDataFinal)}
                  onChange={(date) => setDraftDataFinal(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholder='Data Final'
                  displayFormat='dd/MM/yyyy'
                  className={inputClass}
                />
              </div>
              <div className={fieldGap}>
                <Label className={labelClass}>Estado Com.</Label>
                <Select
                  value={draftEstadoCom || '0'}
                  onValueChange={(v) => setDraftEstadoCom(v === '0' ? '' : v)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder='Estado Com.' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Todos</SelectItem>
                    <SelectItem value='1'>Por Comunicar s/ PDF</SelectItem>
                    <SelectItem value='2'>Por Comunicar c/ PDF</SelectItem>
                    <SelectItem value='3'>Comunicado</SelectItem>
                    <SelectItem value='4'>Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={fieldGap}>
                <Label className={labelClass}>Utente</Label>
                <AsyncCombobox
                  value={draftUtenteId}
                  onChange={setDraftUtenteId}
                  items={utenteItems}
                  isLoading={utentesQ.isFetching}
                  placeholder='Utente'
                  searchPlaceholder='Pesquisar utente...'
                  emptyText='Sem resultados'
                  searchValue={utenteSearch}
                  onSearchValueChange={setUtenteSearch}
                  className={inputClass}
                />
              </div>
            </div>
            <div className='mt-4 flex flex-wrap gap-2'>
              <Button size='sm' onClick={aplicarFiltros}>
                Aplicar Filtros
              </Button>
              <Button size='sm' variant='outline' onClick={limparFiltros}>
                <Eraser className='mr-1 h-4 w-4' />
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className='flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between'>
            <div className='flex flex-wrap items-center gap-2'>
              <Button size='sm' onClick={() => setModalPreFaturasOpen(true)}>
                <FolderOpen className='mr-1 h-4 w-4' />
                Pré-Faturas
              </Button>
              <Button
                size='sm'
                variant={devolucoes ? 'default' : 'outline'}
                onClick={toggleDevolucoes}
              >
                <RotateCw className='mr-1 h-4 w-4' />
                Devoluções
              </Button>
            </div>

            <div className='flex flex-wrap items-end gap-2'>
              <div className={fieldGap}>
                <Label className={labelClass}>N. Pré-Fatura</Label>
                <Select value={preFaturaOrdem} onValueChange={setPreFaturaOrdem}>
                  <SelectTrigger className='h-8 w-[140px]'>
                    <SelectValue placeholder='N. Pré-Fatura' />
                  </SelectTrigger>
                  <SelectContent>
                    {preFaturas.map((p) => (
                      <SelectItem key={p.id} value={String(p.numOrdem)}>
                        {p.codigo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant='outline'
                size='icon'
                className='mb-0.5 h-8 w-8 shrink-0 text-emerald-600'
                onClick={() => preFaturasQuery.refetch()}
              >
                <RotateCw className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex flex-wrap items-center justify-end gap-2'>
              <Button size='sm' onClick={() => executarOperacao(1)}>
                <Check className='mr-1 h-4 w-4' /> Validar
              </Button>
              <Button
                size='sm'
                className='bg-emerald-600 hover:bg-emerald-700'
                onClick={() => executarOperacao(2)}
              >
                <CloudUpload className='mr-1 h-4 w-4' /> Comunicar
              </Button>
              <Button size='sm' variant='destructive' onClick={() => executarOperacao(3)}>
                <X className='mr-1 h-4 w-4' /> Eliminar
              </Button>
              {devolucoes && (
                <Button
                  size='sm'
                  variant='outline'
                  className='border-amber-500 text-amber-600'
                  onClick={executarLibertar}
                >
                  <Undo2 className='mr-1 h-4 w-4' /> Libertar
                </Button>
              )}
              <Button
                size='sm'
                variant='outline'
                onClick={() => executarOperacao(4)}
              >
                <FileText className='mr-1 h-4 w-4' /> Substituir PDF
              </Button>
              {isTratamentos && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => executarOperacao(5)}
                >
                  <FileText className='mr-1 h-4 w-4' /> Substituir Relatório
                </Button>
              )}
            </div>
          </div>

          <div className='overflow-x-auto rounded-lg border bg-card'>
            <table className='w-full min-w-[1100px] text-sm'>
              <thead>
                <tr className='border-b bg-muted text-left'>
              <th className='w-8 p-2' />
              <th className='p-2 whitespace-nowrap'>{colOrigem}</th>
              {isTratamentos && (
                <>
                  <th className='p-2 whitespace-nowrap'>Data Ini.</th>
                  <th className='p-2 whitespace-nowrap'>Data Fim</th>
                  <th className='p-2 whitespace-nowrap'>Nº</th>
                </>
              )}
              <th className='p-2 whitespace-nowrap'>Utente</th>
              <th className='p-2 whitespace-nowrap'>Nº FR</th>
              <th className='p-2 whitespace-nowrap'>Data FR</th>
              <th className='p-2 whitespace-nowrap'>Val. FR</th>
              <th className='p-2 whitespace-nowrap'>Val. ADSE</th>
              <th className='p-2 whitespace-nowrap'>Pré-Fatura</th>
              <th className='p-2 whitespace-nowrap'>FT ADSE</th>
              <th className='p-2 whitespace-nowrap'>Estado</th>
              <th className='p-2 whitespace-nowrap'>Comunicação</th>
              <th className='p-2 whitespace-nowrap'>Pdf</th>
              {isTratamentos && <th className='p-2 whitespace-nowrap'>Relat.</th>}
              <th className='p-2 whitespace-nowrap'>Erros</th>
            </tr>
          </thead>
          <tbody className='bg-card'>
            {listQuery.isFetching ? (
              <tr>
                <td
                  colSpan={isTratamentos ? 17 : 13}
                  className='p-6 text-center text-muted-foreground'
                >
                  A carregar...
                </td>
              </tr>
            ) : linhas.length === 0 ? (
              <tr>
                <td
                  colSpan={isTratamentos ? 17 : 13}
                  className='p-6 text-center text-muted-foreground'
                >
                  Não existem dados a apresentar
                </td>
              </tr>
            ) : (
              linhas.map((row) => (
                <tr key={row.id} className='border-b'>
                  <td className='p-2'>
                    <input
                      type='checkbox'
                      checked={selected.includes(row.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, row.id]
                            : prev.filter((id) => id !== row.id),
                        )
                      }
                    />
                  </td>
                  <td className='p-2 whitespace-nowrap'>{row.numeroOrigem || '—'}</td>
                  {isTratamentos && (
                    <>
                      <td className='p-2 whitespace-nowrap'>
                        {formatDatePt(row.dataInicio ?? null)}
                      </td>
                      <td className='p-2 whitespace-nowrap'>
                        {formatDatePt(row.dataFim ?? null)}
                      </td>
                      <td className='p-2 whitespace-nowrap'>{row.numeroSessoes}</td>
                    </>
                  )}
                  <td className='p-2'>{row.utenteNome}</td>
                  <td className='p-2 whitespace-nowrap'>{row.numeroFatura}</td>
                  <td className='p-2 whitespace-nowrap'>
                    {formatDatePt(row.dataFatura ?? null)}
                  </td>
                  <td className='p-2 whitespace-nowrap text-right'>
                    {formatMoneyPt(row.valorFatura)}
                  </td>
                  <td className='p-2 whitespace-nowrap text-right'>
                    {formatMoneyPt(row.valorAdse)}
                  </td>
                  <td className='p-2 whitespace-nowrap'>{row.preFatura ?? ''}</td>
                  <td className='p-2 whitespace-nowrap'>{row.faturaAdse ?? ''}</td>
                  <td className='p-2 whitespace-nowrap'>{row.estadoDescricao}</td>
                  <td className='p-2 whitespace-nowrap'>
                    {formatDatePt(row.dataComunicacao ?? null)}
                  </td>
                  <td className='p-2 text-center'>
                    <FileText
                      className={`mx-auto h-4 w-4 ${
                        row.pdfFicheiro ? 'text-primary' : 'text-muted-foreground/40'
                      }`}
                      onClick={() => abrirUpload(row, false)}
                    />
                  </td>
                  {isTratamentos && (
                    <td className='p-2 text-center'>
                      <FileText
                        className={`mx-auto h-4 w-4 ${
                          row.pdfRelatorioFicheiro
                            ? 'text-primary'
                            : 'text-muted-foreground/40'
                        }`}
                        onClick={() => abrirUpload(row, true)}
                      />
                    </td>
                  )}
                  <td className='p-2 text-destructive'>{row.erros ?? ''}</td>
                </tr>
              ))
            )}
            </tbody>
            <tfoot>
              <tr className='border-t bg-muted text-sm'>
                <td colSpan={isTratamentos ? 8 : 5} className='p-2' />
                <td className='p-2 font-medium'>Total FR (Pág):</td>
                <td className='p-2 text-right font-medium'>
                  {formatMoneyPt(totais?.totalFaturaPagina)}
                </td>
                <td className='p-2 font-medium'>Total ADSE (Pág):</td>
                <td className='p-2 text-right font-medium'>
                  {formatMoneyPt(totais?.totalAdsePagina)}
                </td>
                <td colSpan={isTratamentos ? 6 : 5} className='p-2' />
              </tr>
              <tr className='bg-muted text-sm'>
                <td colSpan={isTratamentos ? 8 : 5} className='p-2' />
                <td className='p-2 font-medium'>Total FR:</td>
                <td className='p-2 text-right font-medium'>
                  {formatMoneyPt(totais?.totalFatura)}
                </td>
                <td className='p-2 font-medium'>Total ADSE:</td>
                <td className='p-2 text-right font-medium'>
                  {formatMoneyPt(totais?.totalAdse)}
                </td>
                <td colSpan={isTratamentos ? 6 : 5} className='p-2' />
              </tr>
            </tfoot>
          </table>
          </div>

          <AdsePreFaturasDialog
            open={modalPreFaturasOpen}
            modulo={modulo}
            onClose={() => setModalPreFaturasOpen(false)}
            onPreFaturaSelecionada={(numOrdem) => setPreFaturaOrdem(String(numOrdem))}
          />
          <input
            ref={inputUploadRef}
            type='file'
            accept='application/pdf'
            className='hidden'
            onChange={(e) => onUploadChanged(e.target.files?.[0] ?? null)}
          />
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}

async function fileToBase64(file: File): Promise<string> {
  const data = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(data)
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}
