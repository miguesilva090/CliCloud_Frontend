import { TeleconsultaConfigClient } from './teleconsulta-config-client'

export const TeleconsultaConfigService = (idFuncionalidade = '') =>
  new TeleconsultaConfigClient(idFuncionalidade)
