import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GorduraMassaMuscularDTO,
  GorduraMassaMuscularTableDTO,
  CreateGorduraMassaMuscularRequest,
  UpdateGorduraMassaMuscularRequest,
} from '@/types/dtos/sinais-vitais/gordura-massa-muscular.dtos'

const BASE = '/client/processo-clinico/GorduraMassaMuscular'

type PaginatedParams = Partial<TableFilterRequest>

export class GorduraMassaMuscularClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<GorduraMassaMuscularTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedParams,
      PaginatedResponse<GorduraMassaMuscularTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<GorduraMassaMuscularDTO>> {
    return this.httpClient.getRequest<GorduraMassaMuscularDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateGorduraMassaMuscularRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateGorduraMassaMuscularRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateGorduraMassaMuscularRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateGorduraMassaMuscularRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}
