import { AnamneseOrtodonticaAnaliseDentariaClient } from './anamnese-ortodontica-analise-dentaria-client'

export const AnamneseOrtodonticaAnaliseDentariaService = (idFuncionalidade = 'PClinico-Estomatologia',) =>
  new AnamneseOrtodonticaAnaliseDentariaClient(idFuncionalidade)

export * from './anamnese-ortodontica-analise-dentaria-client'
export * from './anamnese-ortodontica-analise-dentaria-errors'
