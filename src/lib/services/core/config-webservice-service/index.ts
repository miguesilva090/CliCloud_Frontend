import { ConfigWebServiceClient } from './config-webservice-client'

export const ConfigWebServiceService = (idFuncionalidade = '') =>
  new ConfigWebServiceClient(idFuncionalidade)
export * from './config-webservice-errors'
export * from './config-webservice-client'
