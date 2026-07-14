import { MedicoExternoClient } from './medico-externo-client'

export const MedicoExternoService = (idFuncionalidade = '') =>
  new MedicoExternoClient(idFuncionalidade)
export * from './medico-externo-errors'
export * from './medico-externo-client'
