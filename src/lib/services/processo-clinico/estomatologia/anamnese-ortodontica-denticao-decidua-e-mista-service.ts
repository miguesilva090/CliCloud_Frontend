import { AnamneseOrtodonticaDenticaoDeciduaeMistaClient } from './anamnese-ortodontica-denticao-decidua-e-mista-client'

export const AnamneseOrtodonticaDenticaoDeciduaeMistaService = (
    idFuncionalidade = 'PClinico-Estomatologia',
) => new AnamneseOrtodonticaDenticaoDeciduaeMistaClient(idFuncionalidade)