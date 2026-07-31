import {
  tratamentosAuxiliaresRoutes,
  tratamentosFisioterapeutasRoutes,
  tratamentosTerapeutasOcupRoutes,
} from '@/config/entity-routes'

/** Papéis de técnico em tratamentos (paridade legado TERAPEUTA / AUXILIAR / TERAPEUTAOCUP). */
export const TIPO_TECNICO = {
  Fisioterapeuta: 1,
  Auxiliar: 2,
  Outro: 3,
} as const

export type TipoTecnicoValue =
  (typeof TIPO_TECNICO)[keyof typeof TIPO_TECNICO]

export const TIPO_TECNICO_LABELS: Record<TipoTecnicoValue, string> = {
  [TIPO_TECNICO.Fisioterapeuta]: 'Fisioterapeuta',
  [TIPO_TECNICO.Auxiliar]: 'Auxiliar',
  [TIPO_TECNICO.Outro]: 'Terapeuta Ocupacional/Fala',
}

export function isTipoTecnicoValue(value: unknown): value is TipoTecnicoValue {
  return (
    value === TIPO_TECNICO.Fisioterapeuta ||
    value === TIPO_TECNICO.Auxiliar ||
    value === TIPO_TECNICO.Outro
  )
}

/** UI sticky por rota de tratamentos (mesmo CRUD Tecnico; não é entidade de domínio). */
export type TratamentosTecnicoSticky = {
  tipoTecnico: TipoTecnicoValue
  entityLabel: string
  pageTitle: string
}

export function getTratamentosTecnicoStickyFromListagem(
  listagemPath: string
): TratamentosTecnicoSticky | null {
  if (listagemPath === tratamentosFisioterapeutasRoutes.listagem) {
    return {
      tipoTecnico: TIPO_TECNICO.Fisioterapeuta,
      entityLabel: 'Fisioterapeuta',
      pageTitle: 'Fisioterapeutas',
    }
  }
  if (listagemPath === tratamentosAuxiliaresRoutes.listagem) {
    return {
      tipoTecnico: TIPO_TECNICO.Auxiliar,
      entityLabel: 'Técnico Auxiliar',
      pageTitle: 'Técnicos Auxiliares',
    }
  }
  if (listagemPath === tratamentosTerapeutasOcupRoutes.listagem) {
    return {
      tipoTecnico: TIPO_TECNICO.Outro,
      entityLabel: 'Terapeuta Ocupacional/Fala',
      pageTitle: 'Terapeutas Fala/Ocupacionais',
    }
  }
  return null
}
