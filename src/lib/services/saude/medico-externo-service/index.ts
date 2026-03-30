import { MedicoExternoClient } from './medico-externo-client'

export const MedicoExternoService = (idFuncionalidade = '') =>
  new MedicoExternoClient(idFuncionalidade)
