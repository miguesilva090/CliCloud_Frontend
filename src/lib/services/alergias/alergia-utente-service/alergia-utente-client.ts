import state from '@/states/state'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AlergiaUtenteDTO,
  CreateAlergiaUtenteRequest,
  AlergiaUtenteTableFilterRequest,
} from '@/types/dtos/alergias/alergia-utente.dtos'

const BASE = '/client/alergias/AlergiaUtente'

export class AlergiaUtenteClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAlergiaUtentePaginated(
    params: PaginatedRequest & { filters?: AlergiaUtenteTableFilterRequest['filters'] }
  ): Promise<ResponseApi<PaginatedResponse<AlergiaUtenteDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: AlergiaUtenteTableFilterRequest['filters'] },
      PaginatedResponse<AlergiaUtenteDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getAlergiaUtenteById(id: string): Promise<ResponseApi<AlergiaUtenteDTO>> {
    return this.httpClient.getRequest<AlergiaUtenteDTO>(state.URL, `${BASE}/${id}`)
  }

  async createAlergiaUtente(
    body: CreateAlergiaUtenteRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    const payload = {
      utenteId: body.utenteId,
      alergiaId: body.alergiaId ?? null,
      grauAlergiaId: body.grauAlergiaId ?? null,
      dataDesde: body.dataDesde ?? null,
      dataAte: body.dataAte ?? null,
      observacoes: body.observacoes ?? null,
    }
    return this.httpClient.postRequest<typeof payload, { data?: string }>(
      state.URL,
      BASE,
      payload
    )
  }

  async updateAlergiaUtente(
    id: string,
    body: CreateAlergiaUtenteRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    const payload = {
      utenteId: body.utenteId,
      alergiaId: body.alergiaId ?? null,
      grauAlergiaId: body.grauAlergiaId ?? null,
      dataDesde: body.dataDesde ?? null,
      dataAte: body.dataAte ?? null,
      observacoes: body.observacoes ?? null,
    }
    return this.httpClient.putRequest<typeof payload, { data?: string }>(
      state.URL,
      `${BASE}/${id}`,
      payload
    )
  }

  async deleteAlergiaUtente(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }
}
