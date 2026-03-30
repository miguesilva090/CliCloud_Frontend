import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import {
  Brush,
  CloudUpload,
  Plus,
} from 'lucide-react'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import type { CartaConducaoLightDTO, CartaConducaoRestricoesLightDTO } from '@/types/dtos/saude/cartas-conducao.dtos'
import type { CreateAtestadoRequest } from '@/types/dtos/saude/atestados.dtos'
import {
  useCartasConducaoLight,
  useCartaConducaoRestricoesLight,
} from '@/lib/services/saude/cartas-conducao-service'
import {
  useCodigosPostaisLight,
  useConcelhosLight,
  useDistritosLight,
  useFreguesiasLight,
  usePaisesLight,
} from '@/lib/services/utility/lookups/lookups-queries'
import { PaisViewCreateModal } from '@/pages/area-comum/tabelas/tabelas/geograficas/modals/pais-view-create-modal'
import { DistritoViewCreateModal } from '@/pages/area-comum/tabelas/tabelas/geograficas/modals/distrito-view-create-modal'
import { ConcelhoViewCreateModal } from '@/pages/area-comum/tabelas/tabelas/geograficas/modals/concelho-view-create-modal'
import { FreguesiaViewCreateModal } from '@/pages/area-comum/tabelas/tabelas/geograficas/modals/freguesia-view-create-modal'
import { useGetUtente, useUtentesLight } from '@/pages/utentes/queries/utentes-queries'
import { useMedicosLight } from '@/lib/services/saude/medicos-service/medicos-queries'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateAtestado } from '../queries/atestados-queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const SEXO_OPTIONS = [
  { value: 'indefinido', label: 'Indefinido' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
]

const TIPO_DOC_OPTIONS = [
  { value: 'bi', label: 'BI' },
  { value: 'cc', label: 'Cartão de Cidadão' },
  { value: 'outro', label: 'Outro' },
]

/** Data do atestado: sempre a data de hoje, não editável */
const dataAtestadoHoje = () => new Date()

type GeoModalType = 'pais' | 'distrito' | 'concelho' | 'freguesia' | null

export function NovoAtestadoPage() {
  const clientId = useAuthStore((s) => s.clientId)
  const queryClient = useQueryClient()
  const createAtestado = useCreateAtestado()
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const [geoModalType, setGeoModalType] = useState<GeoModalType>(null)

  const [activeTab, setActiveTab] = useState<'dados' | 'categorias'>('dados')
  const [utenteId, setUtenteId] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [utenteSearch, setUtenteSearch] = useState('')
  const [medicoSearch, setMedicoSearch] = useState('')
  const [numeroAtestado, setNumeroAtestado] = useState('')
  const [dataAtestado, setDataAtestado] = useState<Date | undefined>(dataAtestadoHoje)
  const [tipoUtente, setTipoUtente] = useState<'rnu' | 'cc'>('rnu')
  const [numeroUtente, setNumeroUtente] = useState('')
  const [sexo, setSexo] = useState('indefinido')
  const [tipoDoc, setTipoDoc] = useState('')
  const [numeroBiCc, setNumeroBiCc] = useState('')
  const [nomeUtente, setNomeUtente] = useState('')
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>()
  const [nif, setNif] = useState('')
  const [numCartaConducao, setNumCartaConducao] = useState('')
  const [numDocIdentificacao, setNumDocIdentificacao] = useState('')
  const [validadeDoc, setValidadeDoc] = useState<Date | undefined>()
  const [morada, setMorada] = useState('')
  const [pais, setPais] = useState('')
  const [concelho, setConcelho] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [distrito, setDistrito] = useState('')
  const [freguesia, setFreguesia] = useState('')
  const [paisNacionalidade, setPaisNacionalidade] = useState('')
  const [paisNaturalidade, setPaisNaturalidade] = useState('')
  const [distritoNaturalidade, setDistritoNaturalidade] = useState('')
  const [concelhoNaturalidade, setConcelhoNaturalidade] = useState('')
  const [freguesiaNaturalidade, setFreguesiaNaturalidade] = useState('')
  const [observacoes, setObservacoes] = useState('')

  /* Categorias e Restrições (aba Categorias/Restrições) */
  type CategoriaLinha = { id: string; codigoCarta: string; descricao: string; grupo?: number; apto?: boolean; aptoGrupo2?: boolean }
  type RestricaoLinha = { id: string; codigoRestricao: number; descricao: string; categorias?: string; anotacoes?: string }
  const [categoriasAtestado, setCategoriasAtestado] = useState<CategoriaLinha[]>([])
  const [restricoesAtestado, setRestricoesAtestado] = useState<RestricaoLinha[]>([])
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('')
  const [selectedRestricaoId, setSelectedRestricaoId] = useState('')

  /* Pesquisa para comboboxes geográficos (Morada) */
  const [paisQ, setPaisQ] = useState('')
  const [distritoQ, setDistritoQ] = useState('')
  const [concelhoQ, setConcelhoQ] = useState('')
  const [freguesiaQ, setFreguesiaQ] = useState('')
  const [cpQ, setCpQ] = useState('')
  /* Naturalidade */
  const [paisNacQ, setPaisNacQ] = useState('')
  const [paisNatQ, setPaisNatQ] = useState('')
  const [distritoNatQ, setDistritoNatQ] = useState('')
  const [concelhoNatQ, setConcelhoNatQ] = useState('')
  const [freguesiaNatQ, setFreguesiaNatQ] = useState('')

  const [utenteSearchD] = useDebounce(utenteSearch, 250)
  const [medicoSearchD] = useDebounce(medicoSearch, 250)
  const [paisQD] = useDebounce(paisQ, 250)
  const [distritoQD] = useDebounce(distritoQ, 250)
  const [concelhoQD] = useDebounce(concelhoQ, 250)
  const [freguesiaQD] = useDebounce(freguesiaQ, 250)
  const [cpQD] = useDebounce(cpQ, 250)
  const [paisNacQD] = useDebounce(paisNacQ, 250)
  const [paisNatQD] = useDebounce(paisNatQ, 250)
  const [distritoNatQD] = useDebounce(distritoNatQ, 250)
  const [concelhoNatQD] = useDebounce(concelhoNatQ, 250)
  const [freguesiaNatQD] = useDebounce(freguesiaNatQ, 250)

  const utentesLight = useUtentesLight(utenteSearchD)
  const utenteDetalhe = useGetUtente(utenteId)
  const medicosLight = useMedicosLight(medicoSearchD)
  const paisesMorada = usePaisesLight(paisQD)
  const paisesNac = usePaisesLight(paisNacQD)
  const paisesNat = usePaisesLight(paisNatQD)
  const distritosMorada = useDistritosLight(distritoQD)
  const distritosNat = useDistritosLight(distritoNatQD)
  const concelhosMorada = useConcelhosLight(concelhoQD)
  const concelhosNat = useConcelhosLight(concelhoNatQD)
  const freguesiasMorada = useFreguesiasLight(freguesiaQD)
  const freguesiasNat = useFreguesiasLight(freguesiaNatQD)
  const codigosPostais = useCodigosPostaisLight(cpQD)

  const categoriasCC = useCartasConducaoLight('')
  const restricoesCC = useCartaConducaoRestricoesLight('')
  const utenteItems = useMemo(() => {
    const list = utentesLight.data?.info?.data ?? []
    return list.map((u: { id: string; nome: string; numeroUtente?: string | null }) => ({
      value: u.id,
      label: u.nome,
      secondary: u.numeroUtente ? `Nº Utente: ${u.numeroUtente}` : undefined,
    }))
  }, [utentesLight.data])
  const medicoItems = useMemo(() => {
    const list = medicosLight.data?.info?.data ?? []
    return list.map((m: { id: string; nome: string; especialidadeNome?: string | null }) => ({
      value: m.id,
      label: m.nome,
      secondary: m.especialidadeNome ?? undefined,
    }))
  }, [medicosLight.data])
  const categoriasOptions = useMemo((): Array<{ value: string; label: string }> => {
    const list = categoriasCC.data?.info?.data ?? []
    return list.map((c: { id: string; codigoCarta?: string | null; descricao?: string | null }) => ({ value: c.id, label: [c.codigoCarta, c.descricao].filter(Boolean).join(' - ') || c.id }))
  }, [categoriasCC.data])
  const restricoesOptions = useMemo((): Array<{ value: string; label: string }> => {
    const list = restricoesCC.data?.info?.data ?? []
    return list.map((r: { id: string; codigoRestricao: number; descricao?: string | null }) => ({ value: r.id, label: [r.codigoRestricao, r.descricao].filter(Boolean).join(' - ') || r.id }))
  }, [restricoesCC.data])

  const paisItems = useMemo(() => {
    const list = paisesMorada.data?.info?.data ?? []
    return list.map((p) => ({ value: p.id, label: p.nome || p.codigo || p.id, secondary: p.codigo ? `Código: ${p.codigo}` : undefined }))
  }, [paisesMorada.data])
  const paisNacItems = useMemo(() => {
    const list = paisesNac.data?.info?.data ?? []
    return list.map((p) => ({ value: p.id, label: p.nome || p.codigo || p.id, secondary: p.codigo ? `Código: ${p.codigo}` : undefined }))
  }, [paisesNac.data])
  const paisNatItems = useMemo(() => {
    const list = paisesNat.data?.info?.data ?? []
    return list.map((p) => ({ value: p.id, label: p.nome || p.codigo || p.id, secondary: p.codigo ? `Código: ${p.codigo}` : undefined }))
  }, [paisesNat.data])
  const distritoItems = useMemo(() => {
    const list = distritosMorada.data?.info?.data ?? []
    const filtered = pais ? list.filter((d: { paisId?: string | null }) => d.paisId === pais) : []
    return filtered.map((d: { id: string; nome?: string | null; paisNome?: string | null }) => ({ value: d.id, label: d.nome || d.id, secondary: d.paisNome ? `País: ${d.paisNome}` : undefined }))
  }, [distritosMorada.data, pais])
  const distritoNatItems = useMemo(() => {
    const list = distritosNat.data?.info?.data ?? []
    const filtered = paisNaturalidade ? list.filter((d: { paisId?: string | null }) => d.paisId === paisNaturalidade) : []
    return filtered.map((d: { id: string; nome?: string | null; paisNome?: string | null }) => ({ value: d.id, label: d.nome || d.id, secondary: d.paisNome ? `País: ${d.paisNome}` : undefined }))
  }, [distritosNat.data, paisNaturalidade])
  const concelhoItems = useMemo(() => {
    const list = concelhosMorada.data?.info?.data ?? []
    const filtered = distrito ? list.filter((c: { distritoId?: string | null }) => c.distritoId === distrito) : []
    return filtered.map((c: { id: string; nome?: string | null; distritoNome?: string | null }) => ({ value: c.id, label: c.nome || c.id, secondary: c.distritoNome ? `Distrito: ${c.distritoNome}` : undefined }))
  }, [concelhosMorada.data, distrito])
  const concelhoNatItems = useMemo(() => {
    const list = concelhosNat.data?.info?.data ?? []
    const filtered = distritoNaturalidade ? list.filter((c: { distritoId?: string | null }) => c.distritoId === distritoNaturalidade) : []
    return filtered.map((c: { id: string; nome?: string | null; distritoNome?: string | null }) => ({ value: c.id, label: c.nome || c.id, secondary: c.distritoNome ? `Distrito: ${c.distritoNome}` : undefined }))
  }, [concelhosNat.data, distritoNaturalidade])
  const freguesiaItems = useMemo(() => {
    const list = freguesiasMorada.data?.info?.data ?? []
    const filtered = concelho ? list.filter((f: { concelhoId?: string | null }) => f.concelhoId === concelho) : []
    return filtered.map((f: { id: string; nome?: string | null; concelhoNome?: string | null }) => ({ value: f.id, label: f.nome || f.id, secondary: f.concelhoNome ? `Concelho: ${f.concelhoNome}` : undefined }))
  }, [freguesiasMorada.data, concelho])
  const freguesiaNatItems = useMemo(() => {
    const list = freguesiasNat.data?.info?.data ?? []
    const filtered = concelhoNaturalidade ? list.filter((f: { concelhoId?: string | null }) => f.concelhoId === concelhoNaturalidade) : []
    return filtered.map((f: { id: string; nome?: string | null; concelhoNome?: string | null }) => ({ value: f.id, label: f.nome || f.id, secondary: f.concelhoNome ? `Concelho: ${f.concelhoNome}` : undefined }))
  }, [freguesiasNat.data, concelhoNaturalidade])
  const cpItems = useMemo(() => {
    const list = codigosPostais.data?.info?.data ?? []
    return list.map((cp) => ({ value: cp.id, label: cp.codigo || cp.id, secondary: cp.localidade || undefined }))
  }, [codigosPostais.data])

  // Preencher dados do utente quando um utente é selecionado
  useEffect(() => {
    const u = utenteDetalhe.data?.info?.data
    if (!utenteId || !u || u.id !== utenteId) return
    setNomeUtente(u.nome ?? '')
    setNumeroUtente(u.numeroUtente ?? '')
    setNif(u.numeroContribuinte ?? '')
    setNumeroBiCc(u.numeroCartaoIdentificacao ?? '')
    setNumDocIdentificacao(u.numeroCartaoIdentificacao ?? '')
    if (u.dataNascimento) {
      const d = typeof u.dataNascimento === 'string' ? new Date(u.dataNascimento) : u.dataNascimento
      setDataNascimento(!Number.isNaN(d.getTime()) ? d : undefined)
    } else {
      setDataNascimento(undefined)
    }
    const sexoMap: Record<number, 'indefinido' | 'masculino' | 'feminino'> = {
      0: 'masculino',
      1: 'feminino',
      2: 'indefinido',
    }
    const sexoNum =
      typeof u.sexo === 'number'
        ? u.sexo
        : (u.sexo as { id?: string } | null)?.id != null
          ? Number((u.sexo as { id: string }).id)
          : null
    setSexo(sexoNum != null && sexoMap[sexoNum] ? sexoMap[sexoNum] : 'indefinido')
    if (u.dataValidadeCartaoIdentificacao) {
      const d =
        typeof u.dataValidadeCartaoIdentificacao === 'string'
          ? new Date(u.dataValidadeCartaoIdentificacao)
          : u.dataValidadeCartaoIdentificacao
      setValidadeDoc(!Number.isNaN((d as Date).getTime()) ? (d as Date) : undefined)
    } else {
      setValidadeDoc(undefined)
    }
    setCodigoPostal(u.codigoPostalId ?? '')
    setPais(u.paisId ?? '')
    setDistrito(u.distritoId ?? '')
    setConcelho(u.concelhoId ?? '')
    setFreguesia(u.freguesiaId ?? '')
    const uExt = u as {
      rua?: { nome?: string }
      codigoPostal?: { codigo?: string; localidade?: string }
      numeroPorta?: string
      andarRua?: string
    }
    const partesMorada = [uExt.numeroPorta, uExt.andarRua, uExt.rua?.nome].filter(Boolean) as string[]
    setMorada(partesMorada.join(', ') || '')
  }, [utenteId, utenteDetalhe.data])

  const handleLimpar = () => {
    setUtenteId('')
    setMedicoId('')
    setUtenteSearch('')
    setMedicoSearch('')
    setNumeroAtestado('')
    setDataAtestado(dataAtestadoHoje())
    setTipoUtente('rnu')
    setNumeroUtente('')
    setSexo('indefinido')
    setTipoDoc('')
    setNumeroBiCc('')
    setNomeUtente('')
    setDataNascimento(undefined)
    setNif('')
    setNumCartaConducao('')
    setNumDocIdentificacao('')
    setValidadeDoc(undefined)
    setMorada('')
    setPais('')
    setConcelho('')
    setCodigoPostal('')
    setDistrito('')
    setFreguesia('')
    setPaisNacionalidade('')
    setPaisNaturalidade('')
    setDistritoNaturalidade('')
    setConcelhoNaturalidade('')
    setFreguesiaNaturalidade('')
    setObservacoes('')
    setPaisQ('')
    setDistritoQ('')
    setConcelhoQ('')
    setFreguesiaQ('')
    setCpQ('')
    setPaisNacQ('')
    setPaisNatQ('')
    setDistritoNatQ('')
    setConcelhoNatQ('')
    setFreguesiaNatQ('')
    setCategoriasAtestado([])
    setRestricoesAtestado([])
    setSelectedCategoriaId('')
    setSelectedRestricaoId('')
  }

  const handleInserirCategoria = () => {
    if (!selectedCategoriaId) return
    const list = categoriasCC.data?.info?.data ?? []
    const item = list.find((c: CartaConducaoLightDTO) => c.id === selectedCategoriaId)
    if (item) {
      setCategoriasAtestado((prev) => [...prev, { id: item.id, codigoCarta: item.codigoCarta ?? '', descricao: item.descricao ?? '', grupo: item.grupo, apto: undefined, aptoGrupo2: undefined }])
      setSelectedCategoriaId('')
    }
  }

  const handleRemoverCategoria = (id: string) => {
    setCategoriasAtestado((prev) => prev.filter((c) => c.id !== id))
  }

  const handleInserirRestricao = () => {
    if (!selectedRestricaoId) return
    const list = restricoesCC.data?.info?.data ?? []
    const item = list.find((r: CartaConducaoRestricoesLightDTO) => r.id === selectedRestricaoId)
    if (item) {
      setRestricoesAtestado((prev) => [...prev, { id: item.id, codigoRestricao: item.codigoRestricao, descricao: item.descricao ?? '', categorias: undefined, anotacoes: undefined }])
      setSelectedRestricaoId('')
    }
  }

  const handleRemoverRestricao = (id: string) => {
    setRestricoesAtestado((prev) => prev.filter((r) => r.id !== id))
  }

  const handleGuardar = () => {
    if (!utenteId || !medicoId || !clientId) {
      return
    }
    const dataAtestadoStr = dataAtestado
      ? new Date(dataAtestado).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
    const primeiraCategoriaId = categoriasAtestado[0]?.id
    const payload: CreateAtestadoRequest = {
      utenteId,
      medicoId,
      clinicaId: clientId,
      codigoPostalId: codigoPostal || null,
      dataAtestado: dataAtestadoStr,
      numeroSPMS: undefined,
      observacoes: observacoes || null,
      numeroSNS: numeroUtente || null,
      categorias: categoriasAtestado.map((c) => {
        const aptoRaw = (c as unknown as { apto?: number }).apto
        const aptoGrupo2Raw = (c as unknown as { aptoGrupo2?: number }).aptoGrupo2
        return {
          cartaConducaoId: c.id,
          apto: typeof aptoRaw === 'number' ? aptoRaw : 1,
          aptoGrupo2: typeof aptoGrupo2Raw === 'number' ? aptoGrupo2Raw : 0,
        }
      }),
      restricoes:
        primeiraCategoriaId != null
          ? restricoesAtestado.map((r) => ({
              cartaConducaoRestricaoId: r.id,
              cartaConducaoId: primeiraCategoriaId,
              anotacoes: (r as RestricaoLinha).anotacoes ?? null,
            }))
          : [],
      restricoesAnteriores: [],
    }
    createAtestado.mutate(payload, {
      onSuccess: (res) => {
        if (res?.info?.status === 0) {
          handleLimpar()
        }
      },
    })
  }

  return (
    <>
      <PageHead title='Atestados - Carta de Condução | CliCloud' />
      <DashboardPageContainer>
        {/* Barra superior: título + ações */}
        <div className='mb-4 flex flex-col gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h1 className='text-2xl font-bold text-foreground'>
              Atestados - Carta de Condução
            </h1>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='default'
                className='gap-2'
                onClick={handleLimpar}
              >
                <Brush className='h-4 w-4' />
                Limpar Dados
              </Button>
              <Button
                size='default'
                className='gap-2 bg-primary text-primary-foreground hover:bg-primary/90'
                onClick={handleGuardar}
                disabled={createAtestado.isPending || !utenteId || !medicoId || !clientId}
              >
                <CloudUpload className='h-4 w-4' />
                Guardar/Comunicar Atestado
              </Button>
            </div>
          </div>

          {/* Área do formulário: fundo sólido, layout em coluna para evitar sobreposição */}
          <div className='flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm [&_input]:bg-background [&_input]:h-8 [&_textarea]:bg-background [&_textarea]:min-h-[4rem] [&_[role=combobox]]:bg-background'>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'dados' | 'categorias')} className='flex w-full flex-col'>
          {/* Cabeçalho: linha 1 = Nº Atestado + Data; linha 2 = abas (evita sobreposição) */}
          <div className='w-full shrink-0 space-y-3'>
            <div className='grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md'>
              <div className='space-y-1'>
                <Label htmlFor='numero-atestado' className='text-xs'>Nº Atestado</Label>
                <Input
                  id='numero-atestado'
                  readOnly
                  disabled
                  placeholder='Id '
                  value={numeroAtestado}
                  className='h-8 bg-muted/50 cursor-not-allowed'
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='data-atestado' className='text-xs'>Data</Label>
                <DatePicker
                  id='data-atestado'
                  value={dataAtestado}
                  onChange={() => {}}
                  placeholder='Data'
                  disabled
                  className='h-8 w-full min-w-0 max-w-[200px] border border-input bg-muted/50 py-1.5 shadow-sm cursor-not-allowed'
                />
              </div>
            </div>
            <div className='w-full'>
              <TabsList className='inline-grid w-full max-w-md grid-cols-2'>
                <TabsTrigger value='dados'>Dados do Utente</TabsTrigger>
                <TabsTrigger value='categorias'>Categorias/Restrições</TabsTrigger>
              </TabsList>
            </div>
            <p className='text-xs text-muted-foreground'>
              (*) Obrigatório. (**) Obrigatório se país for Portugal.
            </p>
          </div>

          {/* Conteúdo das abas: sempre abaixo do cabeçalho, em bloco separado */}
            <TabsContent value='dados' className='mt-3 w-full shrink-0 space-y-4 data-[state=inactive]:hidden'>
              {/* Secção Dados do Utente: 3 colunas em lg para compactar */}
              <div className='rounded-lg border border-border bg-muted/30 p-3'>
                <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-foreground'>Dados do Utente</h2>
                <div className='grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Utente (*)</Label>
                    <AsyncCombobox
                      value={utenteId}
                      onChange={setUtenteId}
                      items={utenteItems}
                      isLoading={utentesLight.isFetching}
                      placeholder='Selecionar utente…'
                      searchPlaceholder='Pesquisar utente (nome, nº)…'
                      searchValue={utenteSearch}
                      onSearchValueChange={setUtenteSearch}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Médico (*)</Label>
                    <AsyncCombobox
                      value={medicoId}
                      onChange={setMedicoId}
                      items={medicoItems}
                      isLoading={medicosLight.isFetching}
                      placeholder='Selecionar médico…'
                      searchPlaceholder='Pesquisar médico…'
                      searchValue={medicoSearch}
                      onSearchValueChange={setMedicoSearch}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Nº Utente (SNS)</Label>
                    <div className='flex gap-2'>
                      <ToggleGroup
                        type='single'
                        value={tipoUtente}
                        onValueChange={(v) => v && setTipoUtente(v as 'rnu' | 'cc')}
                        size='sm'
                        className='shrink-0'
                      >
                        <ToggleGroupItem value='rnu' className={tipoUtente === 'rnu' ? 'bg-primary text-primary-foreground data-[state=on]:bg-primary' : ''}>
                          RNU
                        </ToggleGroupItem>
                        <ToggleGroupItem value='cc'>CC</ToggleGroupItem>
                      </ToggleGroup>
                      <Input placeholder='Nº Utente' value={numeroUtente} onChange={(e) => setNumeroUtente(e.target.value)} className='h-8 flex-1 min-w-0' />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Nome Utente (*)</Label>
                    <div className='flex gap-1'>
                      <Input placeholder='Nome...' value={nomeUtente} onChange={(e) => setNomeUtente(e.target.value)} className='h-8 flex-1 min-w-0' />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0'><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Sexo (*)</Label>
                    <Select value={sexo} onValueChange={setSexo}>
                      <SelectTrigger className='h-8'><SelectValue placeholder='Sexo' /></SelectTrigger>
                      <SelectContent>{SEXO_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Data Nasc. (*)</Label>
                    <DatePicker value={dataNascimento} onChange={setDataNascimento} placeholder='Data' className='h-8 w-full border border-input bg-background py-1.5 shadow-sm' />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Tipo Doc. (*)</Label>
                    <Select value={tipoDoc} onValueChange={setTipoDoc}>
                      <SelectTrigger className='h-8'><SelectValue placeholder='Tipo' /></SelectTrigger>
                      <SelectContent>{TIPO_DOC_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>NIF (*)</Label>
                    <Input placeholder='NIF' value={nif} onChange={(e) => setNif(e.target.value)} className='h-8' />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>BI / CC</Label>
                    <Input placeholder='BI / CC' value={numeroBiCc} onChange={(e) => setNumeroBiCc(e.target.value)} className='h-8' />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Carta Condução</Label>
                    <Input placeholder='Nº Carta' value={numCartaConducao} onChange={(e) => setNumCartaConducao(e.target.value)} className='h-8' />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Nº Doc. Ident. (*)</Label>
                    <Input placeholder='Nº Documento' value={numDocIdentificacao} onChange={(e) => setNumDocIdentificacao(e.target.value)} className='h-8' />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Validade Doc.</Label>
                    <DatePicker value={validadeDoc} onChange={setValidadeDoc} placeholder='Validade' className='h-8 w-full border border-input bg-background py-1.5 shadow-sm' />
                  </div>
                </div>
              </div>

              {/* Morada: comboboxes geográficos */}
              <div className='rounded-lg border border-border bg-muted/20 p-3'>
                <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-primary'>Morada</h2>
                <div className='grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-1 sm:col-span-2 lg:col-span-3'>
                    <Label className='text-xs'>Morada</Label>
                    <Input placeholder='Morada' value={morada} onChange={(e) => setMorada(e.target.value)} className='h-8' />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>País (*)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={pais}
                        onChange={(v) => {
                          setPais(v)
                          setDistrito('')
                          setConcelho('')
                          setFreguesia('')
                          setCodigoPostal('')
                        }}
                        items={paisItems}
                        isLoading={paisesMorada.isFetching}
                        placeholder='Selecionar país…'
                        searchPlaceholder='Pesquisar país…'
                        searchValue={paisQ}
                        onSearchValueChange={setPaisQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar país' onClick={() => { setGeoModalType('pais'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Código Postal (*)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={codigoPostal}
                        onChange={setCodigoPostal}
                        items={cpItems}
                        isLoading={codigosPostais.isFetching}
                        placeholder='Selecionar código postal…'
                        searchPlaceholder='Pesquisar CP…'
                        searchValue={cpQ}
                        onSearchValueChange={setCpQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar código postal (em breve)' disabled><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Distrito (**)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={distrito}
                        onChange={(v) => {
                          setDistrito(v)
                          setConcelho('')
                          setFreguesia('')
                          setCodigoPostal('')
                        }}
                        items={distritoItems}
                        isLoading={distritosMorada.isFetching}
                        placeholder={pais ? 'Selecionar distrito…' : 'Selecione primeiro o país'}
                        searchPlaceholder='Pesquisar distrito…'
                        searchValue={distritoQ}
                        onSearchValueChange={setDistritoQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar distrito' onClick={() => { setGeoModalType('distrito'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Concelho (**)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={concelho}
                        onChange={(v) => {
                          setConcelho(v)
                          setFreguesia('')
                          setCodigoPostal('')
                        }}
                        items={concelhoItems}
                        isLoading={concelhosMorada.isFetching}
                        placeholder={distrito ? 'Selecionar concelho…' : 'Selecione primeiro o distrito'}
                        searchPlaceholder='Pesquisar concelho…'
                        searchValue={concelhoQ}
                        onSearchValueChange={setConcelhoQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar concelho' onClick={() => { setGeoModalType('concelho'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Freguesia (**)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={freguesia}
                        onChange={setFreguesia}
                        items={freguesiaItems}
                        isLoading={freguesiasMorada.isFetching}
                        placeholder={concelho ? 'Selecionar freguesia…' : 'Selecione primeiro o concelho'}
                        searchPlaceholder='Pesquisar freguesia…'
                        searchValue={freguesiaQ}
                        onSearchValueChange={setFreguesiaQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar freguesia' onClick={() => { setGeoModalType('freguesia'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Naturalidade: comboboxes geográficos */}
              <div className='rounded-lg border border-border bg-muted/20 p-3'>
                <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-primary'>Naturalidade</h2>
                <div className='grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-1'>
                    <Label className='text-xs'>País Nacionalidade (*)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={paisNacionalidade}
                        onChange={setPaisNacionalidade}
                        items={paisNacItems}
                        isLoading={paisesNac.isFetching}
                        placeholder='Selecionar país…'
                        searchPlaceholder='Pesquisar país…'
                        searchValue={paisNacQ}
                        onSearchValueChange={setPaisNacQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar país' onClick={() => { setGeoModalType('pais'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>País Naturalidade (*)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={paisNaturalidade}
                        onChange={(v) => {
                          setPaisNaturalidade(v)
                          setDistritoNaturalidade('')
                          setConcelhoNaturalidade('')
                          setFreguesiaNaturalidade('')
                        }}
                        items={paisNatItems}
                        isLoading={paisesNat.isFetching}
                        placeholder='Selecionar país…'
                        searchPlaceholder='Pesquisar país…'
                        searchValue={paisNatQ}
                        onSearchValueChange={setPaisNatQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar país' onClick={() => { setGeoModalType('pais'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Distrito (**)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={distritoNaturalidade}
                        onChange={(v) => {
                          setDistritoNaturalidade(v)
                          setConcelhoNaturalidade('')
                          setFreguesiaNaturalidade('')
                        }}
                        items={distritoNatItems}
                        isLoading={distritosNat.isFetching}
                        placeholder={paisNaturalidade ? 'Selecionar distrito…' : 'Selecione primeiro o país'}
                        searchPlaceholder='Pesquisar distrito…'
                        searchValue={distritoNatQ}
                        onSearchValueChange={setDistritoNatQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar distrito' onClick={() => { setGeoModalType('distrito'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Concelho (**)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={concelhoNaturalidade}
                        onChange={(v) => {
                          setConcelhoNaturalidade(v)
                          setFreguesiaNaturalidade('')
                        }}
                        items={concelhoNatItems}
                        isLoading={concelhosNat.isFetching}
                        placeholder={distritoNaturalidade ? 'Selecionar concelho…' : 'Selecione primeiro o distrito'}
                        searchPlaceholder='Pesquisar concelho…'
                        searchValue={concelhoNatQ}
                        onSearchValueChange={setConcelhoNatQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar concelho' onClick={() => { setGeoModalType('concelho'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Freguesia (**)</Label>
                    <div className='flex gap-1'>
                      <AsyncCombobox
                        value={freguesiaNaturalidade}
                        onChange={setFreguesiaNaturalidade}
                        items={freguesiaNatItems}
                        isLoading={freguesiasNat.isFetching}
                        placeholder={concelhoNaturalidade ? 'Selecionar freguesia…' : 'Selecione primeiro o concelho'}
                        searchPlaceholder='Pesquisar freguesia…'
                        searchValue={freguesiaNatQ}
                        onSearchValueChange={setFreguesiaNatQ}
                      />
                      <Button type='button' size='icon' variant='default' className='h-8 w-8 shrink-0' title='Adicionar freguesia' onClick={() => { setGeoModalType('freguesia'); setGeoModalOpen(true) }}><Plus className='h-3.5 w-3.5' /></Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-1'>
                <Label className='text-xs'>Observações</Label>
                <Textarea placeholder='Observações...' value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className='min-h-[4rem]' />
              </div>
            </TabsContent>

            <TabsContent value='categorias' className='mt-3 w-full shrink-0 space-y-4 data-[state=inactive]:hidden'>
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <div>
                  <div className='mb-1.5 flex flex-wrap items-center gap-2'>
                    <h2 className='text-xs font-semibold uppercase tracking-wide text-primary'>Categorias</h2>
                    <Select value={selectedCategoriaId} onValueChange={setSelectedCategoriaId}>
                      <SelectTrigger className='h-8 w-[200px]'><SelectValue placeholder='Selecionar categoria…' /></SelectTrigger>
                      <SelectContent>
                        {categoriasOptions.map((o: { value: string; label: string }) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size='sm' variant='default' className='h-8 gap-1 text-xs' onClick={handleInserirCategoria} disabled={!selectedCategoriaId}><Plus className='h-3 w-3' /> Inserir</Button>
                  </div>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow className='border-b'>
                          <TableHead className='h-8 text-xs font-medium'>Código</TableHead>
                          <TableHead className='text-xs font-medium'>Categoria</TableHead>
                          <TableHead className='text-xs font-medium'>Apto</TableHead>
                          <TableHead className='text-xs font-medium'>Apto Grupo 2</TableHead>
                          <TableHead className='text-right text-xs font-medium'>Opções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoriasAtestado.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className='h-16 text-center text-xs text-muted-foreground'>
                              Não existem dados a apresentar
                            </TableCell>
                          </TableRow>
                        ) : (
                          categoriasAtestado.map((c: CategoriaLinha) => (
                            <TableRow key={c.id}>
                              <TableCell className='text-xs'>{c.codigoCarta}</TableCell>
                              <TableCell className='text-xs'>{c.descricao}</TableCell>
                              <TableCell className='text-xs'>—</TableCell>
                              <TableCell className='text-xs'>—</TableCell>
                              <TableCell className='text-right'>
                                <Button type='button' size='sm' variant='ghost' className='h-7 text-xs text-destructive hover:text-destructive' onClick={() => handleRemoverCategoria(c.id)}>Remover</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div>
                  <div className='mb-1.5 flex flex-wrap items-center gap-2'>
                    <h2 className='text-xs font-semibold uppercase tracking-wide text-primary'>Restrições</h2>
                    <Select value={selectedRestricaoId} onValueChange={setSelectedRestricaoId}>
                      <SelectTrigger className='h-8 w-[200px]'><SelectValue placeholder='Selecionar restrição…' /></SelectTrigger>
                      <SelectContent>
                        {restricoesOptions.map((o: { value: string; label: string }) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size='sm' variant='default' className='h-8 gap-1 text-xs' onClick={handleInserirRestricao} disabled={!selectedRestricaoId}><Plus className='h-3 w-3' /> Inserir</Button>
                  </div>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow className='border-b'>
                          <TableHead className='h-8 text-xs font-medium'>Código</TableHead>
                          <TableHead className='text-xs font-medium'>Restrição</TableHead>
                          <TableHead className='text-xs font-medium'>Categorias</TableHead>
                          <TableHead className='text-xs font-medium'>Anotações</TableHead>
                          <TableHead className='text-right text-xs font-medium'>Opções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {restricoesAtestado.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className='h-16 text-center text-xs text-muted-foreground'>
                              Não existem dados a apresentar
                            </TableCell>
                          </TableRow>
                        ) : (
                          restricoesAtestado.map((r: RestricaoLinha) => (
                            <TableRow key={r.id}>
                              <TableCell className='text-xs'>{r.codigoRestricao}</TableCell>
                              <TableCell className='text-xs'>{r.descricao}</TableCell>
                              <TableCell className='text-xs'>—</TableCell>
                              <TableCell className='text-xs'>—</TableCell>
                              <TableCell className='text-right'>
                                <Button type='button' size='sm' variant='ghost' className='h-7 text-xs text-destructive hover:text-destructive' onClick={() => handleRemoverRestricao(r.id)}>Remover</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              <div>
                <div className='mb-1.5 flex items-center justify-between'>
                  <h2 className='text-xs font-semibold uppercase tracking-wide text-primary'>Restrições Anteriores</h2>
                  <Button size='sm' variant='default' className='h-8 gap-1 text-xs'><Plus className='h-3 w-3' /> Inserir</Button>
                </div>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow className='border-b'>
                        <TableHead className='h-8 text-xs font-medium'>Código</TableHead>
                        <TableHead className='text-xs font-medium'>Restrição</TableHead>
                        <TableHead className='text-xs font-medium'>Anotações</TableHead>
                        <TableHead className='text-right text-xs font-medium'>Opções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className='h-16 text-center text-xs text-muted-foreground'>
                          Não existem dados a apresentar
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>Observações</Label>
                <Textarea placeholder='Observações...' value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className='min-h-[4rem]' />
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </DashboardPageContainer>

      {/* Modais de criação rápida: País, Distrito, Concelho, Freguesia (código postal ainda não) */}
      {geoModalType === 'pais' && (
        <PaisViewCreateModal
          open={geoModalOpen}
          onOpenChange={(open: boolean) => { setGeoModalOpen(open); if (!open) setGeoModalType(null) }}
          mode='create'
          viewData={null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['utility', 'pais', 'light'] })
          }}
        />
      )}
      {geoModalType === 'distrito' && (
        <DistritoViewCreateModal
          open={geoModalOpen}
          onOpenChange={(open: boolean) => { setGeoModalOpen(open); if (!open) setGeoModalType(null) }}
          mode='create'
          viewData={null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['utility', 'distrito', 'light'] })
          }}
        />
      )}
      {geoModalType === 'concelho' && (
        <ConcelhoViewCreateModal
          open={geoModalOpen}
          onOpenChange={(open: boolean) => { setGeoModalOpen(open); if (!open) setGeoModalType(null) }}
          mode='create'
          viewData={null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['utility', 'concelho', 'light'] })
          }}
        />
      )}
      {geoModalType === 'freguesia' && (
        <FreguesiaViewCreateModal
          open={geoModalOpen}
          onOpenChange={(open: boolean) => { setGeoModalOpen(open); if (!open) setGeoModalType(null) }}
          mode='create'
          viewData={null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['utility', 'freguesia', 'light'] })
          }}
        />
      )}
    </>
  )
}
