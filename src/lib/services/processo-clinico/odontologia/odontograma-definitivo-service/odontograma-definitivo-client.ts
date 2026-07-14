import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  OdontogramaDefinitivoDTO,
  CreateOdontogramaDefinitivoRequest,
  UpdateOdontogramaDefinitivoRequest,
} from '@/types/dtos/odontologia/odontograma-definitivo.dtos'

const BASE = '/client/processo-clinico/odontologia/OdontogramaDefinitivo'

export class OdontogramaDefinitivoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtenteConsulta(
    utenteId: string,
    consultaId: string,
  ): Promise<ResponseApi<GSResponse<OdontogramaDefinitivoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<OdontogramaDefinitivoDTO[]>>(
      state.URL,
      `${BASE}/utente/${utenteId}/consulta/${consultaId}`,
    )
  }

  async getById(
    id: string,
  ): Promise<ResponseApi<GSResponse<OdontogramaDefinitivoDTO>>> {
    return this.httpClient.getRequest<GSResponse<OdontogramaDefinitivoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async create(
    body: CreateOdontogramaDefinitivoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateOdontogramaDefinitivoRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateOdontogramaDefinitivoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateOdontogramaDefinitivoRequest,
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
