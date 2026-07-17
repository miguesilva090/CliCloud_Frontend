import { UtentePatologiaComparticipacaoClient } from './utente-patologia-comparticipacao-client'

export const UtentePatologiaComparticipacaoService = (idFuncionalidade = '') => 
    new UtentePatologiaComparticipacaoClient(idFuncionalidade)

export * from './utente-patologia-comparticipacao-client'