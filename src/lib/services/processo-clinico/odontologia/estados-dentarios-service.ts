import { EstadosDentariosClient } from './estados-dentarios-client'

export const EstadosDentariosService = (
  idFuncionalidade = 'PClinico-Odontologia',
) => new EstadosDentariosClient(idFuncionalidade)

