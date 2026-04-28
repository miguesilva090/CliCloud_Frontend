import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import type { DentariaTabProps } from './DentariaTab'
import {
  useEstadosDentarios,
  useTiposTratamentoDentario,
  useOdontogramaByUtenteConsulta,
  useCreateOdontogramaLinha,
  useUpdateOdontogramaLinha,
  useDeleteOdontogramaLinha,
  useCreateEstadoDentario,
  useCreateTipoTratamentoDentario,
} from '../queries/odontograma-queries'
import { ToothSvg } from '@/components/odontograma/ToothSvg'
import { ToothSurfaceSvg } from '@/components/odontograma/ToothSurfaceSvg'
import { useGetConsultasEfetuadasPaginated } from '@/pages/area-clinica/processo-clinico/historico/queries/consultas-efetuadas-queries'
import type { ConsultaTableDTO } from '@/types/dtos/consultas/consulta.dtos'
import type { OdontogramaDefinitivoDTO } from '@/types/dtos/odontologia/odontograma-definitivo.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import { Pencil, Trash2 } from 'lucide-react'
import { EnhancedModal } from '@/components/ui/enhanced-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/utils/toast-utils'
import { ODONTOGRAMA_TOAST_INVALID_ZONE } from '@/components/odontograma/odontograma-messages'
import {
  findLegacyAction,
  ODONTOGRAMA_LEGACY_ACTIONS,
  REMOVE_SELECTION_ACTION,
} from '@/components/odontograma/odontograma-legacy-config'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { SubsistemaServicoViewCreateModal } from '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/modals/subsistema-servico-view-create-modal'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import {
  ODONTOGRAMA_BUTTON_ICON_SVG,
  ODONTOGRAMA_BUTTON_ICON_SVG_ALL_BLACK,
  ODONTOGRAMA_BUTTON_ICON_SVG_OUTROS_ESTADOS,
  ODONTOGRAMA_BUTTON_ICON_SVG_REMOVER_SELECAO,
} from '@/components/odontograma/odontograma-button-icon'

export function OdontogramaTab({ utenteId }: DentariaTabProps) {
  const fichaClinicaPermissionId = modules.areaClinica.permissions.fichaClinica.id
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(fichaClinicaPermissionId)
  const [searchParams, setSearchParams] = useSearchParams()
  const consultaId = searchParams.get('consultaId') ?? null
  const { data: linhas, isLoading } = useOdontogramaByUtenteConsulta(utenteId, consultaId)
  const { data: estados } = useEstadosDentarios()
  const { data: tratamentos } = useTiposTratamentoDentario()

  const [codigoEstadoPadrao, setCodigoEstadoPadrao] = useState<string>('')
  const [codigoTratamentoPadrao, setCodigoTratamentoPadrao] = useState<string>('')
  const [descricao, setDescricao] = useState<string>('')
  const [panelTab, setPanelTab] = useState<'estados' | 'tratamentos'>('estados')

  const createLinhaMutation = useCreateOdontogramaLinha(utenteId, consultaId)
  const updateLinhaMutation = useUpdateOdontogramaLinha(utenteId, consultaId)
  const deleteLinhaMutation = useDeleteOdontogramaLinha(utenteId, consultaId)
  const createEstadoMutation = useCreateEstadoDentario()
  const createTratMutation = useCreateTipoTratamentoDentario()

  const [editLinha, setEditLinha] = useState<OdontogramaDefinitivoDTO | null>(null)
  const [editDescricao, setEditDescricao] = useState<string>('')
  const [editObservacoes, setEditObservacoes] = useState<string>('')
  const [editQuantidade, setEditQuantidade] = useState<number>(1)
  const [editFaturar, setEditFaturar] = useState<boolean>(false)
  const [editValorUnitario, setEditValorUnitario] = useState<number>(0)
  const [editValorOrgPercent, setEditValorOrgPercent] = useState<number>(0)
  const [editValorUtente, setEditValorUtente] = useState<number>(0)
  const [editServicoNome, setEditServicoNome] = useState<string>('-')
  const [appliedVersion, setAppliedVersion] = useState(0)

  const [addOpen, setAddOpen] = useState(false)
  const [addKind, setAddKind] = useState<'estado' | 'tratamento'>('estado')
  const [addCodigo, setAddCodigo] = useState('')
  const [addDescricao, setAddDescricao] = useState('')
  const [addAtivo, setAddAtivo] = useState(true)
  const [addEstadoPadrao, setAddEstadoPadrao] = useState(true)
  const [addFaturavel, setAddFaturavel] = useState(false)

  const teethContainerRef = useRef<HTMLDivElement | null>(null)
  const [rightPanelHeight, setRightPanelHeight] = useState<number | null>(null)
  const [ponteStartTooth, setPonteStartTooth] = useState<number | null>(null)
  const [ponteRects, setPonteRects] = useState<
    Array<{ x: number; y: number; width: number; height: number; color: string }>
  >([])
  const ponteSvgRef = useRef<SVGSVGElement | null>(null)

  const isEditTratamento = !!(
    editLinha &&
    (editLinha.codigoTratamentoPadrao ?? editLinha.codigoTratamentoPersonalizado)
  )

  const [isServicosModalOpen, setIsServicosModalOpen] = useState(false)
  const [servicoSearchModal, setServicoSearchModal] = useState('')
  const [selectedSubsistemaId, setSelectedSubsistemaId] = useState<string | null>(null)
  const [subsistemaCrudOpen, setSubsistemaCrudOpen] = useState(false)

  const getLinhaColor = (linha: OdontogramaDefinitivoDTO): string => {
    const code =
      linha.codigoTratamentoPadrao ??
      linha.codigoTratamentoPersonalizado ??
      linha.codigoEstadoPadrao ??
      linha.codigoEstadoPersonalizado ??
      ''
    const action = findLegacyAction(code)
    if (action?.toothPartColors?.coroaDente) return action.toothPartColors.coroaDente
    if (action?.toothPartColors?.raizDente) return action.toothPartColors.raizDente
    return action?.color ?? '#fa5722'
  }

  const getActiveColor = (): string => {
    const code = codigoTratamentoPadrao || codigoEstadoPadrao || ''
    if (!code) return '#fa5722'
    return findLegacyAction(code)?.color ?? '#fa5722'
  }

  const getActiveAction = () => {
    const code = codigoTratamentoPadrao || codigoEstadoPadrao || ''
    return findLegacyAction(code)
  }

  const WHEEL_BORDA_CLASSES = [
    'DRABordaCima',
    'DRABordaDir',
    'DRABordaBaixo',
    'DRABordaEsq',
    'DRBBordaCima',
    'DRBBordaDir',
    'DRBBordaBaixo',
    'DRBBordaEsq',
  ]

  const getWheelClickableAreaClasses = () => {
    const action = getActiveAction()
    return action?.code === 'E5' ? WHEEL_BORDA_CLASSES : undefined
  }

  const applyOverlayOnlyOnToothClick = (numero: number) => {
    const action = getActiveAction()
    if (!action?.overlayOnly) return
    // Para estados “overlay only” (ex.: fístula), o utilizador pode clicar em qualquer zona do dente.
    // Guardamos sem superfície (codigoSuperficie=null) e desenhamos o overlay no ápice.
    applyOnZoneClick(numero, '__overlay__', true)
  }

  const preserveWindowScroll = (run: () => void) => {
    // Ao adicionar/remover linhas, o layout muda e o browser pode ajustar o scroll.
    // Capturamos e restauramos para evitar “saltos” de scroll.
    const y = window.scrollY
    run()
    requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y })
    })
  }

  const EMPTY_APPLIED = useMemo(() => ({} as Record<string, string>), [])
  const EMPTY_ZONES = useMemo(
    () => ({} as Partial<Record<'coroaDente' | 'raizDente' | 'fundoDente', string>>),
    [],
  )
  const EMPTY_OVERLAYS = useMemo(
    () => [] as Array<{ kind: 'fistula' | 'fratura' | 'ortodontia' | 'ponte'; color: string }>,
    [],
  )

  const { appliedWheelByTooth, appliedZonesByTooth, appliedOverlaysByTooth, appliedToothRenderByTooth, cellStyleByTooth } = useMemo(() => {
    const wheel: Record<number, Record<string, string>> = {}
    const zones: Record<number, Partial<Record<'coroaDente' | 'raizDente' | 'fundoDente', string>>> = {}
    const overlays: Record<number, Array<{ kind: 'fistula' | 'fratura' | 'ortodontia' | 'ponte'; color: string }>> = {}
    const render: Record<number, 'implant'> = {}
    const cellStyle: Record<number, React.CSSProperties> = {}

    const allTeeth = [
      18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
      48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
    ]

    for (const l of linhas ?? []) {
      const n = l.numeroDente
      const zona = l.codigoSuperficie ?? ''
      const color = getLinhaColor(l)
      const code =
        l.codigoTratamentoPadrao ??
        l.codigoTratamentoPersonalizado ??
        l.codigoEstadoPadrao ??
        l.codigoEstadoPersonalizado ??
        ''
      const action = findLegacyAction(code)

      if (zona.startsWith('DR')) {
        ;(wheel[n] ??= {})[zona] = color
      } else if (zona === 'coroaDente' || zona === 'raizDente') {
        // Alguns estados/tratamentos são só overlay/cell background e não devem pintar o dente.
        if (action?.overlayOnly || action?.code === 'T9') {
          // noop
        } else if (action?.toothRender?.kind === 'implant') {
          render[n] = 'implant'
        } else if (action?.applyTargets.includes('toothAll')) {
          const partColors = action.toothPartColors
          ;(zones[n] ??= {}).coroaDente = partColors?.coroaDente ?? color
          zones[n].raizDente = partColors?.raizDente ?? color
          if (partColors?.fundoDente) zones[n].fundoDente = partColors.fundoDente
        } else {
          ;(zones[n] ??= {})[zona] = color
        }
      }

      // gengiva (legado): fundo da célula (usado para desenhar a “barra” atrás do dente).
      if ((l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado) === 'T9') {
        cellStyle[n] = {
          backgroundColor: findLegacyAction('T9')?.color ?? '#f48fb1',
        }
      }

      if (action?.overlay) {
        if (action.code === 'T10') {
          // No legado, a ponte é desenhada por cima do odontograma com um <svg fixed> (não dentro de cada dente).
          // Aqui ignoramos para não duplicar/atrapalhar.
        } else {
          ;(overlays[n] ??= []).push(action.overlay)
        }
      }
    }

    // Tratamento T8 (Destartarização): quando existe pelo menos uma linha,
    // o legado pinta TODAS as coroas de todos os dentes com a mesma cor.
    const hasT8 = (linhas ?? []).some(
      (l) => (l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado) === 'T8',
    )
    if (hasT8) {
      const colorT8 = findLegacyAction('T8')?.color ?? '#ce93d8'
      for (const t of allTeeth) {
        ;(zones[t] ??= {}).coroaDente = colorT8
      }
    }

    // Tratamento T12 (Branqueamento): quando existe pelo menos uma linha,
    // o legado deixa TODAS as “barras” atrás dos dentes a branco,
    // independentemente do dente onde foi aplicado.
    const hasT12 = (linhas ?? []).some(
      (l) => (l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado) === 'T12',
    )
    if (hasT12) {
      // No legado o efeito visual é de barras totalmente brancas.
      const colorT12 = '#ffffff'
      for (const t of allTeeth) {
        cellStyle[t] = {
          backgroundColor: colorT12,
        }
      }
    }

    return {
      appliedWheelByTooth: wheel,
      appliedZonesByTooth: zones,
      appliedOverlaysByTooth: overlays,
      appliedToothRenderByTooth: render,
      cellStyleByTooth: cellStyle,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linhas])

  // Ponte (T10): legado desenha por cima com SVG fixo usando coordenadas reais dos elementos.
  // Mantemos aqui para obter o mesmo comportamento mesmo com espaçamento entre dentes.
  useEffect(() => {
    let rafId: number | null = null

    const compute = () => {
      const el = teethContainerRef.current
      if (!el) return
      const baseRect = el.getBoundingClientRect()
      // Sistema de coordenadas do overlay: usamos o rect do próprio <svg>.
      const svgEl = ponteSvgRef.current
      const svgRect = svgEl?.getBoundingClientRect()
      // Se o <svg> ainda não tiver rect “válido”, fazemos retry num frame.
      if (svgEl && (!svgRect || !Number.isFinite(svgRect.left) || !Number.isFinite(svgRect.top))) {
        requestAnimationFrame(() => compute())
        return
      }
      const overlayLeft = svgRect?.left ?? baseRect.left
      const overlayTop = svgRect?.top ?? baseRect.top

      const t10Lines = (linhas ?? []).filter(
        (l) =>
          (l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado) === 'T10' &&
          l.numeroDenteAte != null &&
          l.numeroDente != null,
      )

      const next: Array<{ x: number; y: number; width: number; height: number; color: string }> = []

      for (const l of t10Lines) {
        // Replicamos o legado para x/y/width:
        // - x usa (topo/left do elemento + width/2) - 5
        // - width usa distância entre lefts dos elementos
        // - y usa (topo + height/2) - 5
        const start = l.numeroDente
        const end = l.numeroDenteAte
        if (end == null) continue

        const elStart = document.getElementById(`DD${start}`)
        const elEnd = document.getElementById(`DD${end}`)
        if (!elStart || !elEnd) continue

        const rectStart = elStart.getBoundingClientRect()
        const rectEnd = elEnd.getBoundingClientRect()

        // Fix principal para maxilar inferior:
        // quando `numeroDente` é o "mais pequeno" mas fisicamente está à direita,
        // o rect começava no lado errado e ficava curto. O legado resolve isso
        // escolhendo a âncora conforme a posição no ecrã.
        const anchorRect = rectStart.left <= rectEnd.left ? rectStart : rectEnd
        const otherRect = rectStart.left <= rectEnd.left ? rectEnd : rectStart

        // O legado assume (na prática) que os containers podem ter micro-variações
        // de largura/box; usando centros (left + width/2) evitamos que as pontes curtas
        // fiquem ligeiramente curtas/adiantadas em casos específicos.
        const anchorCenterX = anchorRect.left + anchorRect.width / 2
        const otherCenterX = otherRect.left + otherRect.width / 2

        // Evita ponte “invisível” em spans muito curtos (largura 0 por trunc).
        const distancia = Math.max(1, Math.abs(Math.round(otherCenterX - anchorCenterX)))
        const x = Math.trunc(anchorCenterX - overlayLeft - 5)
        const y = anchorRect.top - overlayTop + Math.trunc(anchorRect.height / 2) - 5

        next.push({
          x,
          y,
          width: distancia,
          height: 10,
          color: findLegacyAction('T10')?.color ?? '#ffee58',
        })
      }

      setPonteRects(next)
    }

    const scheduleCompute = () => {
      if (rafId != null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        compute()
        // Segundo passe para layout/refs estabilizarem após atualizações de linhas.
        requestAnimationFrame(() => compute())
      })
    }

    // Primeiro cálculo imediato (e depois num frame, para layout estabilizar).
    scheduleCompute()

    window.addEventListener('resize', scheduleCompute)

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', scheduleCompute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linhas])

  const getAppliedAreas = (numero: number): Record<string, string> => {
    return appliedWheelByTooth[numero] ?? EMPTY_APPLIED
  }

  const getAppliedZones = (
    numero: number,
  ): Partial<Record<'coroaDente' | 'raizDente' | 'fundoDente', string>> => {
    return appliedZonesByTooth[numero] ?? EMPTY_ZONES
  }

  const getAppliedOverlays = (
    numero: number,
  ): Array<{ kind: 'fistula' | 'fratura' | 'ortodontia' | 'ponte'; color: string }> => {
    return appliedOverlaysByTooth[numero] ?? EMPTY_OVERLAYS
  }

  const getAppliedToothRenderKind = (numero: number): 'implant' | undefined => {
    return appliedToothRenderByTooth[numero]
  }

  const applyOnZoneClick = (
    numero: number,
    zonaClass: string,
    selected?: boolean,
  ): boolean => {
    if (!(canAdd || canChange)) {
      toast.error('Sem permissão para alterar o odontograma.')
      return false
    }
    const estadoSel = codigoEstadoPadrao || null
    const tratSel = codigoTratamentoPadrao || null
    const activeAction = getActiveAction()
    const selectedEstado = (estados ?? []).find((e) => (e.codigo ?? '') === codigoEstadoPadrao)
    const selectedTrat = (tratamentos ?? []).find((t) => (t.codigo ?? '') === codigoTratamentoPadrao)

    if (!estadoSel && !tratSel) {
      toast.info('Selecione um estado ou tratamento antes de aplicar no odontograma.')
      return false
    }

    if (!consultaId) {
      toast.info('Selecione uma consulta antes de aplicar no odontograma.')
      return false
    }

    // Não permitir aplicar tratamentos de dente em rodas (superfícies).
    // Nas rodas, apenas estados/tratamentos cujo alvo é 'wheel' devem funcionar;
    // os restantes mostram o toast de zona inválida.
    if (zonaClass.startsWith('DR') && activeAction?.kind === 'tratamento') {
      if (!activeAction.applyTargets.includes('wheel')) {
        toast.error(ODONTOGRAMA_TOAST_INVALID_ZONE)
        return false
      }
    }

    // Regra global: não permitir remover pelo clique.
    // A remoção deve ser feita apenas apagando a linha na listagem inferior.
    if (selected === false) {
      toast.error('O dente já tem estado/tratamento atribuído. Remova a linha na listagem inferior.')
      return false
    }

    if (!selected) return true

    // Ponte (T10): seleção em 2 cliques (dente inicial -> dente final) e depois cria 1 linha.
    if (activeAction?.code === 'T10') {
      const isWheel = zonaClass.startsWith('DR')
      if (isWheel) {
        toast.error(ODONTOGRAMA_TOAST_INVALID_ZONE)
        setPonteStartTooth(null)
        return false
      }

      if (ponteStartTooth == null) {
        setPonteStartTooth(numero)
        return true
      }

      const start = ponteStartTooth
      const end = numero

      if (start === end) {
        toast.error('Selecione um dente diferente para a ponte.')
        setPonteStartTooth(null)
        return false
      }

      const ambosSuperiores = start < 30 && end < 30
      const ambosInferiores = start > 30 && end > 30
      if (!ambosSuperiores && !ambosInferiores) {
        toast.error('A ponte tem de ser toda no maxilar superior ou inferior.')
        setPonteStartTooth(null)
        return false
      }

      const existePonte = (linhas ?? []).some((l) => {
        if ((l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado) !== 'T10') return false
        const a = l.numeroDente
        const b = l.numeroDenteAte ?? l.numeroDente
        return (a === start && b === end) || (a === end && b === start)
      })

      if (existePonte) {
        toast.error('Já existe uma ponte entre estes dentes.')
        setPonteStartTooth(null)
        return false
      }

      const desc =
        selectedTrat?.descricao ??
        selectedEstado?.descricao ??
        descricao ??
        'Ponte'

      const ensureAndCreate = async () => {
        try {
          if (tratSel && !selectedTrat) {
            await createTratMutation.mutateAsync({
              codigo: tratSel,
              descricao: String(desc ?? ''),
              faturavel: false,
              codigoServicoAssociado: null,
              nomeServicoAssociado: null,
              ativo: true,
            })
          }

          const ponteT10Linhas = (linhas ?? []).filter(
            (l) => (l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado) === 'T10',
          )
          const startUsedAsInitial = ponteT10Linhas.some((l) => l.numeroDente === start)
          const endUsedAsInitial = ponteT10Linhas.some((l) => l.numeroDente === end)

          if (startUsedAsInitial && endUsedAsInitial) {
            toast.error('Não é possível criar esta ponte com estes dois dentes (ambos já são “iniciais”).')
            setPonteStartTooth(null)
            return
          }

          const numeroDente = startUsedAsInitial && !endUsedAsInitial ? end : start
          const numeroDenteAte = startUsedAsInitial && !endUsedAsInitial ? start : end

          await createLinhaMutation.mutateAsync({
            numeroDente,
            numeroDenteAte,
            codigoSuperficie: 'coroaDente',
            codigoEstadoPadrao: null,
            codigoTratamentoPadrao: 'T10',
            codigoEstadoPersonalizado: null,
            codigoTratamentoPersonalizado: null,
            descricao: String(desc ?? ''),
            observacoes: null,
            faturar: Boolean(selectedTrat?.faturavel ?? false),
            quantidade: 1,
            valorServico: null,
            valorUtente: null,
            valorEntidade: null,
            linhaFaturacaoId: null,
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          toast.error(`Não foi possível aplicar a ponte: ${msg}`)
          setAppliedVersion((v) => v + 1)
        } finally {
          setPonteStartTooth(null)
        }
      }

      preserveWindowScroll(() => {
        void ensureAndCreate()
      })

      return true
    }

    // Evita duplicados: se já existir linha para este dente+zona+estado/tratamento, não cria outra.
    const effectiveZona = activeAction?.overlayOnly
      ? activeAction?.code === 'T4'
        ? 'coroaDente'
        : null
      : activeAction?.code === 'E1' || (activeAction?.applyTargets.includes('toothAll') && !zonaClass.startsWith('DR'))
        ? 'coroaDente'
        : zonaClass
    const alreadyExists =
      activeAction?.code === 'T8' && tratSel === 'T8'
        ? // Destartarização: apenas UMA linha por consulta, independentemente do dente.
          (linhas ?? []).some((l) => (l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado) === 'T8')
        : (linhas ?? []).some((l) => {
            if (l.numeroDente !== numero) return false
            if (!activeAction?.overlayOnly) {
              if ((l.codigoSuperficie ?? '') !== effectiveZona) return false
            }
            if (tratSel && (l.codigoTratamentoPadrao ?? l.codigoTratamentoPersonalizado ?? null) === tratSel) return true
            if (estadoSel && (l.codigoEstadoPadrao ?? l.codigoEstadoPersonalizado ?? null) === estadoSel) return true
            return false
          })
    if (alreadyExists) {
      toast.error('O dente já tem estado/tratamento atribuído. Remova a linha na listagem inferior.')
      return false
    }

    // valida alvos (wheel vs toothZones)
    const isWheel = zonaClass.startsWith('DR')

    // Regras específicas: Bolsa Periodontal (E5) só pode ser aplicada nas bordas externas da roda.
    if (activeAction?.code === 'E5' && isWheel) {
      const isOuter = /^DR[AB]Borda/i.test(zonaClass)
      if (!isOuter) {
        toast.error(ODONTOGRAMA_TOAST_INVALID_ZONE)
        return false
      }
    }

    const allow =
      (isWheel && activeAction?.applyTargets.includes('wheel')) ||
      (!isWheel && activeAction?.applyTargets.includes('toothZones')) ||
      (!isWheel && activeAction?.applyTargets.includes('toothAll'))
    if (!allow) {
      toast.error(ODONTOGRAMA_TOAST_INVALID_ZONE)
      return false
    }

    const desc =
      selectedTrat?.descricao ??
      selectedEstado?.descricao ??
      descricao ??
      (tratSel ? `Tratamento ${tratSel}` : `Estado ${estadoSel}`)

    // Se o código selecionado (legado) ainda não existir na BD, criamos automaticamente
    // para não rebentar com FK no backend.
    const ensureAndCreate = async () => {
      try {
        if (estadoSel && !selectedEstado) {
          await createEstadoMutation.mutateAsync({
            codigo: estadoSel,
            descricao: String(desc ?? ''),
            estadoPadrao: true,
            ativo: true,
          })
        }
        if (tratSel && !selectedTrat) {
          await createTratMutation.mutateAsync({
            codigo: tratSel,
            descricao: String(desc ?? ''),
            faturavel: false,
            codigoServicoAssociado: null,
            nomeServicoAssociado: null,
            ativo: true,
          })
        }

        await createLinhaMutation.mutateAsync({
          numeroDente: numero,
          numeroDenteAte: null,
          // E1: guardamos numa única zona (coroaDente) — o UI pinta coroa+raiz+fundo via toothAll.
          // overlayOnly (ex.: fístula): guardamos sem superfície.
          codigoSuperficie: activeAction?.overlayOnly
            ? activeAction?.code === 'T4'
              ? 'coroaDente'
              : null
            : activeAction?.code === 'E1' || (activeAction?.applyTargets.includes('toothAll') && !zonaClass.startsWith('DR'))
              ? 'coroaDente'
              : zonaClass,
          codigoEstadoPadrao: estadoSel,
          codigoTratamentoPadrao: tratSel,
          codigoEstadoPersonalizado: null,
          codigoTratamentoPersonalizado: null,
          descricao: String(desc ?? ''),
          observacoes: null,
          faturar: Boolean(selectedTrat?.faturavel ?? false),
          quantidade: 1,
          valorServico: null,
          valorUtente: null,
          valorEntidade: null,
          linhaFaturacaoId: null,
        })
      } catch {
        toast.error('Não foi possível aplicar o estado/tratamento nesta zona.')
        setAppliedVersion((v) => v + 1)
      }
    }

    preserveWindowScroll(() => {
      void ensureAndCreate()
    })

    return true
  }

  const getToothContainerStyle = (numero: number): React.CSSProperties | undefined => {
    return cellStyleByTooth[numero]
  }

  const filtrosConsultas =
    utenteId && utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []
  const { data: consultasData } = useGetConsultasEfetuadasPaginated(
    1,
    50,
    filtrosConsultas,
    null,
  )
  const consultas =
    ((consultasData as { info?: { data?: ConsultaTableDTO[] } } | undefined)?.info?.data ??
    []) as ConsultaTableDTO[]

  const selectedConsultaIndex = consultas.findIndex((c) => c.id === consultaId)
  const selectedConsulta = selectedConsultaIndex >= 0 ? consultas[selectedConsultaIndex] : null

  const formatConsultaLabel = (c: ConsultaTableDTO | null): string => {
    if (!c) return ''
    const rawDate = c.data ?? ''
    const onlyDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
    const time = c.horaInic ?? ''
    return `${onlyDate} ${time}`.trim()
  }

  // Dados para o modal de seleção de subsistema de serviços (associar serviço ao tratamento)
  const { data: servicosLightData } = useQuery({
    queryKey: ['servicos-light-odontograma', servicoSearchModal],
    queryFn: async () => {
      const res = await ServicoService().getServicoLight(servicoSearchModal)
      return (res.info?.data ?? []) as ServicoLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
  const servicosLight = servicosLightData ?? []

  const { data: subsistemasResponse } = useQuery({
    queryKey: ['subsistemas-servicos-odontograma'],
    queryFn: async () => {
      const res = await SubsistemaServicoService('tratamentos').getSubsistemaServico()
      return (res.info?.data ?? []) as SubsistemaServicoDTO[]
    },
    enabled: isServicosModalOpen,
    staleTime: 5 * 60 * 1000,
  })
  const subsistemasAll = (subsistemasResponse as SubsistemaServicoDTO[] | undefined) ?? []

  const servicosMap = useMemo(() => {
    const map = new Map<string, ServicoLightDTO>()
    for (const s of servicosLight) {
      map.set(s.id, s)
    }
    return map
  }, [servicosLight])

  const subsistemasFiltered = useMemo(() => {
    if (!subsistemasAll.length) return []
    if (!servicoSearchModal.trim()) return subsistemasAll
    const q = servicoSearchModal.trim().toLowerCase()
    return subsistemasAll.filter((s) => {
      const serv = servicosMap.get(s.servicoId)
      const label = `${serv?.designacao ?? ''} ${s.subsistemaId}`.toLowerCase()
      return label.includes(q)
    })
  }, [subsistemasAll, servicoSearchModal, servicosMap])

  const queryClient = useQueryClient()

  if (!utenteId) {
    return <div className='text-sm text-muted-foreground'>Selecione um utente para ver o odontograma.</div>
  }

  useEffect(() => {
    const el = teethContainerRef.current
    if (!el) return

    const update = () => {
      const next = Math.round(el.getBoundingClientRect().height)
      if (next > 0) setRightPanelHeight(next)
    }

    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className='flex flex-col gap-3'>
      <div className='font-semibold text-sm'>Odontograma</div>

      <div className='flex flex-col gap-2 lg:flex-row lg:items-start'>
        {/* Coluna principal com o odontograma + navegação da consulta */}
        <div className='flex-1 flex flex-col gap-2'>
          <div
            ref={teethContainerRef}
            className='relative rounded-lg border bg-muted p-3 text-sm space-y-3'
          >
            <div className='space-y-3'>
              <svg
                aria-hidden='true'
                className='absolute inset-0 pointer-events-none overflow-visible'
                style={{ zIndex: 40 }}
                ref={ponteSvgRef}
              >
                {ponteRects.map((r, idx) => (
                  <rect
                    key={`ponte-${idx}`}
                    x={r.x}
                    y={r.y}
                    width={r.width}
                    height={r.height}
                    fill={r.color}
                    stroke='#000000'
                    strokeWidth={2}
                  />
                ))}
              </svg>

              <div className='flex flex-col gap-1 text-xs'>
                {/* uma única linha com os 16 dentes superiores */}
                <div className='grid grid-cols-[repeat(16,minmax(0,1fr))] gap-x-1'>
                  {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((n) => (
                    <div
                      key={n}
                      id={`DD${n}`}
                      className='flex flex-col items-center gap-3'
                      style={getToothContainerStyle(n)}
                    >
                      <span className='text-[10px] mb-2'>{n}</span>
                      <div className='pt-1 flex items-center justify-center'>
                        <ToothSvg
                          numero={n}
                          appliedZones={getAppliedZones(n)}
                          appliedOverlays={getAppliedOverlays(n)}
                          toothRenderKind={getAppliedToothRenderKind(n)}
                          activeColor={getActiveColor()}
                          toggleWholeTooth={getActiveAction()?.code === 'E1'}
                          clickableZones={
                            getActiveAction()?.code === 'T11'
                              ? ['raiz']
                              : getActiveAction()?.code === 'E2' ||
                                getActiveAction()?.code === 'T1' ||
                                getActiveAction()?.code === 'T5' ||
                                getActiveAction()?.code === 'T8' ||
                                getActiveAction()?.code === 'T10'
                                ? ['coroa']
                                : undefined
                          }
                          disableZoneClicks={getActiveAction()?.code === 'T4'}
                          suppressLocalHighlight={Boolean(
                            getActiveAction()?.overlayOnly || getActiveAction()?.code === 'T9',
                          )}
                          key={`tooth-${n}-${appliedVersion}`}
                          onSelect={(d) => applyOverlayOnlyOnToothClick(d)}
                          onZoneSelect={(d, zona, selected) => {
                            return applyOnZoneClick(
                              d,
                              zona === 'coroa' ? 'coroaDente' : 'raizDente',
                              selected,
                            )
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* linha única de rodas logo abaixo */}
                <div className='grid grid-cols-[repeat(16,minmax(0,1fr))] gap-x-1 mt-1'>
                  {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((n) => (
                    <div key={n} className='flex items-center justify-center h-10'>
                      <ToothSurfaceSvg
                        numero={n}
                        appliedAreas={getAppliedAreas(n)}
                        activeColor={getActiveColor()}
                        clickableAreaClasses={getWheelClickableAreaClasses()}
                        key={`wheel-${n}-${appliedVersion}`}
                        onSelect={(d, areaClass, selected) => {
                          return applyOnZoneClick(d, areaClass, selected)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex flex-col gap-1 text-xs'>
                {/* linha única de rodas (acima dos dentes) */}
                <div className='grid grid-cols-[repeat(16,minmax(0,1fr))] gap-x-1'>
                  {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((n) => (
                    <div key={n} className='flex items-center justify-center h-10'>
                      <ToothSurfaceSvg
                        numero={n}
                        appliedAreas={getAppliedAreas(n)}
                        activeColor={getActiveColor()}
                        clickableAreaClasses={getWheelClickableAreaClasses()}
                        key={`wheel-${n}-${appliedVersion}`}
                        onSelect={(d, areaClass, selected) => {
                          return applyOnZoneClick(d, areaClass, selected)
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* uma única linha com os 16 dentes inferiores */}
                <div className='grid grid-cols-[repeat(16,minmax(0,1fr))] gap-x-1 mt-1'>
                  {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((n) => (
                    <div
                      key={n}
                      id={`DD${n}`}
                      className='flex flex-col items-center gap-3'
                      style={getToothContainerStyle(n)}
                    >
                      <div className='pt-1 flex items-center justify-center'>
                        <ToothSvg
                          numero={n}
                          appliedZones={getAppliedZones(n)}
                          appliedOverlays={getAppliedOverlays(n)}
                          toothRenderKind={getAppliedToothRenderKind(n)}
                          activeColor={getActiveColor()}
                          toggleWholeTooth={getActiveAction()?.code === 'E1'}
                          clickableZones={
                            getActiveAction()?.code === 'T11'
                              ? ['raiz']
                              : getActiveAction()?.code === 'E2' ||
                                getActiveAction()?.code === 'T1' ||
                                getActiveAction()?.code === 'T5' ||
                                getActiveAction()?.code === 'T8' ||
                                getActiveAction()?.code === 'T10'
                                ? ['coroa']
                                : undefined
                          }
                          disableZoneClicks={getActiveAction()?.code === 'T4'}
                          suppressLocalHighlight={Boolean(
                            getActiveAction()?.overlayOnly || getActiveAction()?.code === 'T9',
                          )}
                          key={`tooth-${n}-${appliedVersion}`}
                          onSelect={(d) => applyOverlayOnlyOnToothClick(d)}
                          onZoneSelect={(d, zona, selected) => {
                            return applyOnZoneClick(
                              d,
                              zona === 'coroa' ? 'coroaDente' : 'raizDente',
                              selected,
                            )
                          }}
                        />
                      </div>
                      <span className='text-[10px] mt-2'>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navegação da consulta centrada em relação ao odontograma */}
          <div className='flex justify-center'>
            <div className='flex items-center gap-3 text-xs'>
              <span>Consulta:</span>
              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  className='h-6 w-6 px-0'
                  disabled={consultas.length === 0 || selectedConsultaIndex <= 0}
                  onClick={() => {
                    if (consultas.length === 0) return
                    const nextIndex =
                      selectedConsultaIndex > 0 ? selectedConsultaIndex - 1 : consultas.length - 1
                    const nextConsulta = consultas[nextIndex]
                    const next = new URLSearchParams(searchParams)
                    next.set('consultaId', nextConsulta.id)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  {'<'}
                </Button>
                <div className='min-w-[190px] rounded border bg-background px-3 py-1 text-xs text-center'>
                  {selectedConsulta
                    ? formatConsultaLabel(selectedConsulta)
                    : consultas.length > 0
                    ? 'Selecionar consulta'
                    : 'Sem consultas'}
                </div>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  className='h-6 w-6 px-0'
                  disabled={consultas.length === 0 || selectedConsultaIndex === consultas.length - 1}
                  onClick={() => {
                    if (consultas.length === 0) return
                    const nextIndex =
                      selectedConsultaIndex >= 0 && selectedConsultaIndex < consultas.length - 1
                        ? selectedConsultaIndex + 1
                        : 0
                    const nextConsulta = consultas[nextIndex]
                    const next = new URLSearchParams(searchParams)
                    next.set('consultaId', nextConsulta.id)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  {'>'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Painel direito: estados / tratamentos */}
        <div
          className='w-full lg:w-[360px] shrink-0 rounded-lg border bg-background overflow-hidden flex flex-col p-3 text-sm'
          style={rightPanelHeight ? { height: rightPanelHeight } : undefined}
        >
          <div className='rounded border bg-slate-200 overflow-hidden flex-1 min-h-0 flex flex-col'>
            <div className='grid grid-cols-2 bg-slate-600 text-white text-xs font-semibold'>
              <button
                type='button'
                className={`px-3 py-1.5 text-left border-r border-white/10 ${
                  panelTab === 'estados' ? 'bg-slate-700' : 'bg-slate-600'
                }`}
                onClick={() => {
                  setPanelTab('estados')
                  setCodigoTratamentoPadrao('')
                }}
              >
                Estados
              </button>
              <button
                type='button'
                className={`px-3 py-1.5 text-left ${
                  panelTab === 'tratamentos' ? 'bg-slate-700' : 'bg-slate-600'
                }`}
                onClick={() => {
                  setPanelTab('tratamentos')
                  setCodigoEstadoPadrao('')
                }}
              >
                Tratamentos
              </button>
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto p-2'>
              <div className='grid grid-cols-2 gap-2'>
                {ODONTOGRAMA_LEGACY_ACTIONS.filter((a) =>
                  panelTab === 'estados' ? a.kind === 'estado' : a.kind === 'tratamento',
                ).map((a) => {
                  const active = a.code === (codigoTratamentoPadrao || codigoEstadoPadrao)
                  const bg = a.buttonBgColor ?? a.color
                  return (
                    <div key={a.code} className='h-[50px] w-full'>
                      <table className='w-full h-full'>
                        <tbody>
                          <tr
                            role='button'
                            tabIndex={0}
                            className={`select-none cursor-pointer ${active ? 'shadow-[inset_0_0_0_3px_#F44336]' : ''}`}
                            style={{
                              border: '1px solid #546e7a',
                              backgroundColor: bg,
                            }}
                            onClick={() => {
                              if (a.kind === 'estado') {
                                setCodigoEstadoPadrao(a.code)
                                setCodigoTratamentoPadrao('')
                                setPanelTab('estados')
                              } else {
                                setCodigoTratamentoPadrao(a.code)
                                setCodigoEstadoPadrao('')
                                setPanelTab('tratamentos')
                              }
                              setDescricao(a.label)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                ;(e.target as HTMLElement).click()
                              }
                            }}
                          >
                            <td className='w-[10%] text-center align-middle'>
                              <div className='flex justify-center'>
                                <span
                                  className='inline-flex items-center justify-center'
                                  style={{ width: 44, height: 44 }}
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      a.code === 'E1'
                                        ? ODONTOGRAMA_BUTTON_ICON_SVG_ALL_BLACK
                                        : a.buttonIconSvg ?? ODONTOGRAMA_BUTTON_ICON_SVG,
                                  }}
                                />
                              </div>
                            </td>
                            <td
                              className={`w-[82%] text-center font-bold text-gray-900 ${
                                a.code === 'T5'
                                  ? 'text-[10px] px-1 whitespace-nowrap'
                                  : 'text-[11px] whitespace-nowrap'
                              }`}
                            >
                              {a.label}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                })}

                {panelTab === 'estados' && (
                  <>
                    <div className='h-[50px] w-full'>
                      <table className='w-full h-full'>
                        <tbody>
                          <tr
                            role='button'
                            tabIndex={0}
                            className='select-none cursor-pointer'
                            style={{
                              border: '1px solid #546e7a',
                              backgroundColor: '#bbdefb',
                            }}
                            onClick={() => {
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                ;(e.target as HTMLElement).click()
                              }
                            }}
                          >
                            <td className='w-[20%] text-center align-middle'>
                              <div className='flex justify-center'>
                                {/* eslint-disable-next-line react/no-danger */}
                                <span
                                  className='inline-flex items-center justify-center'
                                  style={{ width: 44, height: 44 }}
                                  dangerouslySetInnerHTML={{
                                    __html: ODONTOGRAMA_BUTTON_ICON_SVG_OUTROS_ESTADOS,
                                  }}
                                />
                              </div>
                            </td>
                            <td className='w-[80%] text-center font-bold text-[11px] text-gray-900 whitespace-nowrap'>
                              Mais Estados
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className='h-[50px] w-full'>
                      <table className='w-full h-full'>
                        <tbody>
                          <tr
                            role='button'
                            tabIndex={0}
                            className='select-none cursor-pointer'
                            style={{
                              border: '1px solid #546e7a',
                              backgroundColor: REMOVE_SELECTION_ACTION.buttonBgColor ?? '#fce4ec',
                            }}
                            onClick={() => {
                              setCodigoEstadoPadrao('')
                              setCodigoTratamentoPadrao('')
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                ;(e.target as HTMLElement).click()
                              }
                            }}
                          >
                            <td className='w-[20%] text-center align-middle'>
                              <div className='flex justify-center'>
                                {/* eslint-disable-next-line react/no-danger */}
                                <span
                                  className='inline-flex items-center justify-center'
                                  style={{ width: 44, height: 44 }}
                                  dangerouslySetInnerHTML={{
                                    __html: ODONTOGRAMA_BUTTON_ICON_SVG_REMOVER_SELECAO,
                                  }}
                                />
                              </div>
                            </td>
                            <td className='w-[80%] text-center font-bold text-[11px] text-gray-900 whitespace-nowrap'>
                              {REMOVE_SELECTION_ACTION.label}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {panelTab === 'tratamentos' && (
                  <>
                    <div className='h-[50px] w-full'>
                      <table className='w-full h-full'>
                        <tbody>
                          <tr
                            role='button'
                            tabIndex={0}
                            className='select-none cursor-pointer'
                            style={{
                              border: '1px solid #546e7a',
                              backgroundColor: '#e3f2fd',
                            }}
                            onClick={() => {
                              // "Outros Tratamentos" — por agora não faz nada (placeholder).
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                ;(e.target as HTMLElement).click()
                              }
                            }}
                          >
                            <td className='w-[20%] text-center align-middle'>
                              <div className='flex justify-center'>
                                {/* eslint-disable-next-line react/no-danger */}
                                <span
                                  className='inline-flex items-center justify-center'
                                  style={{ width: 40, height: 44 }}
                                  dangerouslySetInnerHTML={{
                                    __html: ODONTOGRAMA_BUTTON_ICON_SVG_OUTROS_ESTADOS,
                                  }}
                                />
                              </div>
                            </td>
                            <td className='w-[85%] text-center font-bold text-[11px] text-gray-900 whitespace-nowrap'>
                              Mais Tratamentos
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className='h-[50px] w-full'>
                      <table className='w-full h-full'>
                        <tbody>
                          <tr
                            role='button'
                            tabIndex={0}
                            className='select-none cursor-pointer'
                            style={{
                              border: '1px solid #546e7a',
                              backgroundColor: REMOVE_SELECTION_ACTION.buttonBgColor ?? '#fce4ec',
                            }}
                            onClick={() => {
                              setCodigoEstadoPadrao('')
                              setCodigoTratamentoPadrao('')
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                ;(e.target as HTMLElement).click()
                              }
                            }}
                          >
                            <td className='w-[20%] text-center align-middle'>
                              <div className='flex justify-center'>
                                {/* eslint-disable-next-line react/no-danger */}
                                <span
                                  className='inline-flex items-center justify-center'
                                  style={{ width: 44, height: 44 }}
                                  dangerouslySetInnerHTML={{
                                    __html: ODONTOGRAMA_BUTTON_ICON_SVG_REMOVER_SELECAO,
                                  }}
                                />
                              </div>
                            </td>
                            <td className='w-[80%] text-center font-bold text-[11px] text-gray-900 whitespace-nowrap'>
                              {REMOVE_SELECTION_ACTION.label}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className='rounded-lg border bg-background p-3 text-sm'>
        <div className='mb-2 font-semibold'>Linhas de odontograma da consulta</div>

        {isLoading && (
          <div className='text-xs text-muted-foreground'>A carregar linhas de odontograma…</div>
        )}

        {!isLoading && (!linhas || linhas.length === 0) && (
          <div className='text-xs text-muted-foreground'>
            Sem linhas de odontograma registadas para esta consulta.
          </div>
        )}

        {!isLoading && linhas && linhas.length > 0 && (
          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead>
                <tr className='border-b text-left'>
                  <th className='px-2 py-1 w-32'>Cód. Estado/Tratamento</th>
                  <th className='px-2 py-1 w-16'>Dente</th>
                  <th className='px-2 py-1 w-20'>Dente Até</th>
                  <th className='px-2 py-1'>Descrição</th>
                  <th className='px-2 py-1 text-right w-24'>Opções</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr key={linha.id} className='border-b last:border-b-0'>
                    <td className='px-2 py-1'>
                      {linha.codigoEstadoPadrao ??
                        linha.codigoTratamentoPadrao ??
                        linha.codigoEstadoPersonalizado ??
                        linha.codigoTratamentoPersonalizado ??
                        '-'}
                    </td>
                    <td className='px-2 py-1'>{linha.numeroDente}</td>
                    <td className='px-2 py-1'>{linha.numeroDenteAte ?? '-'}</td>
                    <td className='px-2 py-1'>{linha.descricao}</td>
                    <td className='px-2 py-1 text-right'>
                      {canChange ? (
                        <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        title='Editar'
                        onClick={() => {
                          setEditLinha(linha)
                          setEditDescricao(linha.descricao ?? '')
                          setEditObservacoes(linha.observacoes ?? '')
                          setEditQuantidade(linha.quantidade ?? 1)
                          setEditFaturar(Boolean(linha.faturar))
                          setEditValorUnitario(linha.valorServico ?? 0)
                          setEditValorOrgPercent(linha.valorEntidade ?? 0)
                          setEditValorUtente(linha.valorUtente ?? 0)
                          setEditServicoNome(
                            linha.tiposTratamentoPadrao?.nomeServicoAssociado ?? '-',
                          )
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-destructive hover:text-destructive'
                        title='Remover'
                        onClick={() => {
                          void deleteLinhaMutation.mutateAsync(linha.id)
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EnhancedModal
        title='Estado/Tratamento Dentário'
        isOpen={!!editLinha}
        onClose={() => setEditLinha(null)}
        size='md'
      >
        {editLinha && (
          <div className='grid gap-3 text-sm'>
            {isEditTratamento ? (
              <>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='grid gap-1'>
                    <Label>Código</Label>
                    <Input
                      readOnly
                      value={editLinha.codigoTratamentoPadrao ?? editLinha.codigoEstadoPadrao ?? ''}
                      className='bg-muted'
                    />
                  </div>
                  <div className='grid gap-1'>
                  <Label>Descrição</Label>
                  <Input value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />
                </div>
                </div>

               

                <div className='grid grid-cols-4 gap-3'>
                  <div className='grid gap-1'>
                    <Label>Quantidade</Label>
                    <Input
                      type='number'
                      min={1}
                      value={editQuantidade}
                      onChange={(e) => setEditQuantidade(Math.max(1, Number(e.target.value || 1)))}
                    />
                  </div>
                  <div className='grid gap-1'>
                    <Label>Val. Unitário</Label>
                    <Input
                      type='number'
                      min={0}
                      step='0.01'
                      value={editValorUnitario}
                      onChange={(e) => setEditValorUnitario(Number(e.target.value || 0))}
                    />
                  </div>
                  <div className='grid gap-1'>
                    <Label>Val. Org. (%)</Label>
                    <Input
                      type='number'
                      min={0}
                      step='0.01'
                      value={editValorOrgPercent}
                      onChange={(e) => setEditValorOrgPercent(Number(e.target.value || 0))}
                    />
                  </div>
                  <div className='grid gap-1'>
                    <Label>Val. Utente (€)</Label>
                    <Input
                      type='number'
                      min={0}
                      step='0.01'
                      value={editValorUtente}
                      onChange={(e) => setEditValorUtente(Number(e.target.value || 0))}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-[auto,1fr,auto] items-end gap-3'>
                  <div className='grid gap-3'>
                    <Label>Faturar</Label>
                    <label className='flex items-center gap-2 text-xs mb-2'>
                      <input
                        type='checkbox'
                        checked={editFaturar}
                        onChange={(e) => setEditFaturar(e.target.checked)}
                      />
                      Faturar
                    </label>
                  </div>
                  <div className='grid gap-1'>
                    <Label>Serviço Associado</Label>
                    <Input readOnly value={editServicoNome} className='bg-muted' />
                  </div>
                  <div className='pb-0.5'>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setIsServicosModalOpen(true)
                        setSelectedSubsistemaId(null)
                      }}
                    >
                      Associar
                    </Button>
                  </div>
                </div>


                <div className='grid gap-1'>
                  <Label>Observações</Label>
                  <textarea
                    className='min-h-24 w-full rounded border bg-background px-2 py-1 text-sm'
                    value={editObservacoes}
                    onChange={(e) => setEditObservacoes(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='grid gap-1'>
                    <Label>Código</Label>
                    <Input
                      readOnly
                      value={editLinha.codigoEstadoPadrao ?? ''}
                      className='bg-muted'
                    />
                  </div>
                  <div className='grid gap-1'>
                    <Label>Descrição</Label>
                    <Input
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                    />
                  </div>
                </div>

                <div className='grid gap-1'>
                  <Label>Observações</Label>
                  <textarea
                    className='min-h-24 w-full rounded border bg-background px-2 py-1 text-sm'
                    value={editObservacoes}
                    onChange={(e) => setEditObservacoes(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className='flex justify-end gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => setEditLinha(null)}>
                Cancelar
              </Button>
              <Button
                type='button'
                onClick={async () => {
                  if (!editLinha) return
                  try {
                    await updateLinhaMutation.mutateAsync({
                      id: editLinha.id,
                      data: {
                        numeroDente: editLinha.numeroDente,
                        numeroDenteAte: editLinha.numeroDenteAte,
                        codigoSuperficie: editLinha.codigoSuperficie,
                        codigoEstadoPadrao: editLinha.codigoEstadoPadrao,
                        codigoTratamentoPadrao: editLinha.codigoTratamentoPadrao,
                        codigoEstadoPersonalizado: editLinha.codigoEstadoPersonalizado,
                        codigoTratamentoPersonalizado: editLinha.codigoTratamentoPersonalizado,
                        descricao: editDescricao,
                        observacoes: editObservacoes || null,
                        faturar: editFaturar,
                        quantidade: editQuantidade,
                        valorServico: editValorUnitario,
                        valorUtente: editValorUtente,
                        valorEntidade: editValorOrgPercent,
                        linhaFaturacaoId: editLinha.linhaFaturacaoId,
                      },
                    })
                    toast.success('Atualizado com sucesso.')
                    setEditLinha(null)
                  } catch {
                    toast.error('Erro ao atualizar.')
                  }
                }}
                disabled={!canChange || updateLinhaMutation.isPending}
              >
                OK
              </Button>
            </div>
          </div>
        )}
      </EnhancedModal>

      <EnhancedModal
        title='Subsistemas de Serviços'
        isOpen={isServicosModalOpen}
        onClose={() => setIsServicosModalOpen(false)}
        size='lg'
      >
        <div className='grid gap-3 text-sm'>
          <div className='grid gap-1'>
            <Label>Pesquisar serviço / subsistema</Label>
            <Input
              className='h-8 text-xs'
              value={servicoSearchModal}
              onChange={(e) => {
                setServicoSearchModal(e.target.value)
                setSelectedSubsistemaId(null)
              }}
              placeholder='Introduza o nome do serviço ou código de subsistema...'
            />
          </div>

          <div className='overflow-x-auto rounded-md border bg-muted/30'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-8 text-center'>
                    <Checkbox
                      className='h-3 w-3'
                      checked={Boolean(
                        selectedSubsistemaId &&
                          subsistemasFiltered.some((s) => s.id === selectedSubsistemaId),
                      )}
                      onCheckedChange={(checked) => {
                        if (!checked) setSelectedSubsistemaId(null)
                      }}
                    />
                  </TableHead>
                  <TableHead className='text-start'>Serviço</TableHead>
                  <TableHead className='text-center'>Val. Serv. (EUR)</TableHead>
                  <TableHead className='text-center'>Val. Org. (EUR)</TableHead>
                  <TableHead className='text-center'>Val. Utente (EUR)</TableHead>
                  <TableHead className='text-center'>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subsistemasFiltered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='py-4 text-center text-[11px] text-muted-foreground'
                    >
                      Não existem subsistemas de serviços para os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  subsistemasFiltered.map((s) => {
                    const serv = servicosMap.get(s.servicoId)
                    const checked = selectedSubsistemaId === s.id
                    return (
                      <TableRow
                        key={s.id}
                        className='cursor-pointer hover:bg-muted/60'
                        onClick={() => {
                          setSelectedSubsistemaId((prev) => (prev === s.id ? null : s.id))
                        }}
                      >
                        <TableCell className='text-center'>
                          <Checkbox
                            className='h-3 w-3'
                            checked={checked}
                            onCheckedChange={(value) => {
                              const isChecked = value === true
                              setSelectedSubsistemaId(isChecked ? s.id : null)
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>{serv?.designacao ?? '-'}</TableCell>
                        <TableCell className='text-center'>
                          {s.valorServico.toFixed(2)}
                        </TableCell>
                        <TableCell className='text-center'>
                          {s.valorOrganismo.toFixed(2)}
                        </TableCell>
                        <TableCell className='text-center'>
                          {s.valorUtente.toFixed(2)}
                        </TableCell>
                        <TableCell className='text-center'>
                          {s.inativo ? 'Inativo' : 'Ativo'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={!canAdd}
                onClick={() => setSubsistemaCrudOpen(true)}
              >
                Novo subsistema
              </Button>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsServicosModalOpen(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type='button'
                  size='sm'
                  disabled={!canChange || !selectedSubsistemaId}
                  onClick={() => {
                    if (!selectedSubsistemaId) return
                    const selecionado = subsistemasAll.find((s) => s.id === selectedSubsistemaId)
                    if (!selecionado) {
                      toast.error('Subsistema de serviço inválido.')
                      return
                    }
                    const serv = servicosMap.get(selecionado.servicoId)
                    setEditServicoNome(serv?.designacao ?? selecionado.servicoId)
                    setEditValorUnitario(selecionado.valorServico)
                    setEditValorOrgPercent(selecionado.valorOrganismo)
                    setEditValorUtente(selecionado.valorUtente)
                    setIsServicosModalOpen(false)
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      </EnhancedModal>

      <SubsistemaServicoViewCreateModal
        open={subsistemaCrudOpen}
        onOpenChange={(openModal: boolean) => {
          setSubsistemaCrudOpen(openModal)
          if (!openModal) {
            void queryClient.invalidateQueries({ queryKey: ['subsistemas-servicos-odontograma'] })
          }
        }}
        mode='create'
        viewData={null}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['subsistemas-servicos-odontograma'] })
        }}
      />

      <EnhancedModal
        title='Adicionar Estado/Tratamento'
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        size='md'
      >
        <div className='grid gap-3 text-sm'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1'>
              <Label>Tipo</Label>
              <select
                className='w-full rounded border bg-background px-2 py-1 text-sm'
                value={addKind}
                onChange={(e) => setAddKind(e.target.value as 'estado' | 'tratamento')}
              >
                <option value='estado'>Estado</option>
                <option value='tratamento'>Tratamento</option>
              </select>
            </div>
            <div className='grid gap-1'>
              <Label>Código</Label>
              <Input value={addCodigo} onChange={(e) => setAddCodigo(e.target.value)} />
            </div>
          </div>

          <div className='grid gap-1'>
            <Label>Descrição</Label>
            <Input value={addDescricao} onChange={(e) => setAddDescricao(e.target.value)} />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <label className='flex items-center gap-2 text-xs'>
              <input type='checkbox' checked={addAtivo} onChange={(e) => setAddAtivo(e.target.checked)} />
              Ativo
            </label>

            {addKind === 'estado' ? (
              <label className='flex items-center gap-2 text-xs'>
                <input
                  type='checkbox'
                  checked={addEstadoPadrao}
                  onChange={(e) => setAddEstadoPadrao(e.target.checked)}
                />
                Estado padrão
              </label>
            ) : (
              <label className='flex items-center gap-2 text-xs'>
                <input
                  type='checkbox'
                  checked={addFaturavel}
                  onChange={(e) => setAddFaturavel(e.target.checked)}
                />
                Faturável
              </label>
            )}
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button
              type='button'
              disabled={
                !(canAdd || canChange) ||
                createEstadoMutation.isPending ||
                createTratMutation.isPending
              }
              onClick={async () => {
                try {
                  if (!addCodigo.trim() || !addDescricao.trim()) {
                    toast.error('Código e descrição são obrigatórios.')
                    return
                  }
                  if (addKind === 'estado') {
                    await createEstadoMutation.mutateAsync({
                      codigo: addCodigo.trim(),
                      descricao: addDescricao.trim(),
                      estadoPadrao: addEstadoPadrao,
                      ativo: addAtivo,
                    })
                  } else {
                    await createTratMutation.mutateAsync({
                      codigo: addCodigo.trim(),
                      descricao: addDescricao.trim(),
                      faturavel: addFaturavel,
                      codigoServicoAssociado: null,
                      nomeServicoAssociado: null,
                      ativo: addAtivo,
                    })
                  }
                  toast.success('Criado com sucesso.')
                  setAddOpen(false)
                  setAddCodigo('')
                  setAddDescricao('')
                } catch {
                  toast.error('Erro ao criar.')
                }
              }}
            >
              Guardar
            </Button>
          </div>
        </div>
      </EnhancedModal>

    </div>
  )
}


