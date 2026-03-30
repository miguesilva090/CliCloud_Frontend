import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  AnamneseOrtodonticaAnaliseDentariaDTO,
  CreateAnamneseOrtodonticaAnaliseDentariaRequest,
  UpdateAnamneseOrtodonticaAnaliseDentariaRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-dentaria.dtos'

const BASE = '/client/processo-clinico/AnamneseOrtodonticaAnaliseDentaria'

export class AnamneseOrtodonticaAnaliseDentariaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string,
  ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaAnaliseDentariaDTO | null>>> {
    return this.httpClient.getRequest<
      GSResponse<AnamneseOrtodonticaAnaliseDentariaDTO | null>
    >(state.URL, `${BASE}/utente/${utenteId}`)
  }

  async getById(
    id: string,
  ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaAnaliseDentariaDTO>>> {
    return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaAnaliseDentariaDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async create(
    body: CreateAnamneseOrtodonticaAnaliseDentariaRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateAnamneseOrtodonticaAnaliseDentariaRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateAnamneseOrtodonticaAnaliseDentariaRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateAnamneseOrtodonticaAnaliseDentariaRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

