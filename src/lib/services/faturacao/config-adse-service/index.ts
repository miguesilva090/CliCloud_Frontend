import { ConfigAdseClient } from './config-adse-client'

export const ConfigAdseService = (idFuncionalidade = '') =>
  new ConfigAdseClient(idFuncionalidade)
