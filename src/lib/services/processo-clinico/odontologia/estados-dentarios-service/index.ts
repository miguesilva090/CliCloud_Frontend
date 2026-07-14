import { EstadosDentariosClient } from './estados-dentarios-client'

export const EstadosDentariosService = (idFuncionalidade = 'PClinico-Odontologia',) =>
  new EstadosDentariosClient(idFuncionalidade)

export * from './estados-dentarios-client'
export * from './estados-dentarios-errors'
