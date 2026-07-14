import { FichaClinicaSecoesClient } from './ficha-clinica-secoes-client'

export function FichaClinicaSecoesService() {
  return new FichaClinicaSecoesClient('PClinico_FichaClinicaSecoes')
}
export * from './ficha-clinica-secoes-errors'
export * from './ficha-clinica-secoes-client'
