import { UtentesRnuClient } from './utente-rnu-client'

export const UtentesRnuService = (idFuncionalidade: string) =>
    new UtentesRnuClient(idFuncionalidade)

