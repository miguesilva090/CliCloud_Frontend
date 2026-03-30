import { AlergiasUtenteObsClient } from './alergias-utente-obs-client'

export function AlergiasUtenteObsService(idFuncionalidade: string) {
  return new AlergiasUtenteObsClient(idFuncionalidade)
}

