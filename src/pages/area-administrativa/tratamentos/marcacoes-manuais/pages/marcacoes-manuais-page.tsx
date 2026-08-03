import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { Plus, Save } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { EntityFormPageHeader } from '@/components/shared/entity-form-page-header'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { PatologiaService } from '@/lib/services/patologias/patologia-service'
import { TratamentoService } from '@/lib/services/tratamentos/tratamento-service'
import { ListaEsperaTratamentoAdministrativoService } from '@/lib/services/tratamentos/lista-espera-tratamento-administrativo-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type {
  CreateMarcacaoManualServicoItem,
  CreateMarcacaoManualSessaoItem,
} from '@/types/dtos/tratamentos/tratamento.dtos'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

type ServicoRow = CreateMarcacaoManualServicoItem & { key: string; label: string }
type SessaoRow = CreateMarcacaoManualSessaoItem & {
  key: string
  fisioLabel?: string
  auxLabel?: string
  outroLabel?: string
}

function withSelected(items: ComboboxItem[], id: string, label: string): ComboboxItem[] {
  if (!id) return items
  if (items.some((i) => i.value === id)) return items
  return [{ value: id, label: label || id }, ...items]
}

function diaSemana(isoDate: string) {
  if (!isoDate) return '—'
  const d = new Date(isoDate + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-PT', { weekday: 'long' })
}

function isGuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  )
}

function parseOptDecimal(raw: string): number | null {
  const t = raw.trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

async function loadTecnicos(tipo: number, keyword: string, perm: string) {
  const res = await TecnicoService(perm).getTecnicosPaginated({
    pageNumber: 1,
    pageSize: 30,
    filters: [
      { id: 'tipoTecnico', value: String(tipo) },
      ...(keyword ? [{ id: 'nome', value: keyword }] : []),
    ],
  })
  return res.info?.data ?? []
}

export function MarcacoesManuaisPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const listaEsperaId = params.get('listaEsperaId') ?? ''
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const { canView, canChange, canAdd } = useAreaComumEntityListPermissions(listPermId)
  const canSave = canAdd || canChange

  const [tab, setTab] = useState('tratamento')

  // --- Tab Tratamento ---
  const [utenteId, setUtenteId] = useState('')
  const [utenteLabel, setUtenteLabel] = useState('')
  const [organismoId, setOrganismoId] = useState('')
  const [organismoLabel, setOrganismoLabel] = useState('')
  const [numBenif, setNumBenif] = useState('')
  const [apolice, setApolice] = useState('')
  const [taxaModAtiva, setTaxaModAtiva] = useState(false)
  const [isencao, setIsencao] = useState('')
  const [localOrigemId, setLocalOrigemId] = useState('')
  const [localOrigemLabel, setLocalOrigemLabel] = useState('')
  const [localId, setLocalId] = useState('')
  const [localLabel, setLocalLabel] = useState('')
  const [designacao, setDesignacao] = useState('')
  const [sinistroId, setSinistroId] = useState('')
  const [usaFisio, setUsaFisio] = useState(true)
  const [fisioId, setFisioId] = useState('')
  const [fisioLabel, setFisioLabel] = useState('')
  const [usaAux, setUsaAux] = useState(false)
  const [auxId, setAuxId] = useState('')
  const [auxLabel, setAuxLabel] = useState('')
  const [usaOutro, setUsaOutro] = useState(false)
  const [outroId, setOutroId] = useState('')
  const [outroLabel, setOutroLabel] = useState('')
  const [provisorio, setProvisorio] = useState(false)
  const [alta, setAlta] = useState(false)
  const [terapiaFala, setTerapiaFala] = useState(false)
  const [credencialExterna, setCredencialExterna] = useState(false)
  const [credencial, setCredencial] = useState('')
  const [numCartao, setNumCartao] = useState('')
  const [dataInic, setDataInic] = useState('')
  const [nFaltMax, setNFaltMax] = useState('4')
  const [nFaltComax, setNFaltComax] = useState('2')
  const [duracaoTotal, setDuracaoTotal] = useState('')
  const [tecObs, setTecObs] = useState('')

  // --- Tab Serviços ---
  const [medicoId, setMedicoId] = useState('')
  const [medicoLabel, setMedicoLabel] = useState('')
  const [nomePatologia, setNomePatologia] = useState('')
  const [servicos, setServicos] = useState<ServicoRow[]>([])
  const [selServicos, setSelServicos] = useState<string[]>([])
  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [servicoEditKey, setServicoEditKey] = useState<string | null>(null)
  const [espTecModalOpen, setEspTecModalOpen] = useState(false)
  const [pickServicoId, setPickServicoId] = useState('')
  const [pickServicoLabel, setPickServicoLabel] = useState('')
  const [pickDuracao, setPickDuracao] = useState('')
  const [pickOrdem, setPickOrdem] = useState('1')
  const [pickUsaFisio, setPickUsaFisio] = useState(true)
  const [pickUsaAux, setPickUsaAux] = useState(false)
  const [pickUsaOutro, setPickUsaOutro] = useState(false)
  const [pickPreco, setPickPreco] = useState('')
  const [pickDescInst, setPickDescInst] = useState('')
  const [pickValorUt, setPickValorUt] = useState('')
  const [servicoSearch, setServicoSearch] = useState('')
  const [patologiaSearch, setPatologiaSearch] = useState('')

  // --- Tab Sessões ---
  const [sessoes, setSessoes] = useState<SessaoRow[]>([])
  const [selSessoes, setSelSessoes] = useState<string[]>([])
  const [sessaoModalOpen, setSessaoModalOpen] = useState(false)
  const [mData, setMData] = useState('')
  const [mUsaFisio, setMUsaFisio] = useState(true)
  const [mFisioId, setMFisioId] = useState('')
  const [mFisioLabel, setMFisioLabel] = useState('')
  const [mHoraFisio, setMHoraFisio] = useState('')
  const [mDurFisio, setMDurFisio] = useState('')
  const [mUsaAux, setMUsaAux] = useState(false)
  const [mAuxId, setMAuxId] = useState('')
  const [mAuxLabel, setMAuxLabel] = useState('')
  const [mHoraAux, setMHoraAux] = useState('')
  const [mDurAux, setMDurAux] = useState('')
  const [mUsaOutro, setMUsaOutro] = useState(false)
  const [mOutroId, setMOutroId] = useState('')
  const [mOutroLabel, setMOutroLabel] = useState('')
  const [mHoraOutro, setMHoraOutro] = useState('')
  const [mDurOutro, setMDurOutro] = useState('')

  const [saving, setSaving] = useState(false)

  const [utenteSearch, setUtenteSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [fisioSearch, setFisioSearch] = useState('')
  const [auxSearch, setAuxSearch] = useState('')
  const [outroSearch, setOutroSearch] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [localOrigSearch, setLocalOrigSearch] = useState('')
  const [mFisioSearch, setMFisioSearch] = useState('')
  const [mAuxSearch, setMAuxSearch] = useState('')
  const [mOutroSearch, setMOutroSearch] = useState('')

  const [dUtente] = useDebounce(utenteSearch, 300)
  const [dOrg] = useDebounce(orgSearch, 300)
  const [dMed] = useDebounce(medSearch, 300)
  const [dFisio] = useDebounce(fisioSearch, 300)
  const [dAux] = useDebounce(auxSearch, 300)
  const [dOutro] = useDebounce(outroSearch, 300)
  const [dLocal] = useDebounce(localSearch, 300)
  const [dLocalOrig] = useDebounce(localOrigSearch, 300)
  const [dServico] = useDebounce(servicoSearch, 300)
  const [dPatologia] = useDebounce(patologiaSearch, 300)
  const [dMFisio] = useDebounce(mFisioSearch, 300)
  const [dMAux] = useDebounce(mAuxSearch, 300)
  const [dMOutro] = useDebounce(mOutroSearch, 300)

  const leQuery = useQuery({
    queryKey: ['marcacao-manual-le', listaEsperaId],
    enabled: !!listaEsperaId && canView,
    queryFn: () =>
      ListaEsperaTratamentoAdministrativoService(listPermId).getById(listaEsperaId),
  })

  useEffect(() => {
    const dto =
      leQuery.data?.info?.status === ResponseStatus.Success
        ? leQuery.data.info.data
        : null
    if (!dto) return
    setUtenteId(dto.utenteId)
    setUtenteLabel(dto.utenteNome ?? dto.utenteId)
    setOrganismoId(dto.organismoId ?? '')
    setOrganismoLabel(dto.organismoNome ?? '')
    setMedicoId(dto.medicoId ?? '')
    setMedicoLabel(dto.medicoNome ?? '')
    setLocalId(dto.localTratamentoId ?? '')
    setLocalLabel(dto.localTratamentoDesignacao ?? '')
    setDesignacao(dto.designacao ?? '')
    setNomePatologia(dto.patologiaDesignacao ?? '')
    setDuracaoTotal(dto.duracaoTotal ?? '')
    setCredencial(dto.credencial ?? '')
    setTecObs(dto.tecObs ?? '')
    setNFaltMax(dto.nFaltMax != null ? String(dto.nFaltMax) : '4')
    setNFaltComax(dto.nFaltComax != null ? String(dto.nFaltComax) : '2')
    setTaxaModAtiva(dto.taxaModeradora === 1)
    setCredencialExterna(!!dto.credencialExterna)
    setServicos(
      (dto.servicos ?? [])
        .filter((s) => !!s.servicoId)
        .map((s, i) => ({
          key: s.id || `le-${i}`,
          servicoId: s.servicoId!,
          label: s.designacao || s.servicoId!,
          duracao: s.duracao ?? null,
          ordem: s.ordem ?? i + 1,
          usaFisioter: 1,
          usaAuxiliar: 0,
          usaOutro: 0,
        }))
    )
  }, [leQuery.data])

  const utentesQ = useQuery({
    queryKey: ['mm-utentes', dUtente],
    queryFn: () => UtentesService(listPermId).getUtentesLight(dUtente),
    enabled: canSave,
  })
  const orgQ = useQuery({
    queryKey: ['mm-org', dOrg],
    queryFn: () => OrganismoService(listPermId).getOrganismoLight(dOrg),
    enabled: canSave,
  })
  const medQ = useQuery({
    queryKey: ['mm-med', dMed],
    queryFn: () => MedicosService(listPermId).getMedicosLight(dMed),
    enabled: canSave,
  })
  const fisioQ = useQuery({
    queryKey: ['mm-fisio', dFisio],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Fisioterapeuta, dFisio, listPermId),
    enabled: canSave && usaFisio,
  })
  const auxQ = useQuery({
    queryKey: ['mm-aux', dAux],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Auxiliar, dAux, listPermId),
    enabled: canSave && usaAux,
  })
  const outroQ = useQuery({
    queryKey: ['mm-outro', dOutro],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Outro, dOutro, listPermId),
    enabled: canSave && usaOutro,
  })
  const localQ = useQuery({
    queryKey: ['mm-local', dLocal],
    queryFn: () =>
      LocalTratamentoService(listPermId).getLocaisTratamentoLight(dLocal || undefined),
    enabled: canSave,
  })
  const localOrigQ = useQuery({
    queryKey: ['mm-local-orig', dLocalOrig],
    queryFn: () =>
      LocalTratamentoService(listPermId).getLocaisTratamentoLight(
        dLocalOrig || undefined
      ),
    enabled: canSave,
  })
  const servicoQ = useQuery({
    queryKey: ['mm-servico', dServico],
    queryFn: () => ServicoService(listPermId).getServicoLight(dServico),
    enabled: canSave && servicoModalOpen,
  })
  const patologiaQ = useQuery({
    queryKey: ['mm-patologia', dPatologia],
    queryFn: () => PatologiaService(listPermId).getPatologiasLight(dPatologia),
    enabled: canSave,
  })
  const mFisioQ = useQuery({
    queryKey: ['mm-modal-fisio', dMFisio],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Fisioterapeuta, dMFisio, listPermId),
    enabled: canSave && sessaoModalOpen && mUsaFisio,
  })
  const mAuxQ = useQuery({
    queryKey: ['mm-modal-aux', dMAux],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Auxiliar, dMAux, listPermId),
    enabled: canSave && sessaoModalOpen && mUsaAux,
  })
  const mOutroQ = useQuery({
    queryKey: ['mm-modal-outro', dMOutro],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Outro, dMOutro, listPermId),
    enabled: canSave && sessaoModalOpen && mUsaOutro,
  })

  const utenteItems = useMemo(
    () =>
      withSelected(
        (utentesQ.data?.info?.data ?? []).map((u) => ({
          value: u.id,
          label: [u.numeroUtente, u.nome].filter(Boolean).join(' — ') || u.id,
        })),
        utenteId,
        utenteLabel
      ),
    [utentesQ.data, utenteId, utenteLabel]
  )
  const orgItems = useMemo(
    () =>
      withSelected(
        (orgQ.data?.info?.data ?? []).map((o) => ({
          value: o.id,
          label: o.nome ?? o.nomeComercial ?? o.id,
        })),
        organismoId,
        organismoLabel
      ),
    [orgQ.data, organismoId, organismoLabel]
  )
  const medItems = useMemo(
    () =>
      withSelected(
        (medQ.data?.info?.data ?? []).map((m) => ({
          value: m.id,
          label: m.nome ?? m.id,
        })),
        medicoId,
        medicoLabel
      ),
    [medQ.data, medicoId, medicoLabel]
  )
  const fisioItems = useMemo(
    () =>
      withSelected(
        (fisioQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        fisioId,
        fisioLabel
      ),
    [fisioQ.data, fisioId, fisioLabel]
  )
  const auxItems = useMemo(
    () =>
      withSelected(
        (auxQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        auxId,
        auxLabel
      ),
    [auxQ.data, auxId, auxLabel]
  )
  const outroItems = useMemo(
    () =>
      withSelected(
        (outroQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        outroId,
        outroLabel
      ),
    [outroQ.data, outroId, outroLabel]
  )
  const mFisioItems = useMemo(
    () =>
      withSelected(
        (mFisioQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        mFisioId,
        mFisioLabel
      ),
    [mFisioQ.data, mFisioId, mFisioLabel]
  )
  const mAuxItems = useMemo(
    () =>
      withSelected(
        (mAuxQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        mAuxId,
        mAuxLabel
      ),
    [mAuxQ.data, mAuxId, mAuxLabel]
  )
  const mOutroItems = useMemo(
    () =>
      withSelected(
        (mOutroQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        mOutroId,
        mOutroLabel
      ),
    [mOutroQ.data, mOutroId, mOutroLabel]
  )
  const localItems = useMemo(
    () =>
      withSelected(
        (localQ.data?.info?.data ?? []).map((l) => ({
          value: l.id,
          label: l.designacao ?? l.id,
        })),
        localId,
        localLabel
      ),
    [localQ.data, localId, localLabel]
  )
  const localOrigItems = useMemo(
    () =>
      withSelected(
        (localOrigQ.data?.info?.data ?? []).map((l) => ({
          value: l.id,
          label: l.designacao ?? l.id,
        })),
        localOrigemId,
        localOrigemLabel
      ),
    [localOrigQ.data, localOrigemId, localOrigemLabel]
  )
  const servicoItems = useMemo(() => {
    const list = (servicoQ.data?.info?.data ?? []).map((s) => ({
      value: s.id,
      label: s.designacao,
    }))
    return withSelected(list, pickServicoId, pickServicoLabel)
  }, [servicoQ.data, pickServicoId, pickServicoLabel])
  const patologiaItems = useMemo(() => {
    const list = (patologiaQ.data?.info?.data ?? []).map((p) => ({
      value: p.designacao,
      label: p.designacao,
    }))
    return withSelected(list, nomePatologia, nomePatologia)
  }, [patologiaQ.data, nomePatologia])

  const openServicoModal = (editKey?: string) => {
    const existing = editKey ? servicos.find((s) => s.key === editKey) : null
    if (existing) {
      setServicoEditKey(existing.key)
      setPickServicoId(existing.servicoId)
      setPickServicoLabel(existing.label)
      setPickDuracao(existing.duracao ?? duracaoTotal ?? '')
      setPickOrdem(String(existing.ordem ?? servicos.length))
      setPickUsaFisio(existing.usaFisioter === 1)
      setPickUsaAux(existing.usaAuxiliar === 1)
      setPickUsaOutro(existing.usaOutro === 1)
      setPickPreco(existing.preco != null ? String(existing.preco) : '')
      setPickDescInst(existing.descInst != null ? String(existing.descInst) : '')
      setPickValorUt(existing.valorUt != null ? String(existing.valorUt) : '')
    } else {
      setServicoEditKey(null)
      setPickServicoId('')
      setPickServicoLabel('')
      setPickDuracao(duracaoTotal || '01:00')
      setPickOrdem(String(servicos.length + 1))
      setPickUsaFisio(usaFisio)
      setPickUsaAux(usaAux)
      setPickUsaOutro(usaOutro)
      setPickPreco('')
      setPickDescInst('')
      setPickValorUt('')
    }
    setServicoSearch('')
    setServicoModalOpen(true)
  }

  const confirmServicoModal = () => {
    if (!pickServicoId) {
      toast.error('Seleccione o serviço.')
      return
    }
    if (
      servicos.some(
        (s) => s.servicoId === pickServicoId && s.key !== servicoEditKey
      )
    ) {
      toast.error('Serviço já adicionado.')
      return
    }
    const row: ServicoRow = {
      key: servicoEditKey ?? crypto.randomUUID(),
      servicoId: pickServicoId,
      label: pickServicoLabel || pickServicoId,
      ordem: pickOrdem.trim() ? Number(pickOrdem) : servicos.length + 1,
      duracao: pickDuracao.trim() || null,
      usaFisioter: pickUsaFisio ? 1 : 0,
      usaAuxiliar: pickUsaAux ? 1 : 0,
      usaOutro: pickUsaOutro ? 1 : 0,
      preco: parseOptDecimal(pickPreco),
      descInst: parseOptDecimal(pickDescInst),
      valorUt: parseOptDecimal(pickValorUt),
    }
    setServicos((prev) => {
      const next = servicoEditKey
        ? prev.map((s) => (s.key === servicoEditKey ? row : s))
        : [...prev, row]
      return next
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map((s, i) => ({ ...s, ordem: s.ordem ?? i + 1 }))
    })
    setServicoModalOpen(false)
  }

  const removeSelectedServicos = () => {
    if (selServicos.length === 0) return
    setServicos((prev) =>
      prev
        .filter((s) => !selServicos.includes(s.key))
        .map((s, i) => ({ ...s, ordem: i + 1 }))
    )
    setSelServicos([])
  }

  const openSessaoModal = () => {
    let base = dataInic
    if (!base && sessoes.length > 0) {
      const d = new Date(sessoes[sessoes.length - 1].data + 'T12:00:00')
      d.setDate(d.getDate() + 1)
      base = d.toISOString().slice(0, 10)
    }
    const dur = duracaoTotal || '01:00'
    setMData(base)
    setMUsaFisio(usaFisio)
    setMFisioId(fisioId)
    setMFisioLabel(fisioLabel)
    setMHoraFisio('')
    setMDurFisio(dur)
    setMUsaAux(usaAux)
    setMAuxId(auxId)
    setMAuxLabel(auxLabel)
    setMHoraAux('')
    setMDurAux(dur)
    setMUsaOutro(usaOutro)
    setMOutroId(outroId)
    setMOutroLabel(outroLabel)
    setMHoraOutro('')
    setMDurOutro(dur)
    setMFisioSearch('')
    setMAuxSearch('')
    setMOutroSearch('')
    setSessaoModalOpen(true)
  }

  const confirmSessaoModal = () => {
    if (!mData) {
      toast.error('A data é obrigatória.')
      return
    }
    if (sessoes.some((s) => s.data === mData)) {
      toast.error('Já existe sessão nesta data.')
      return
    }
    if (!mUsaFisio && !mUsaAux && !mUsaOutro) {
      toast.error('Seleccione pelo menos um técnico.')
      return
    }
    if (mUsaFisio && (!mFisioId || !mHoraFisio.trim() || !mDurFisio.trim())) {
      toast.error('Preencha fisioterapeuta, início e duração.')
      return
    }
    if (mUsaAux && (!mAuxId || !mHoraAux.trim() || !mDurAux.trim())) {
      toast.error('Preencha auxiliar, início e duração.')
      return
    }
    if (mUsaOutro && (!mOutroId || !mHoraOutro.trim() || !mDurOutro.trim())) {
      toast.error('Preencha terapeuta, início e duração.')
      return
    }

    const horas = [
      mUsaFisio ? mHoraFisio.trim() : null,
      mUsaAux ? mHoraAux.trim() : null,
      mUsaOutro ? mHoraOutro.trim() : null,
    ].filter(Boolean) as string[]
    const horaInic = horas.sort()[0] ?? null

    setSessoes((prev) =>
      [
        ...prev,
        {
          key: crypto.randomUUID(),
          numSessao: prev.length + 1,
          data: mData,
          horaInic,
          duracao: mDurFisio || mDurAux || mDurOutro || duracaoTotal || null,
          fisioterapeutaId: mUsaFisio ? mFisioId : null,
          auxiliarId: mUsaAux ? mAuxId : null,
          outroTecnicoId: mUsaOutro ? mOutroId : null,
          fisioLabel: mUsaFisio ? mFisioLabel : '',
          auxLabel: mUsaAux ? mAuxLabel : '',
          outroLabel: mUsaOutro ? mOutroLabel : '',
        },
      ].map((s, i) => ({ ...s, numSessao: i + 1 }))
    )
    setSessaoModalOpen(false)
  }

  const removeSelectedSessoes = () => {
    if (selSessoes.length === 0) return
    setSessoes((prev) =>
      prev
        .filter((s) => !selSessoes.includes(s.key))
        .map((s, i) => ({ ...s, numSessao: i + 1 }))
    )
    setSelSessoes([])
  }

  const handleSave = async () => {
    if (!canSave) return
    if (!utenteId) {
      toast.error('Seleccione o utente.')
      return
    }
    if (!organismoId) {
      toast.error('Certifique-se que o organismo está preenchido')
      return
    }
    if (servicos.length === 0) {
      toast.error('Não existem serviços selecionados')
      setTab('servicos')
      return
    }
    if (sessoes.length === 0) {
      toast.error('Não foram inseridas sessões selecionados')
      setTab('sessoes')
      return
    }

    const datas = [...sessoes].map((s) => s.data).sort()
    const first = sessoes[0]

    setSaving(true)
    try {
      const res = await TratamentoService(listPermId).createMarcacaoManual({
        listaEsperaTratamentoId: listaEsperaId || null,
        utenteId,
        organismoId,
        medicoId: medicoId || null,
        fisioterapeutaId: usaFisio ? fisioId || null : null,
        auxiliarId: usaAux ? auxId || null : null,
        outroTecnicoId: usaOutro ? outroId || null : null,
        localTratamentoId: localId || null,
        localOrigemId: localOrigemId || null,
        designacao: designacao.trim() || null,
        nomePatologia: nomePatologia.trim() || null,
        numSessao: sessoes.length,
        dataInic: dataInic || datas[0] || null,
        dataFim: datas[datas.length - 1] ?? null,
        duracaoTotal: duracaoTotal.trim() || null,
        credencial: credencial.trim() || null,
        numBenif: numBenif.trim() || null,
        apolice: apolice.trim() || null,
        nFaltMax: nFaltMax.trim() ? Number(nFaltMax) : null,
        nFaltComax: nFaltComax.trim() ? Number(nFaltComax) : null,
        taxaMod: taxaModAtiva ? 1 : 0,
        isencao: taxaModAtiva && isencao ? Number(isencao) : null,
        provisorio: provisorio ? 1 : 0,
        confDfim: alta ? 1 : 0,
        terapiaFala: terapiaFala ? 1 : 0,
        credencialExterna: credencialExterna ? 1 : 0,
        numCartao: numCartao.trim() || null,
        horaFisio: first?.horaInic ?? null,
        obs: null,
        tecObs: tecObs.trim() || null,
        sinistroId:
          sinistroId.trim() && isGuid(sinistroId) ? sinistroId.trim() : null,
        servicos: servicos.map(({ key: _k, label: _l, ...rest }) => rest),
        sessoes: sessoes.map(
          ({ key: _k, fisioLabel: _f, auxLabel: _a, outroLabel: _o, ...rest }) => rest
        ),
      })
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        toast.success('Marcação registada.')
        navigate(`/area-administrativa/tratamentos/marcados/${res.info.data}`)
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível guardar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao guardar.')
    } finally {
      setSaving(false)
    }
  }

  if (!canView) {
    return (
      <DashboardPageContainer>
        <p className='text-sm text-muted-foreground'>Sem permissão.</p>
      </DashboardPageContainer>
    )
  }

  return (
    <>
      <PageHead title='Marcações Manuais | CliCloud' />
      <DashboardPageContainer>
        <AreaComumDashboardCard>
          <EntityFormPageHeader
            title={
              listaEsperaId
                ? 'Marcações Manuais (Lista de Espera)'
                : 'Marcações Manuais'
            }
            onBack={() => {
              closeLikeTabBar()
              navigate('/area-administrativa/tratamentos')
            }}
            onRefresh={() => {
              if (listaEsperaId) void leQuery.refetch()
            }}
            rightActions={
              canSave ? (
                <Button
                  type='button'
                  size='sm'
                  className='gap-2'
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  <Save className='h-4 w-4' />
                  {saving ? 'A guardar…' : 'Registar Marcação'}
                </Button>
              ) : null
            }
          />

          <Tabs value={tab} onValueChange={setTab} className='mt-4'>
            <TabsList className='flex h-auto flex-wrap gap-1'>
              <TabsTrigger value='tratamento'>Tratamento</TabsTrigger>
              <TabsTrigger value='servicos'>Serviços Prescritos</TabsTrigger>
              <TabsTrigger value='sessoes'>Sessões a Realizar</TabsTrigger>
            </TabsList>

            {/* —— TAB 1 —— */}
            <TabsContent value='tratamento' className='mt-4 space-y-6'>
              <div>
                <h3 className='mb-3 text-sm font-medium'>Utente</h3>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-1.5 sm:col-span-2'>
                    <Label>Utente *</Label>
                    <AsyncCombobox
                      value={utenteId}
                      disabled={!canSave}
                      onChange={(v) => {
                        const hit = utenteItems.find((i) => i.value === v)
                        setUtenteId(v)
                        setUtenteLabel(hit?.label ?? '')
                      }}
                      items={utenteItems}
                      searchValue={utenteSearch}
                      onSearchValueChange={setUtenteSearch}
                      isLoading={utentesQ.isFetching}
                      placeholder='Seleccionar utente…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Organismo *</Label>
                    <AsyncCombobox
                      value={organismoId}
                      disabled={!canSave}
                      onChange={(v) => {
                        const hit = orgItems.find((i) => i.value === v)
                        setOrganismoId(v)
                        setOrganismoLabel(hit?.label ?? '')
                      }}
                      items={orgItems}
                      searchValue={orgSearch}
                      onSearchValueChange={setOrgSearch}
                      isLoading={orgQ.isFetching}
                      placeholder='Seleccionar organismo…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Nº Beneficiário</Label>
                    <Input
                      value={numBenif}
                      disabled={!canSave}
                      onChange={(e) => setNumBenif(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Nº Apólice</Label>
                    <Input
                      value={apolice}
                      disabled={!canSave}
                      onChange={(e) => setApolice(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={taxaModAtiva}
                        disabled={!canSave}
                        onCheckedChange={(v) => {
                          const on = v === true
                          setTaxaModAtiva(on)
                          setIsencao(on ? isencao || '2' : '')
                        }}
                      />
                      Taxa Moderadora
                    </label>
                    <RadioGroup
                      value={isencao}
                      disabled={!canSave || !taxaModAtiva}
                      onValueChange={setIsencao}
                      className='flex gap-4'
                    >
                      <label className='flex items-center gap-2 text-sm'>
                        <RadioGroupItem value='1' />
                        Isento
                      </label>
                      <label className='flex items-center gap-2 text-sm'>
                        <RadioGroupItem value='2' />
                        Não Isento
                      </label>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='mb-3 text-sm font-medium'>Tratamentos</h3>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-1.5'>
                    <Label>Local Origem</Label>
                    <AsyncCombobox
                      value={localOrigemId}
                      disabled={!canSave}
                      onChange={(v) => {
                        const hit = localOrigItems.find((i) => i.value === v)
                        setLocalOrigemId(v)
                        setLocalOrigemLabel(hit?.label ?? '')
                      }}
                      items={localOrigItems}
                      searchValue={localOrigSearch}
                      onSearchValueChange={setLocalOrigSearch}
                      isLoading={localOrigQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Local Tratamento</Label>
                    <AsyncCombobox
                      value={localId}
                      disabled={!canSave}
                      onChange={(v) => {
                        const hit = localItems.find((i) => i.value === v)
                        setLocalId(v)
                        setLocalLabel(hit?.label ?? '')
                      }}
                      items={localItems}
                      searchValue={localSearch}
                      onSearchValueChange={setLocalSearch}
                      isLoading={localQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Designação</Label>
                    <Input
                      value={designacao}
                      disabled={!canSave}
                      onChange={(e) => setDesignacao(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Nº Sinistrado</Label>
                    <Input
                      value={sinistroId}
                      disabled={!canSave}
                      placeholder='Opcional (Guid)'
                      onChange={(e) => setSinistroId(e.target.value)}
                    />
                  </div>

                  <div className='space-y-1.5 sm:col-span-2 lg:col-span-3'>
                    <label className='mb-1 flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={usaFisio}
                        disabled={!canSave}
                        onCheckedChange={(v) => setUsaFisio(v === true)}
                      />
                      Fisioterapeuta
                    </label>
                    <AsyncCombobox
                      value={fisioId}
                      disabled={!canSave || !usaFisio}
                      onChange={(v) => {
                        const hit = fisioItems.find((i) => i.value === v)
                        setFisioId(v)
                        setFisioLabel(hit?.label ?? '')
                      }}
                      items={fisioItems}
                      searchValue={fisioSearch}
                      onSearchValueChange={setFisioSearch}
                      isLoading={fisioQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </div>
                  <div className='space-y-1.5 sm:col-span-2 lg:col-span-3'>
                    <label className='mb-1 flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={usaAux}
                        disabled={!canSave}
                        onCheckedChange={(v) => setUsaAux(v === true)}
                      />
                      Auxiliar
                    </label>
                    <AsyncCombobox
                      value={auxId}
                      disabled={!canSave || !usaAux}
                      onChange={(v) => {
                        const hit = auxItems.find((i) => i.value === v)
                        setAuxId(v)
                        setAuxLabel(hit?.label ?? '')
                      }}
                      items={auxItems}
                      searchValue={auxSearch}
                      onSearchValueChange={setAuxSearch}
                      isLoading={auxQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </div>
                  <div className='space-y-1.5 sm:col-span-2 lg:col-span-3'>
                    <label className='mb-1 flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={usaOutro}
                        disabled={!canSave}
                        onCheckedChange={(v) => setUsaOutro(v === true)}
                      />
                      Terapeuta Ocup./Fala
                    </label>
                    <AsyncCombobox
                      value={outroId}
                      disabled={!canSave || !usaOutro}
                      onChange={(v) => {
                        const hit = outroItems.find((i) => i.value === v)
                        setOutroId(v)
                        setOutroLabel(hit?.label ?? '')
                      }}
                      items={outroItems}
                      searchValue={outroSearch}
                      onSearchValueChange={setOutroSearch}
                      isLoading={outroQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </div>

                  <div className='flex flex-wrap gap-4 sm:col-span-2 lg:col-span-3'>
                    <label className='flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={provisorio}
                        disabled={!canSave}
                        onCheckedChange={(v) => setProvisorio(v === true)}
                      />
                      Provisório
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={alta}
                        disabled={!canSave}
                        onCheckedChange={(v) => setAlta(v === true)}
                      />
                      Alta
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={terapiaFala}
                        disabled={!canSave}
                        onCheckedChange={(v) => setTerapiaFala(v === true)}
                      />
                      Terapia Fala
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={credencialExterna}
                        disabled={!canSave}
                        onCheckedChange={(v) => setCredencialExterna(v === true)}
                      />
                      Credencial Externa
                    </label>
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Nº Credencial</Label>
                    <Input
                      value={credencial}
                      disabled={!canSave}
                      onChange={(e) => setCredencial(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Nº Cartão</Label>
                    <Input
                      value={numCartao}
                      disabled={!canSave}
                      onChange={(e) => setNumCartao(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='space-y-1.5'>
                  <Label>Data Início</Label>
                  <Input
                    type='date'
                    value={dataInic}
                    disabled={!canSave}
                    onChange={(e) => setDataInic(e.target.value)}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Dia da Semana</Label>
                  <Input value={diaSemana(dataInic)} disabled />
                </div>
                <div className='space-y-1.5'>
                  <Label>Nº Máximo faltas</Label>
                  <Input
                    value={nFaltMax}
                    disabled={!canSave}
                    onChange={(e) => setNFaltMax(e.target.value)}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Nº Máximo consecutivo</Label>
                  <Input
                    value={nFaltComax}
                    disabled={!canSave}
                    onChange={(e) => setNFaltComax(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* —— TAB 2 —— */}
            <TabsContent value='servicos' className='mt-4 space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <div className='space-y-1.5'>
                  <Label>Médico</Label>
                  <AsyncCombobox
                    value={medicoId}
                    disabled={!canSave}
                    onChange={(v) => {
                      const hit = medItems.find((i) => i.value === v)
                      setMedicoId(v)
                      setMedicoLabel(hit?.label ?? '')
                    }}
                    items={medItems}
                    searchValue={medSearch}
                    onSearchValueChange={setMedSearch}
                    isLoading={medQ.isFetching}
                    placeholder='Seleccionar…'
                    searchPlaceholder='Pesquisar…'
                    emptyText='Sem resultados'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Patologias</Label>
                  <AsyncCombobox
                    value={nomePatologia}
                    disabled={!canSave}
                    onChange={(v) => {
                      const hit = patologiaItems.find((i) => i.value === v)
                      setNomePatologia(hit?.label ?? v)
                    }}
                    items={patologiaItems}
                    searchValue={patologiaSearch}
                    onSearchValueChange={setPatologiaSearch}
                    isLoading={patologiaQ.isFetching}
                    placeholder='Seleccionar…'
                    searchPlaceholder='Pesquisar…'
                    emptyText='Sem resultados'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Tempo Tratamento</Label>
                  <Input
                    value={duracaoTotal}
                    disabled={!canSave}
                    placeholder='HH:mm'
                    onChange={(e) => setDuracaoTotal(e.target.value)}
                  />
                </div>
                <div className='flex items-end sm:col-span-2 lg:col-span-3'>
                  <Button
                    type='button'
                    size='sm'
                    variant='secondary'
                    disabled={!canSave}
                    onClick={() => setEspTecModalOpen(true)}
                  >
                    Especificação técnica
                  </Button>
                </div>
              </div>

              {canSave ? (
                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    size='sm'
                    className='gap-1'
                    onClick={() => openServicoModal()}
                  >
                    <Plus className='h-4 w-4' />
                    Inserir
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    disabled={selServicos.length === 0}
                    onClick={removeSelectedServicos}
                  >
                    Remover
                  </Button>
                </div>
              ) : null}

              <div className='overflow-x-auto rounded border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50 text-left'>
                    <tr>
                      <th className='w-8 p-2' />
                      <th className='p-2'>Ordem</th>
                      <th className='p-2'>Designação</th>
                      <th className='p-2'>Duração</th>
                      <th className='p-2'>Fisioter.</th>
                      <th className='p-2'>Auxiliar</th>
                      <th className='p-2'>Ter. Ocup.</th>
                      <th className='p-2'>Val. Serviço</th>
                      <th className='p-2'>Org (%)</th>
                      <th className='p-2'>Val. Utente</th>
                      <th className='p-2' />
                    </tr>
                  </thead>
                  <tbody>
                    {servicos.length === 0 ? (
                      <tr>
                        <td colSpan={11} className='p-3 text-muted-foreground'>
                          Não existem dados a apresentar
                        </td>
                      </tr>
                    ) : (
                      servicos.map((s) => (
                        <tr key={s.key} className='border-t'>
                          <td className='p-2'>
                            {canSave ? (
                              <Checkbox
                                checked={selServicos.includes(s.key)}
                                onCheckedChange={(v) =>
                                  setSelServicos((prev) =>
                                    v === true
                                      ? [...prev, s.key]
                                      : prev.filter((k) => k !== s.key)
                                  )
                                }
                              />
                            ) : null}
                          </td>
                          <td className='p-2'>{s.ordem}</td>
                          <td className='p-2'>{s.label}</td>
                          <td className='p-2'>{s.duracao || '—'}</td>
                          <td className='p-2'>
                            {s.usaFisioter === 1 ? 'Sim' : 'Não'}
                          </td>
                          <td className='p-2'>
                            {s.usaAuxiliar === 1 ? 'Sim' : 'Não'}
                          </td>
                          <td className='p-2'>
                            {s.usaOutro === 1 ? 'Sim' : 'Não'}
                          </td>
                          <td className='p-2'>
                            {s.preco != null ? s.preco : '—'}
                          </td>
                          <td className='p-2'>
                            {s.descInst != null ? s.descInst : '—'}
                          </td>
                          <td className='p-2'>
                            {s.valorUt != null ? s.valorUt : '—'}
                          </td>
                          <td className='p-2'>
                            {canSave ? (
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => openServicoModal(s.key)}
                              >
                                Editar
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* —— TAB 3 —— */}
            <TabsContent value='sessoes' className='mt-4 space-y-4'>
              {canSave ? (
                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    size='sm'
                    className='gap-1'
                    onClick={openSessaoModal}
                  >
                    <Plus className='h-4 w-4' />
                    Inserir
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    disabled={selSessoes.length === 0}
                    onClick={removeSelectedSessoes}
                  >
                    Remover
                  </Button>
                </div>
              ) : null}

              <div className='overflow-x-auto rounded border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50 text-left'>
                    <tr>
                      <th className='w-8 p-2' />
                      <th className='p-2'>Nº Sessão</th>
                      <th className='p-2'>Data</th>
                      <th className='p-2'>Dia Semana</th>
                      <th className='p-2'>Hora Início</th>
                      <th className='p-2'>Fisioter.</th>
                      <th className='p-2'>Auxiliar</th>
                      <th className='p-2'>Ter. Ocup./Fala</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessoes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className='p-3 text-muted-foreground'>
                          Não existem dados a apresentar
                        </td>
                      </tr>
                    ) : (
                      sessoes.map((s) => (
                        <tr key={s.key} className='border-t'>
                          <td className='p-2'>
                            {canSave ? (
                              <Checkbox
                                checked={selSessoes.includes(s.key)}
                                onCheckedChange={(v) =>
                                  setSelSessoes((prev) =>
                                    v === true
                                      ? [...prev, s.key]
                                      : prev.filter((k) => k !== s.key)
                                  )
                                }
                              />
                            ) : null}
                          </td>
                          <td className='p-2'>{s.numSessao}</td>
                          <td className='p-2'>{s.data}</td>
                          <td className='p-2 capitalize'>{diaSemana(s.data)}</td>
                          <td className='p-2'>{s.horaInic || '—'}</td>
                          <td className='p-2'>{s.fisioLabel || '—'}</td>
                          <td className='p-2'>{s.auxLabel || '—'}</td>
                          <td className='p-2'>{s.outroLabel || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={servicoModalOpen} onOpenChange={setServicoModalOpen}>
            <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>
                  {servicoEditKey ? 'Editar Serviço' : 'Inserir Serviço'}
                </DialogTitle>
              </DialogHeader>
              <div className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label>Serviço *</Label>
                  <AsyncCombobox
                    value={pickServicoId}
                    onChange={(v) => {
                      const hit = servicoItems.find((i) => i.value === v)
                      setPickServicoId(v)
                      setPickServicoLabel(hit?.label ?? '')
                    }}
                    items={servicoItems}
                    searchValue={servicoSearch}
                    onSearchValueChange={setServicoSearch}
                    isLoading={servicoQ.isFetching}
                    placeholder='Seleccionar serviço…'
                    searchPlaceholder='Pesquisar…'
                    emptyText='Sem resultados'
                  />
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='space-y-1.5'>
                    <Label>Duração</Label>
                    <Input
                      value={pickDuracao}
                      placeholder='HH:mm'
                      onChange={(e) => setPickDuracao(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Ordem</Label>
                    <Input
                      value={pickOrdem}
                      onChange={(e) => setPickOrdem(e.target.value)}
                    />
                  </div>
                </div>
                <div className='flex flex-wrap gap-4'>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={pickUsaFisio}
                      disabled={!usaFisio}
                      onCheckedChange={(v) => setPickUsaFisio(v === true)}
                    />
                    Fisioterapeuta
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={pickUsaAux}
                      disabled={!usaAux}
                      onCheckedChange={(v) => setPickUsaAux(v === true)}
                    />
                    Auxiliar
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={pickUsaOutro}
                      disabled={!usaOutro}
                      onCheckedChange={(v) => setPickUsaOutro(v === true)}
                    />
                    Ter. Ocup./Fala
                  </label>
                </div>
                <div className='grid gap-3 sm:grid-cols-3'>
                  <div className='space-y-1.5'>
                    <Label>Val. Serviço</Label>
                    <Input
                      value={pickPreco}
                      onChange={(e) => setPickPreco(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Org (%)</Label>
                    <Input
                      value={pickDescInst}
                      onChange={(e) => setPickDescInst(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Val. Utente</Label>
                    <Input
                      value={pickValorUt}
                      onChange={(e) => setPickValorUt(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className='gap-2 sm:gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setServicoModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type='button' onClick={confirmServicoModal}>
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={espTecModalOpen} onOpenChange={setEspTecModalOpen}>
            <DialogContent className='max-w-lg'>
              <DialogHeader>
                <DialogTitle>Especificação técnica</DialogTitle>
              </DialogHeader>
              <div className='space-y-1.5'>
                <Label>Observações</Label>
                <Textarea
                  value={tecObs}
                  disabled={!canSave}
                  rows={8}
                  onChange={(e) => setTecObs(e.target.value)}
                />
              </div>
              <DialogFooter className='gap-2 sm:gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEspTecModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type='button' onClick={() => setEspTecModalOpen(false)}>
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={sessaoModalOpen} onOpenChange={setSessaoModalOpen}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Inserir Sessões</DialogTitle>
              </DialogHeader>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <Label>Data Início</Label>
                  <Input
                    type='date'
                    value={mData}
                    onChange={(e) => setMData(e.target.value)}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Dia da Semana</Label>
                  <Input value={diaSemana(mData)} disabled />
                </div>
              </div>

              <div className='mt-4 space-y-4'>
                <div className='space-y-2 rounded border p-3'>
                  <label className='flex items-center gap-2 text-sm font-medium'>
                    <Checkbox
                      checked={mUsaFisio}
                      onCheckedChange={(v) => setMUsaFisio(v === true)}
                    />
                    Fisioterapeuta
                  </label>
                  <div className='grid gap-3 sm:grid-cols-[1fr_7rem_7rem]'>
                    <AsyncCombobox
                      value={mFisioId}
                      disabled={!mUsaFisio}
                      onChange={(v) => {
                        const hit = mFisioItems.find((i) => i.value === v)
                        setMFisioId(v)
                        setMFisioLabel(hit?.label ?? '')
                      }}
                      items={mFisioItems}
                      searchValue={mFisioSearch}
                      onSearchValueChange={setMFisioSearch}
                      isLoading={mFisioQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                    <div className='space-y-1'>
                      <Label className='text-xs'>Início</Label>
                      <Input
                        value={mHoraFisio}
                        disabled={!mUsaFisio}
                        placeholder='HH:mm'
                        onChange={(e) => setMHoraFisio(e.target.value)}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Duração</Label>
                      <Input
                        value={mDurFisio}
                        disabled={!mUsaFisio}
                        placeholder='HH:mm'
                        onChange={(e) => setMDurFisio(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-2 rounded border p-3'>
                  <label className='flex items-center gap-2 text-sm font-medium'>
                    <Checkbox
                      checked={mUsaAux}
                      onCheckedChange={(v) => setMUsaAux(v === true)}
                    />
                    Auxiliar
                  </label>
                  <div className='grid gap-3 sm:grid-cols-[1fr_7rem_7rem]'>
                    <AsyncCombobox
                      value={mAuxId}
                      disabled={!mUsaAux}
                      onChange={(v) => {
                        const hit = mAuxItems.find((i) => i.value === v)
                        setMAuxId(v)
                        setMAuxLabel(hit?.label ?? '')
                      }}
                      items={mAuxItems}
                      searchValue={mAuxSearch}
                      onSearchValueChange={setMAuxSearch}
                      isLoading={mAuxQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                    <div className='space-y-1'>
                      <Label className='text-xs'>Início</Label>
                      <Input
                        value={mHoraAux}
                        disabled={!mUsaAux}
                        placeholder='HH:mm'
                        onChange={(e) => setMHoraAux(e.target.value)}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Duração</Label>
                      <Input
                        value={mDurAux}
                        disabled={!mUsaAux}
                        placeholder='HH:mm'
                        onChange={(e) => setMDurAux(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-2 rounded border p-3'>
                  <label className='flex items-center gap-2 text-sm font-medium'>
                    <Checkbox
                      checked={mUsaOutro}
                      onCheckedChange={(v) => setMUsaOutro(v === true)}
                    />
                    Terapeuta Ocup./Fala
                  </label>
                  <div className='grid gap-3 sm:grid-cols-[1fr_7rem_7rem]'>
                    <AsyncCombobox
                      value={mOutroId}
                      disabled={!mUsaOutro}
                      onChange={(v) => {
                        const hit = mOutroItems.find((i) => i.value === v)
                        setMOutroId(v)
                        setMOutroLabel(hit?.label ?? '')
                      }}
                      items={mOutroItems}
                      searchValue={mOutroSearch}
                      onSearchValueChange={setMOutroSearch}
                      isLoading={mOutroQ.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                    <div className='space-y-1'>
                      <Label className='text-xs'>Início</Label>
                      <Input
                        value={mHoraOutro}
                        disabled={!mUsaOutro}
                        placeholder='HH:mm'
                        onChange={(e) => setMHoraOutro(e.target.value)}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Duração</Label>
                      <Input
                        value={mDurOutro}
                        disabled={!mUsaOutro}
                        placeholder='HH:mm'
                        onChange={(e) => setMDurOutro(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className='gap-2 sm:gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setSessaoModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type='button' onClick={confirmSessaoModal}>
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}