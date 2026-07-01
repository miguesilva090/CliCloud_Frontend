import type { ComunicacaoFaturasTipoPreFatura } from '@/types/dtos/faturacao/comunicacao-faturas.dtos'

export type ComunicacaoFaturasTipoConfig = {
  pageTitle: string
  incluirColunaRelatorio: boolean
  /** Valores mock até existir API — espelham o legado por tipo. */
  preFaturasMock: string[]
  numeroPreFaturaInicial: string
}

export const COMUNICACAO_FATURAS_TIPO_CONFIG: Record<
  ComunicacaoFaturasTipoPreFatura,
  ComunicacaoFaturasTipoConfig
> = {
  CA: {
    pageTitle: 'Comunicação Faturas - Consultas',
    incluirColunaRelatorio: true,
    preFaturasMock: [],
    numeroPreFaturaInicial: '',
  },
  TA: {
    pageTitle: 'Comunicação Faturas - Tratamentos',
    incluirColunaRelatorio: false,
    preFaturasMock: ['TA2'],
    numeroPreFaturaInicial: 'TA2',
  },
  EX: {
    pageTitle: 'Comunicação Faturas - Exames',
    incluirColunaRelatorio: false,
    preFaturasMock: [],
    numeroPreFaturaInicial: '',
  },
}

export function toPreFaturasOpcoes(
  valores: string[]
): Array<{ value: string; label: string }> {
  return valores.map((value) => ({ value, label: value }))
}
