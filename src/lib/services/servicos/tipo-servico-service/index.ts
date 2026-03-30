import { TipoServicoClient } from './tipo-servico-client'

export const TipoServicoService = (idFuncionalidade = '') =>
  new TipoServicoClient(idFuncionalidade)

