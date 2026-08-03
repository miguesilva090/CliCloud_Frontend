import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  CreateSessaoTratamentoRequest,
  SessaoTratamentoAllFilterRequest,
  SessaoTratamentoDTO,
  SessaoTratamentoTableDTO,
  UpdateSessaoTratamentoRequest,
  CompensarFaltaSessaoTratamentoRequest,
} from '@/types/dtos/tratamentos/sessao-tratamento.dtos'

const BASE = '/client/tratamentos/SessaoTratamento'

export class SessaoTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAllByTratamentoId(
    tratamentoId: string
  ): Promise<ResponseApi<GSResponse<SessaoTratamentoTableDTO[]>>> {
    const body: SessaoTratamentoAllFilterRequest = {
      filters: [{ id: 'tratamentoId', value: tratamentoId }],
    }
    return this.httpClient.postRequest<
      SessaoTratamentoAllFilterRequest,
      GSResponse<SessaoTratamentoTableDTO[]>
    >(state.URL, `${BASE}/all`, body)
  }

  async getById(
    id: string
  ): Promise<ResponseApi<GSResponse<SessaoTratamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<SessaoTratamentoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  async create(
    body: CreateSessaoTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateSessaoTratamentoRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateSessaoTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateSessaoTratamentoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  async compensarFalta(
    body: CompensarFaltaSessaoTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CompensarFaltaSessaoTratamentoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/compensar-falta`, body)
  }
}
