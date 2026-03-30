import state from '@/states/state'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AntecedentesFamiliaresUtenteDTO,
  AntecedentesFamiliaresUtenteTableDTO,
  AntecedentesFamiliaresUtenteTableFilterRequest,
  CreateAntecedentesFamiliaresUtenteRequest,
  UpdateAntecedentesFamiliaresUtenteRequest,
} from '@/types/dtos/saude/antecedentes-familiares-utente.dtos'

const BASE = '/client/antecedentes/AntecedentesFamiliaresUtente'

export class AntecedentesFamiliaresUtenteClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAntecedentesFamiliaresUtentePaginated(
    params: PaginatedRequest & {
      filters?: AntecedentesFamiliaresUtenteTableFilterRequest['filters']
    }
  ): Promise<ResponseApi<PaginatedResponse<AntecedentesFamiliaresUtenteTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & {
        filters?: AntecedentesFamiliaresUtenteTableFilterRequest['filters']
      },
      PaginatedResponse<AntecedentesFamiliaresUtenteTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<AntecedentesFamiliaresUtenteDTO>> {
    return this.httpClient.getRequest<AntecedentesFamiliaresUtenteDTO>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  async create(
    body: CreateAntecedentesFamiliaresUtenteRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateAntecedentesFamiliaresUtenteRequest, { data?: string }>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateAntecedentesFamiliaresUtenteRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<
      UpdateAntecedentesFamiliaresUtenteRequest,
      { data?: string }
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }
}

