import { AnamneseOrtodonticaAnaliseGeralClient } from './anamnese-ortodontica-analise-geral-client'

export const AnamneseOrtodonticaAnaliseGeralService = (idFuncionalidade = 'PClinico-Estomatologia',) =>
  new AnamneseOrtodonticaAnaliseGeralClient(idFuncionalidade)

export * from './anamnese-ortodontica-analise-geral-client'
export * from './anamnese-ortodontica-analise-geral-errors'
