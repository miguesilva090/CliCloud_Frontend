import { HistoriaClinicaClient } from './historia-clinica-client'

export const HistoriaClinicaService = (idFuncionalidade = '') =>
  new HistoriaClinicaClient(idFuncionalidade)

