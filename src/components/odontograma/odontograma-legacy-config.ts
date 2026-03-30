import type { LucideIcon } from 'lucide-react'
import {
  CircleDot,
  Droplet,
  Brush,
  ShieldCheck,
  Crown,
  Braces,
  Sparkles,
  Scissors,
  ArrowLeftRight,
  Replace,
  Ribbon,
  Construction,
  Activity,
  X,
} from 'lucide-react'
import {
  ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_YELLOW,
  ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_BLUE,
  ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_GREEN,
  ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_PURPLE,
  ODONTOGRAMA_BUTTON_ICON_SVG_EXTRACAO,
  ODONTOGRAMA_BUTTON_ICON_SVG_GENGIVETOMIA,
  ODONTOGRAMA_BUTTON_ICON_SVG_IMPLANTE,
  ODONTOGRAMA_BUTTON_ICON_SVG_ORTODONTIA,
  ODONTOGRAMA_BUTTON_ICON_SVG_FISTULA,
  ODONTOGRAMA_BUTTON_ICON_SVG_FRATURA,
  ODONTOGRAMA_BUTTON_ICON_SVG_BOLSA_PERIODONTAL,
  ODONTOGRAMA_BUTTON_ICON_SVG_CARIE,
  ODONTOGRAMA_BUTTON_ICON_SVG_RESTAURACAO,
  ODONTOGRAMA_BUTTON_ICON_SVG_SELANTE_FISSURAS,
  ODONTOGRAMA_BUTTON_ICON_SVG_PONTE,
  ODONTOGRAMA_BUTTON_ICON_SVG_ENDODONTIA,
  ODONTOGRAMA_BUTTON_ICON_SVG_BRANQUEAMENTO,
} from './odontograma-button-icon'

export type OdontogramaApplyTarget = 'wheel' | 'toothZones' | 'toothAll' | 'cellBackground'

export type OdontogramaToothPart = 'coroaDente' | 'raizDente' | 'fundoDente'

export type OdontogramaOverlayKind = 'fistula' | 'fratura' | 'ortodontia' | 'ponte'

export type OdontogramaToothRenderKind = 'implant'

export type OdontogramaActionConfig = {
  code: string
  label: string
  kind: 'estado' | 'tratamento'
  group?: 'dente' | 'gengiva'
  color: string
  /** Cor de fundo do botão no painel (igual ao legado NovaAtendimentoUtenteEdt.aspx) */
  buttonBgColor?: string
  /** SVG (string) para o ícone do botão (quando queremos replicar o legado por item). */
  buttonIconSvg?: string
  /** Se true, não pinta o dente; só desenha overlay (ex.: fístula/fratura). */
  overlayOnly?: boolean
  applyTargets: OdontogramaApplyTarget[]
  // Quando um item aplica-se ao dente inteiro, o legado pode pintar coroa/raiz e também o “fundo” com cor diferente.
  toothPartColors?: Partial<Record<OdontogramaToothPart, string>>
  // Alguns itens do legado desenham um “overlay” por cima do dente (ex.: fístula/fratura/ortodontia).
  overlay?: { kind: OdontogramaOverlayKind; color: string }
  // Alguns tratamentos substituem o SVG do dente (ex.: implante).
  toothRender?: { kind: OdontogramaToothRenderKind }
  icon: LucideIcon
}

// Config inspirado no legado (OdontogramaDefinitivos.js) — aqui centralizamos cor e alvo.
// Nota: o legado distingue “roda” vs “coroa/raiz” via handlers separados.
export const ODONTOGRAMA_LEGACY_ACTIONS: OdontogramaActionConfig[] = [
  // Estados (ordem igual ao legado: tabelaEstadosDentarios)
  {
    code: 'E1',
    label: 'Dente Ausente',
    kind: 'estado',
    color: '#000000',
    buttonBgColor: '#E0E0E0',
    applyTargets: ['toothAll'],
    toothPartColors: { coroaDente: '#000000', raizDente: '#000000', fundoDente: '#000000' },
    icon: CircleDot,
  },
  {
    code: 'E2',
    label: 'Alteração de Cor',
    kind: 'estado',
    color: '#fff176',
    buttonBgColor: '#fff9c4',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_YELLOW,
    applyTargets: ['toothZones'],
    icon: Sparkles,
  },
  {
    code: 'E3',
    label: 'Fístula',
    kind: 'estado',
    color: '#ef4444',
    buttonBgColor: '#ffcdd2',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_FISTULA,
    overlayOnly: true,
    applyTargets: ['toothAll'],
    overlay: { kind: 'fistula', color: '#ef4444' },
    icon: Droplet,
  },
  {
    code: 'E4',
    label: 'Fraturação',
    kind: 'estado',
    color: '#ef4444',
    buttonBgColor: '#f8bbd0',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_FRATURA,
    overlayOnly: true,
    applyTargets: ['toothAll'],
    overlay: { kind: 'fratura', color: '#ef4444' },
    icon: CircleDot,
  },
  {
    code: 'E5',
    label: 'Bolsa Periodontal',
    kind: 'estado',
    color: '#388e3c',
    buttonBgColor: '#dcedc8',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_BOLSA_PERIODONTAL,
    applyTargets: ['wheel'],
    icon: Droplet,
  },
  {
    code: 'E6',
    label: 'Cárie',
    kind: 'estado',
    color: '#795548',
    buttonBgColor: '#d7ccc8',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_CARIE,
    applyTargets: ['wheel'],
    icon: CircleDot,
  },

  // Tratamentos (ordem igual ao legado: tabelaTratamentosDentarios)
  {
    code: 'T1',
    label: 'Coroa',
    kind: 'tratamento',
    color: '#85c9ea',
    buttonBgColor: '#e3f2fd',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_BLUE,
    applyTargets: ['toothZones'],
    icon: Crown,
  },
  {
    code: 'T2',
    label: 'Restauração',
    kind: 'tratamento',
    color: '#fa5722',
    buttonBgColor: '#ffccbc',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_RESTAURACAO,
    applyTargets: ['wheel'],
    icon: Brush,
  },
  {
    code: 'T3',
    label: 'Implante',
    kind: 'tratamento',
    group: 'dente',
    color: '#000000',
    buttonBgColor: '#E0E0E0',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_IMPLANTE,
    applyTargets: ['toothAll'],
    toothRender: { kind: 'implant' },
    icon: Replace,
  },
  {
    code: 'T4',
    label: 'Ortodontia',
    kind: 'tratamento',
    color: '#ff49e0',
    buttonBgColor: '#f3e5f5',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_ORTODONTIA,
    overlayOnly: true,
    applyTargets: ['toothAll'],
    overlay: { kind: 'ortodontia', color: '#ff49e0' },
    icon: Braces,
  },
  {
    code: 'T5',
    label: 'Limpeza Oral',
    kind: 'tratamento',
    color: '#81c784',
    buttonBgColor: '#c8e6c9',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_GREEN,
    applyTargets: ['toothZones'],
    icon: Sparkles,
  },
  {
    code: 'T6',
    label: 'Extração',
    kind: 'tratamento',
    color: '#808080',
    buttonBgColor: '#E0E0E0',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_EXTRACAO,
    applyTargets: ['toothAll'],
    toothPartColors: { coroaDente: '#808080', raizDente: '#808080', fundoDente: '#550000' },
    icon: Scissors,
  },
  {
    code: 'T7',
    label: 'Selante Fissuras',
    kind: 'tratamento',
    color: '#000000',
    buttonBgColor: '#ffffff',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_SELANTE_FISSURAS,
    applyTargets: ['wheel'],
    icon: ShieldCheck,
  },
  {
    code: 'T8',
    label: 'Destartarização',
    kind: 'tratamento',
    color: '#ce93d8',
    buttonBgColor: '#d1c4e9',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_PURPLE,
    applyTargets: ['toothZones'],
    icon: Ribbon,
  },
  {
    code: 'T9',
    label: 'Gengivetomia',
    kind: 'tratamento',
    group: 'gengiva',
    color: '#f48fb1',
    buttonBgColor: '#ffffff',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_GENGIVETOMIA,
    applyTargets: ['cellBackground', 'toothZones'],
    icon: Activity,
  },
  {
    code: 'T10',
    label: 'Ponte',
    kind: 'tratamento',
    group: 'dente',
    color: '#ffee58',
    buttonBgColor: '#f0f4c3',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_PONTE,
    applyTargets: ['toothAll'],
    overlayOnly: true,
    overlay: { kind: 'ponte', color: '#ffee58' },
    icon: ArrowLeftRight,
  },
  {
    code: 'T11',
    label: 'Desvitalização',
    kind: 'tratamento',
    group: 'dente',
    color: '#ba68c8',
    buttonBgColor: '#e1bee7',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_ENDODONTIA,
    applyTargets: ['toothZones'],
    icon: Construction,
  },
  {
    code: 'T12',
    label: 'Branqueamento',
    kind: 'tratamento',
    group: 'dente',
    color: '#ffffff',
    buttonBgColor: '#ffcdd2',
    buttonIconSvg: ODONTOGRAMA_BUTTON_ICON_SVG_BRANQUEAMENTO,
    applyTargets: ['toothAll'],
    icon: Sparkles,
  },
]

export const REMOVE_SELECTION_ACTION: OdontogramaActionConfig = {
  code: 'REMOVE',
  label: 'Remover Seleção',
  kind: 'tratamento',
  color: '#ef4444',
  buttonBgColor: '#fce4ec',
  applyTargets: ['wheel', 'toothZones', 'toothAll'],
  icon: X,
}

export function findLegacyAction(code: string | null | undefined): OdontogramaActionConfig | undefined {
  if (!code) return undefined
  return ODONTOGRAMA_LEGACY_ACTIONS.find((a) => a.code === code)
}

