import { ProvenienciaUtenteClient } from './proveniencia-utente-client'

export const ProvenienciaUtenteService = (idFuncionalidade = '') =>
  new ProvenienciaUtenteClient(idFuncionalidade)
export * from './proveniencia-utente-errors'
export * from './proveniencia-utente-client'
