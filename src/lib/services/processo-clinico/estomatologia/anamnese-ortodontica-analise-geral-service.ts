import { AnamneseOrtodonticaAnaliseGeralClient } from './anamnese-ortodontica-analise-geral-client'

export const AnamneseOrtodonticaAnaliseGeralService = (
  idFuncionalidade = 'PClinico-Estomatologia',
) => new AnamneseOrtodonticaAnaliseGeralClient(idFuncionalidade)

