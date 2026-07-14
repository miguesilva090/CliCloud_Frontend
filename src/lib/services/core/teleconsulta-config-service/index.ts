import { TeleconsultaConfigClient } from './teleconsulta-config-client'

export const TeleconsultaConfigService = (idFuncionalidade = '') =>
  new TeleconsultaConfigClient(idFuncionalidade)
export * from './teleconsulta-config-errors'
export * from './teleconsulta-config-client'
