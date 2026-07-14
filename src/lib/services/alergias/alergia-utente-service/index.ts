import { AlergiaUtenteClient } from './alergia-utente-client'

export const AlergiaUtenteService = (idFuncionalidade = '') =>
  new AlergiaUtenteClient(idFuncionalidade)
export * from './alergia-utente-errors'
export * from './alergia-utente-client'
