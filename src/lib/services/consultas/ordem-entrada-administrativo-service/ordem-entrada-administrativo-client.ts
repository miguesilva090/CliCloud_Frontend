import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  AnularOrdemEntradaRequest,
  OrdemEntradaHorasDisponiveisDTO,
  OrdemEntradaHorasDisponiveisRequest,
  OrdemEntradaPaginatedRequest,
  OrdemEntradaRegistoDTO,
  OrdemEntradaTableDTO,
  SaveOrdemEntradaRegistoRequest,
} from '@/types/dtos/consultas/ordem-entrada.dtos'

const BASE = '/client/consultas/ordem-entrada-administrativo'

export class OrdemEntradaAdministrativoClient extends BaseApiClient {
  public async getPaginated(
    params: OrdemEntradaPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<OrdemEntradaTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async getRegisto(
    id: string
  ): Promise<ResponseApi<GSResponse<OrdemEntradaRegistoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
  }

  public async createRegisto(
    payload: SaveOrdemEntradaRegistoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }

  public async updateRegisto(
    id: string,
    payload: SaveOrdemEntradaRegistoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/${id}`, payload)
  }

  public async anular(
    id: string,
    payload: AnularOrdemEntradaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/anular`, payload)
  }

  public async getHorasDisponiveis(
    payload: OrdemEntradaHorasDisponiveisRequest
  ): Promise<ResponseApi<GSResponse<OrdemEntradaHorasDisponiveisDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/horas-disponiveis`, payload)
  }
}
