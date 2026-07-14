import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  AnamneseOdontopediatriaDTO,
  CreateAnamneseOdontopediatriaRequest,
  UpdateAnamneseOdontopediatriaRequest,
} from '@/types/dtos/saude/anamnese-odontopediatria.dtos'

const BASE = '/client/processo-clinico/AnamneseOdontopediatria'

export class AnamneseOdontopediatriaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string,
  ): Promise<ResponseApi<GSResponse<AnamneseOdontopediatriaDTO | null>>> {
    return this.httpClient.getRequest<GSResponse<AnamneseOdontopediatriaDTO | null>>(
      state.URL,
      `${BASE}/utente/${utenteId}`,
    )
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<AnamneseOdontopediatriaDTO>>> {
    return this.httpClient.getRequest<GSResponse<AnamneseOdontopediatriaDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async create(
    body: CreateAnamneseOdontopediatriaRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateAnamneseOdontopediatriaRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async update(
    id: string,
    body: UpdateAnamneseOdontopediatriaRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateAnamneseOdontopediatriaRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}