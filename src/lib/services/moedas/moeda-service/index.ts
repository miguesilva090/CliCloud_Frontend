import { MoedaClient } from './moeda-client'

export const MoedaService = (idFuncionalidade = '') =>
  new MoedaClient(idFuncionalidade)
