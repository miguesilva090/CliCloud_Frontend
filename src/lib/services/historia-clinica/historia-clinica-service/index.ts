import { HistoriaClinicaClient } from './historia-clinica-client'

export const HistoriaClinicaService = (idFuncionalidade = '') =>
  new HistoriaClinicaClient(idFuncionalidade)
export * from './historia-clinica-errors'
export * from './historia-clinica-client'
