import { AnamneseOrtodonticaAnaliseFuncionalClient } from './anamnese-ortodontica-analise-funcional-client'

export const AnamneseOrtodonticaAnaliseFuncionalService = (idFuncionalidade = 'PClinico-Estomatologia',) =>
  new AnamneseOrtodonticaAnaliseFuncionalClient(idFuncionalidade)

export * from './anamnese-ortodontica-analise-funcional-client'
export * from './anamnese-ortodontica-analise-funcional-errors'
