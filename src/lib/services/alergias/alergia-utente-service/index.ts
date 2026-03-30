import { AlergiaUtenteClient } from './alergia-utente-client'

export const AlergiaUtenteService = (idFuncionalidade = '') =>
  new AlergiaUtenteClient(idFuncionalidade)
