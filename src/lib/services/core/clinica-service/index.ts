import { ClinicaClient } from './clinica-client'

export const ClinicaService = (idFuncionalidade = '') =>
  new ClinicaClient(idFuncionalidade)

export * from './clinica-client'

