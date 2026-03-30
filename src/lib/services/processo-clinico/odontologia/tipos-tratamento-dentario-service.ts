import { TiposTratamentoDentarioClient } from './tipos-tratamento-dentario-client'

export const TiposTratamentoDentarioService = (
  idFuncionalidade = 'PClinico-Odontologia',
) => new TiposTratamentoDentarioClient(idFuncionalidade)
