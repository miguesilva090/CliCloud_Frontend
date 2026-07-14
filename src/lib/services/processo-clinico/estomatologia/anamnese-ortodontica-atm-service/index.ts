import { AnamneseOrtodonticaATMClient } from './anamnese-ortodontica-atm-client'

export const AnamneseOrtodonticaATMService = (idFuncionalidade = 'PClinico-Estomatologia',) =>
  new AnamneseOrtodonticaATMClient(idFuncionalidade)

export * from './anamnese-ortodontica-atm-client'
export * from './anamnese-ortodontica-atm-errors'
