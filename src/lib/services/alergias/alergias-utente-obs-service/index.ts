import { AlergiasUtenteObsClient } from './alergias-utente-obs-client'

export function AlergiasUtenteObsService(idFuncionalidade: string) {
  return new AlergiasUtenteObsClient(idFuncionalidade)
}
export * from './alergias-utente-obs-errors'
export * from './alergias-utente-obs-client'
