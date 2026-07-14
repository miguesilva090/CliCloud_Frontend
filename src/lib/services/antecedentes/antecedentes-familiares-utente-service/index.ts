import { AntecedentesFamiliaresUtenteClient } from './antecedentes-familiares-utente-client'

export const AntecedentesFamiliaresUtenteService = (idFuncionalidade = '') =>
  new AntecedentesFamiliaresUtenteClient(idFuncionalidade)
export * from './antecedentes-familiares-utente-errors'
export * from './antecedentes-familiares-utente-client'
