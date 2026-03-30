import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  AnamneseOrtodonticaATMDTO,
  CreateAnamneseOrtodonticaATMRequest,
  UpdateAnamneseOrtodonticaATMRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-atm.dtos'

const BASE = '/client/processo-clinico/AnamneseOrtodonticaATM'

export class AnamneseOrtodonticaATMClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string,
  ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaATMDTO | null>>> {
    return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaATMDTO | null>>(
      state.URL,
      `${BASE}/utente/${utenteId}`,
    )
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaATMDTO>>> {
    return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaATMDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async create(
    body: CreateAnamneseOrtodonticaATMRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateAnamneseOrtodonticaATMRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateAnamneseOrtodonticaATMRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateAnamneseOrtodonticaATMRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}

