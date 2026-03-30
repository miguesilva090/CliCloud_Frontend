import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { AlergiasUtenteObsDTO } from '@/types/dtos/alergias/alergias-utente-obs.dtos'

const BASE = '/client/alergias/AlergiasUtenteObs'

export class AlergiasUtenteObsClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtenteId(utenteId: string): Promise<ResponseApi<AlergiasUtenteObsDTO | null>> {
    return this.httpClient.getRequest<AlergiasUtenteObsDTO | null>(
      state.URL,
      `${BASE}/by-utente/${utenteId}`,
    )
  }
}

