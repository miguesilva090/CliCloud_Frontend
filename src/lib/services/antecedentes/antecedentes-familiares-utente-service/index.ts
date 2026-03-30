import { AntecedentesFamiliaresUtenteClient } from './antecedentes-familiares-utente-client'

export const AntecedentesFamiliaresUtenteService = (idFuncionalidade = '') =>
  new AntecedentesFamiliaresUtenteClient(idFuncionalidade)

