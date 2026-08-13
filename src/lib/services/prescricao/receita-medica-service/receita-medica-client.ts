import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AnularReceitaMedicaRequest,
  CreateReceitaMedicaRequest,
  ReceitaMedicaDTO,
  ReceitaMedicaTableDTO,
  ReceitaMedicaTableFilterRequest,
  UpdateReceitaMedicaRequest,
  EnviarReceitaMedicaRequest,
} from '@/types/dtos/prescricao/receita-medica.dtos'

const BASE = '/client/prescricao/ReceitaMedica'

export class ReceitaMedicaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  getPaginated(
    params: ReceitaMedicaTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<ReceitaMedicaTableDTO>>> {
    return this.httpClient.postRequest<
      ReceitaMedicaTableFilterRequest,
      PaginatedResponse<ReceitaMedicaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  getById(id: string): Promise<ResponseApi<GSResponse<ReceitaMedicaDTO>>> {
    return this.httpClient.getRequest<GSResponse<ReceitaMedicaDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  create(
    payload: CreateReceitaMedicaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateReceitaMedicaRequest,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  update(
    id: string,
    payload: UpdateReceitaMedicaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateReceitaMedicaRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  anular(
    id: string,
    payload: AnularReceitaMedicaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      AnularReceitaMedicaRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}/anular`, payload)
  }

  enviar(
    id: string,
    payload: EnviarReceitaMedicaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      EnviarReceitaMedicaRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}/enviar`, payload)
  }
  
}
