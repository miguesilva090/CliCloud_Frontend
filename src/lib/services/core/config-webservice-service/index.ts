import { ConfigWebServiceClient } from './config-webservice-client'

export const ConfigWebServiceService = (idFuncionalidade = '') =>
  new ConfigWebServiceClient(idFuncionalidade)
