import { AdseClient } from './adse-client'
import { AdseComunicacaoClient } from './adse-comunicacao-client'

export const AdseService = (idFuncionalidade = '') => new AdseClient(idFuncionalidade)
export const AdseComunicacaoService = (idFuncionalidade = '') =>
  new AdseComunicacaoClient(idFuncionalidade)
