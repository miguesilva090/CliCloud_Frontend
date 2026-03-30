import { AnamneseOrtodonticaAnaliseDentariaClient } from './anamnese-ortodontica-analise-dentaria-client'

export const AnamneseOrtodonticaAnaliseDentariaService = (
  idFuncionalidade = 'PClinico-Estomatologia',
) => new AnamneseOrtodonticaAnaliseDentariaClient(idFuncionalidade)

