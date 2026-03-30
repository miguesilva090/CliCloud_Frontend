import { ProvenienciaUtenteClient } from './proveniencia-utente-client'

export const ProvenienciaUtenteService = (idFuncionalidade = '') =>
  new ProvenienciaUtenteClient(idFuncionalidade)
