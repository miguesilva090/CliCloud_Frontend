import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  AnamneseOrtodonticaAnaliseGeralDTO,
  CreateAnamneseOrtodonticaAnaliseGeralRequest,
  UpdateAnamneseOrtodonticaAnaliseGeralRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-geral.dtos'

const BASE = '/client/processo-clinico/AnamneseOrtodonticaAnaliseGeral'

export class AnamneseOrtodonticaAnaliseGeralClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string,
  ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaAnaliseGeralDTO | null>>> {
    return this.httpClient.getRequest<
      GSResponse<AnamneseOrtodonticaAnaliseGeralDTO | null>
    >(state.URL, `${BASE}/utente/${utenteId}`)
  }

  async getById(
    id: string,
  ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaAnaliseGeralDTO>>> {
    return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaAnaliseGeralDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async create(
    body: CreateAnamneseOrtodonticaAnaliseGeralRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateAnamneseOrtodonticaAnaliseGeralRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateAnamneseOrtodonticaAnaliseGeralRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateAnamneseOrtodonticaAnaliseGeralRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

