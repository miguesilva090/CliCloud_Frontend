import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { modules } from '@/config/modules'
import { ReceitaMedicaService } from '@/lib/services/prescricao/receita-medica-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { useUtentesLight } from '@/pages/area-comum/tabelas/entidades/utentes/queries/utentes-queries'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateReceitaLinhaRequest,
  CreateReceitaMedicaRequest,
} from '@/types/dtos/prescricao/receita-medica.dtos'
import { toast } from '@/utils/toast-utils'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { ReceitaCabecalho } from '../components/receita-cabecalho'
import { ReceitaTabMedicacao } from '../components/receita-tab-medicacao'
import type { LinhaDraft } from '../components/receita-tab-medicacao'
import { ReceitaTabUtente } from '../components/receita-tab-utente'
import {
  useReceitaUtentePatologias,
  unwrapPatologiasList,
} from '../queries/utente-patologias-queries'
import { buildPatologiasInfarmedParam } from '../utils/build-patologias-infarmed-param'
import { extractReceitaApiError } from '../utils/receita-api-error'
import { enrichLinhasPrecos } from '../utils/enrich-linhas-precos'
import {
  linhaJustificacaoInvalida,
  MSG_JAU,
} from '../utils/justificacao-quantidade'
import {
  derivePrescricaoPorNomeHeader,
  linhaMotivoInvalida,
  MSG_MOTIVO,
} from '../utils/motivo-prescricao-nome'
import {
  linhaIndicacaoInvalida,
  MSG_INDICACAO,
} from '../utils/indicacao-terapeutica'

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

function emptyLinha(ordem: number, tipoReceita: number): LinhaDraft {
  return {
    key: crypto.randomUUID(),
    ordem,
    tipoLinha: tipoReceita,
    designacao: '',
    quantidade: 1,
    posologia: '',
    codValidade: 1,
    codTipoPrescricao: 1,
    codMotivo: null,
    codIndicacaoTerapeutica: null,
    diploma: null,
    embalagemUnitaria: false,
    tipoTratamento: 1,
  }
}

export function ReceitaEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'nova'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const closeWindow = useCloseCurrentWindowLikeTabBar()

  const [tab, setTab] = useState('utente')
  const [utenteId, setUtenteId] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [medicoNome, setMedicoNome] = useState('')
  const [dataPrescricao, setDataPrescricao] = useState<Date | undefined>(
    new Date()
  )
  const [tipoReceita, setTipoReceita] = useState(1)
  const [receitaRenovavel, setReceitaRenovavel] = useState(0)
  const [numeroVias, setNumeroVias] = useState(1)
  const [numeroReceitaLocal, setNumeroReceitaLocal] = useState<string | null>(
    null
  )
  const [numeroReceita, setNumeroReceita] = useState<string | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [numeroBeneficiarioEfr, setNumeroBeneficiarioEfr] = useState('')
  const [siglaEfr, setSiglaEfr] = useState<string | null>(null)
  const [linhas, setLinhas] = useState<LinhaDraft[]>([])
  const [readOnly, setReadOnly] = useState(false)
  const [canEnviar, setCanEnviar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [utenteSearch, setUtenteSearch] = useState('')

  const utentesQuery = useUtentesLight(utenteSearch)
  const utenteOptions = useMemo(() => {
    const list = utentesQuery.data?.info?.data ?? []
    return list.map((u) => ({
      value: u.id,
      label: (u as { nome?: string }).nome ?? u.id,
    }))
  }, [utentesQuery.data])

  const patologiasQuery = useReceitaUtentePatologias(utenteId || null)
  const patologias = useMemo(
    () => unwrapPatologiasList(patologiasQuery.data),
    [patologiasQuery.data]
  )
  const patologiasInfarmed = useMemo(
    () => buildPatologiasInfarmedParam(patologias),
    [patologias]
  )

  const receitaQuery = useQuery({
    queryKey: ['receita-medica', id],
    enabled: !isNew && Boolean(id),
    queryFn: () => ReceitaMedicaService(permissionId).getById(id!),
  })

  useEffect(() => {
    const loadMedico = async () => {
      try {
        const res = await MedicosService('processo-clinico').getCurrentMedico()
        if (res.info?.status === ResponseStatus.Success && res.info.data?.id) {
          setMedicoId(res.info.data.id)
          setMedicoNome(res.info.data.nome ?? '')
        }
      } catch {
        /* ignore */
      }
    }
    void loadMedico()
  }, [])

  useEffect(() => {
    const envelope = receitaQuery.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success || !envelope.data)
      return
    const r = envelope.data
    setUtenteId(r.utenteId)
    setMedicoId(r.medicoId)
    setDataPrescricao(r.dataPrescricao ? new Date(r.dataPrescricao) : undefined)
    setTipoReceita(r.tipoReceita)
    setReceitaRenovavel(r.receitaRenovavel ?? 0)
    setNumeroVias(r.numeroVias ?? 1)
    setNumeroReceitaLocal(r.numeroReceitaLocal ?? null)
    setNumeroReceita(r.numeroReceita ?? null)
    setObservacoes(r.observacoes ?? '')
    setNumeroBeneficiarioEfr(r.numeroBeneficiarioEfr ?? '')
    setSiglaEfr(r.siglaEfr ?? null)
    setReadOnly(r.anulada === 1 || r.enviada === 1)
    setCanEnviar(r.anulada !== 1 && r.enviada !== 1)
    setLinhas(
      (r.linhas ?? []).map((l, idx) => ({
        key: l.id ?? crypto.randomUUID(),
        ordem: l.ordem || idx + 1,
        tipoLinha: l.tipoLinha || 1,
        embId: l.embId,
        cnpem: l.cnpem,
        designacao: l.designacao,
        descricaoEmbalagem: l.descricaoEmbalagem,
        quantidade: l.quantidade,
        pvp: l.pvp,
        comparticipacao: l.comparticipacao,
        valorUtente: l.valorUtente,
        posologia: l.posologia ?? '',
        posologiaQuantidadeUnidade: l.posologiaQuantidadeUnidade,
        posologiaQuantidadeValor: l.posologiaQuantidadeValor,
        posologiaFrequenciaUnidade: l.posologiaFrequenciaUnidade,
        posologiaFrequenciaValor: l.posologiaFrequenciaValor,
        posologiaDuracaoUnidade: l.posologiaDuracaoUnidade,
        posologiaDuracaoValor: l.posologiaDuracaoValor,
        posologiaInstrucoes: l.posologiaInstrucoes,
        codValidade: l.codValidade ?? 1,
        codJustificacaoQuantidade: l.codJustificacaoQuantidade,
        justificacaoQuantidade: l.justificacaoQuantidade,
        codTipoPrescricao: l.codTipoPrescricao ?? 1,
        codMotivo: l.codMotivo ?? null,
        codIndicacaoTerapeutica: l.codIndicacaoTerapeutica ?? null,
        diploma: l.diploma ?? null,
        embalagemUnitaria: false,
        tipoTratamento: 1,
      }))
    )
  }, [receitaQuery.data])

  const updateLinha = (key: string, patch: Partial<LinhaDraft>) => {
    setLinhas((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l))
    )
  }

  const handleAddInfarmedLinha = (linha: CreateReceitaLinhaRequest): string => {
    const key = crypto.randomUUID()
    setLinhas((prev) => [
      ...prev,
      {
        ...linha,
        key,
        ordem: prev.length + 1,
        embalagemUnitaria: false,
        tipoTratamento: 1,
      },
    ])
    return key
  }

  const limparDados = () => {
    if (readOnly) return
    setUtenteId('')
    setObservacoes('')
    setNumeroBeneficiarioEfr('')
    setSiglaEfr(null)
    setTipoReceita(1)
    setReceitaRenovavel(0)
    setNumeroVias(1)
    setDataPrescricao(new Date())
    setLinhas([])
    setTab('utente')
  }

  const buildPayload = (): CreateReceitaMedicaRequest | null => {
    if (!utenteId) {
      toast.error('Seleccione o utente.', 'Validação')
      setTab('utente')
      return null
    }
    if (!medicoId || !dataPrescricao) {
      toast.error('Médico e data são obrigatórios.', 'Validação')
      return null
    }
    const linhasValidas = linhas.filter((l) => l.designacao.trim())
    if (linhasValidas.length === 0) {
      toast.error(
        'Atenção, a receita tem de conter pelo menos um medicamento.',
        'Validação'
      )
      setTab('medicacao')
      return null
    }
    if (
      linhasValidas.some((l) => {
        if (l.tipoLinha === 8) return false
        const estruturada =
          Boolean(l.posologiaQuantidadeUnidade?.trim()) &&
          Boolean(l.posologiaQuantidadeValor?.trim()) &&
          Boolean(l.posologiaFrequenciaUnidade?.trim()) &&
          Boolean(l.posologiaFrequenciaValor?.trim())
        return !estruturada && !String(l.posologia ?? '').trim()
      })
    ) {
      toast.error(
        'Atenção, a POSOLOGIA é de preenchimento obrigatório.',
        'Validação'
      )
      setTab('medicacao')
      return null
    }
    if (linhasValidas.some((l) => linhaJustificacaoInvalida(l))) {
      toast.error(MSG_JAU.obrigatoriaGuardar, 'Validação')
      setTab('medicacao')
      return null
    }
    if (linhasValidas.some((l) => linhaMotivoInvalida(l))) {
      toast.error(MSG_MOTIVO.obrigatorio, 'Validação')
      setTab('medicacao')
      return null
    }
    if (linhasValidas.some((l) => linhaIndicacaoInvalida(l))) {
      toast.error(MSG_INDICACAO.obrigatoria, 'Validação')
      setTab('medicacao')
      return null
    }
    const headerMotivo = derivePrescricaoPorNomeHeader(linhasValidas)
    return {
      utenteId,
      medicoId,
      dataPrescricao: dataPrescricao.toISOString(),
      tipoReceita,
      desmaterializada: 1,
      receitaRenovavel,
      numeroVias,
      prescricaoPorNome: headerMotivo.prescricaoPorNome,
      motivoPrescricaoNome: headerMotivo.motivoPrescricaoNome,
      numeroBeneficiarioEfr: numeroBeneficiarioEfr || null,
      siglaEfr: siglaEfr,
      observacoes: observacoes || null,
      linhas: linhasValidas.map((l, idx) => ({
        ordem: idx + 1,
        tipoLinha: l.tipoLinha,
        embId: l.embId,
        cnpem: l.cnpem,
        designacao: l.designacao.trim(),
        descricaoEmbalagem: l.descricaoEmbalagem,
        quantidade: l.quantidade,
        pvp: l.pvp,
        comparticipacao: l.comparticipacao,
        valorUtente: l.valorUtente,
        posologia: l.posologia,
        posologiaQuantidadeUnidade: l.posologiaQuantidadeUnidade,
        posologiaQuantidadeValor: l.posologiaQuantidadeValor,
        posologiaFrequenciaUnidade: l.posologiaFrequenciaUnidade,
        posologiaFrequenciaValor: l.posologiaFrequenciaValor,
        posologiaDuracaoUnidade: l.posologiaDuracaoUnidade,
        posologiaDuracaoValor: l.posologiaDuracaoValor,
        posologiaInstrucoes: l.posologiaInstrucoes,
        codValidade: l.codValidade,
        codJustificacaoQuantidade: l.codJustificacaoQuantidade,
        justificacaoQuantidade: l.justificacaoQuantidade,
        codTipoPrescricao: l.codTipoPrescricao ?? 1,
        codMotivo: l.codMotivo ?? null,
        codIndicacaoTerapeutica: l.codIndicacaoTerapeutica ?? null,
        diploma: l.diploma ?? null,
      })),
    }
  }

  const handleSave = async () => {
    const payload = buildPayload()
    if (!payload) return
    setSaving(true)
    try {
      payload.linhas = await enrichLinhasPrecos(
        payload.linhas,
        patologiasInfarmed
      )
      setLinhas((prev) =>
        prev.map((l) => {
          const match = payload.linhas.find(
            (x) =>
              x.designacao === l.designacao &&
              (x.embId ?? null) === (l.embId ?? null)
          )
          return match
            ? {
                ...l,
                pvp: match.pvp,
                comparticipacao: match.comparticipacao,
                valorUtente: match.valorUtente,
                cnpem: match.cnpem ?? l.cnpem,
                descricaoEmbalagem:
                  match.descricaoEmbalagem ?? l.descricaoEmbalagem,
              }
            : l
        })
      )

      const client = ReceitaMedicaService(permissionId)
      const response = isNew
        ? await client.create(payload)
        : await client.update(id!, payload)
      if (response.info?.status === ResponseStatus.Success) {
        toast.success(isNew ? 'Receita criada.' : 'Receita actualizada.')
        queryClient.invalidateQueries({
          queryKey: ['receitas-medicas-paginated'],
        })
        const newId = response.info.data
        if (isNew && newId) {
          navigate(`/area-clinica/prescricao-eletronica/${newId}`, {
            replace: true,
          })
          return
        }
        await receitaQuery.refetch()
      } else {
        const msg =
          Object.values(response.info?.messages ?? {})
            .flat()
            .filter(Boolean)
            .join(' ') || 'Falha ao guardar receita.'
        toast.error(msg)
      }
    } catch (err: unknown) {
      toast.error(extractReceitaApiError(err, 'Erro ao guardar receita.'))
    } finally {
      setSaving(false)
    }
  }

  const handleEnviar = async () => {
    if (!id || isNew) {
      toast.error('Guarde a receita antes de enviar.')
      return
    }
    setSending(true)
    try {
      const response = await ReceitaMedicaService(permissionId).enviar(id)
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Receita enviada ao SPMS.')
        queryClient.invalidateQueries({
          queryKey: ['receitas-medicas-paginated'],
        })
        await receitaQuery.refetch()
      } else {
        const msg =
          Object.values(response.info?.messages ?? {})
            .flat()
            .filter(Boolean)
            .join(' ') || 'Falha ao enviar receita.'
        toast.error(msg)
        await receitaQuery.refetch()
      }
    } catch (err: unknown) {
      toast.error(extractReceitaApiError(err, 'Erro ao enviar receita.'))
    } finally {
      setSending(false)
    }
  }

  const goBack = () => {
    closeWindow()
    navigate('/area-clinica/prescricao-eletronica')
  }

  return (
    <>
      <PageHead
        title={`${isNew ? 'Nova' : 'Editar'} receita | CliCloud`}
      />
      <DashboardPageContainer>
        <AreaComumDashboardCard
          title={isNew ? 'Nova receita (RSP)' : 'Receita médica'}
          onBack={goBack}
          headerTrailing={
            <div className='flex flex-wrap gap-2'>
              {!readOnly ? (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={limparDados}
                  disabled={saving || sending}
                >
                  Limpar dados
                </Button>
              ) : null}
              {!readOnly ? (
                <Button
                  type='button'
                  size='sm'
                  onClick={handleSave}
                  disabled={saving || sending}
                >
                  Gravar receita
                </Button>
              ) : null}
              {!isNew && canEnviar ? (
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={handleEnviar}
                  disabled={saving || sending}
                >
                  <Send className='mr-1 h-4 w-4' />
                  Enviar SPMS
                </Button>
              ) : null}
            </div>
          }
        >
          <div className='space-y-4'>
            <ReceitaCabecalho
              numeroReceitaLocal={numeroReceitaLocal}
              numeroReceita={numeroReceita}
              dataPrescricao={dataPrescricao}
              onDataPrescricaoChange={setDataPrescricao}
              tipoReceita={tipoReceita}
              onTipoReceitaChange={setTipoReceita}
              numeroVias={numeroVias}
              onNumeroViasChange={setNumeroVias}
              receitaRenovavel={receitaRenovavel}
              onReceitaRenovavelChange={setReceitaRenovavel}
              linhas={linhas}
              readOnly={readOnly}
            />

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value='utente'>Utente</TabsTrigger>
                <TabsTrigger value='medicacao'>Medicação</TabsTrigger>
              </TabsList>

              <TabsContent value='utente' className='mt-4'>
                <ReceitaTabUtente
                  utenteId={utenteId}
                  onUtenteIdChange={setUtenteId}
                  utenteOptions={utenteOptions}
                  utenteSearch={utenteSearch}
                  onUtenteSearchChange={setUtenteSearch}
                  utenteOptionsLoading={utentesQuery.isFetching}
                  medicoNome={medicoNome}
                  observacoes={observacoes}
                  onObservacoesChange={setObservacoes}
                  numeroBeneficiarioEfr={numeroBeneficiarioEfr}
                  onNumeroBeneficiarioEfrChange={setNumeroBeneficiarioEfr}
                  onSiglaEfrChange={setSiglaEfr}
                  patologias={patologias}
                  onPatologiasChanged={() => {
                    void patologiasQuery.refetch()
                  }}
                  readOnly={readOnly}
                />
              </TabsContent>

              <TabsContent value='medicacao' className='mt-4'>
                <ReceitaTabMedicacao
                  tipoReceita={tipoReceita}
                  patologias={patologiasInfarmed}
                  readOnly={readOnly}
                  linhas={linhas}
                  onAddLinha={handleAddInfarmedLinha}
                  onAddLinhaManual={() =>
                    setLinhas((prev) => [
                      ...prev,
                      emptyLinha(prev.length + 1, tipoReceita),
                    ])
                  }
                  onUpdateLinha={updateLinha}
                  onRemoveLinha={(key) =>
                    setLinhas((prev) => prev.filter((x) => x.key !== key))
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
