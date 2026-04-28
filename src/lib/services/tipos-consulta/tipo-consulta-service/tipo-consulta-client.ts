import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TipoConsultaDTO,
  TipoConsultaTableDTO,
} from '@/types/dtos/tipos-consulta/tipo-consulta.dtos'
import type { AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'

const BASE = '/client/consultas/TipoConsulta'

export class TipoConsultaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getAllTiposConsulta(
    body?: AllFilterRequest
  ): Promise<ResponseApi<GSResponse<TipoConsultaTableDTO[]>>> {
    return this.httpClient.postRequest<
      AllFilterRequest | undefined,
      GSResponse<TipoConsultaTableDTO[]>
    >(state.URL, `${BASE}/all`, body ?? {})
  }

  public async getTiposConsultaPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<TipoConsultaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<TipoConsultaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getTipoConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<TipoConsultaDTO>>> {
    return this.httpClient.getRequest<GSResponse<TipoConsultaDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async updateTipoConsulta(
    id: string,
    body: { designacao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteTipoConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
