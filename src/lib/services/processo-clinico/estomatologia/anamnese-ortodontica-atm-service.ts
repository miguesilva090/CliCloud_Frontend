import { AnamneseOrtodonticaATMClient } from './anamnese-ortodontica-atm-client'

export const AnamneseOrtodonticaATMService = (
  idFuncionalidade = 'PClinico-Estomatologia',
) => new AnamneseOrtodonticaATMClient(idFuncionalidade)

