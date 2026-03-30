import { AnamneseOrtodonticaAnaliseFuncionalClient } from './anamnese-ortodontica-analise-funcional-client'

export const AnamneseOrtodonticaAnaliseFuncionalService = (
    idFuncionalidade = 'PClinico-Estomatologia',
) => new AnamneseOrtodonticaAnaliseFuncionalClient(idFuncionalidade)