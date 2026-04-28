import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ClinicaDTO,
  AutoCompleteItemDTO,
  ClinicaTableDTO,
  ClinicaTableFilterRequest,
  UpdateClinicaRequest,
} from '@/types/dtos/core/clinica.dtos'

const BASE = '/client/core/Clinica'

export class ClinicaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  /**
   * GET /client/core/Clinica/current
   */
  public async getClinicaCurrent(): Promise<ResponseApi<GSResponse<ClinicaDTO>>> {
    return this.httpClient.getRequest<GSResponse<ClinicaDTO>>(state.URL, `${BASE}/current`)
  }

  /**
   * PUT /client/core/Clinica/current
   */
  public async updateClinicaCurrent(
    payload: UpdateClinicaRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateClinicaRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/current`,
      payload
    )
  }

  /**
   * GET /client/core/Clinica/{id}
   */
  public async getClinicaById(
    id: string
  ): Promise<ResponseApi<GSResponse<ClinicaDTO>>> {
    return this.httpClient.getRequest<GSResponse<ClinicaDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  /**
   * POST /client/core/Clinica/paginated
   */
  public async getClinicasPaginated(
    params: ClinicaTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<ClinicaTableDTO>>> {
    return this.httpClient.postRequest<
      ClinicaTableFilterRequest,
      PaginatedResponse<ClinicaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  /**
   * POST /client/core/Clinica
   */
  public async createClinica(
    payload: UpdateClinicaRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<UpdateClinicaRequest, GSResponse<string>>(
      state.URL,
      BASE,
      payload,
    )
  }

  /**
   * PUT /client/core/Clinica/{id}
   */
  public async updateClinicaById(
    id: string,
    payload: UpdateClinicaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateClinicaRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      payload
    )
  }

  /**
   * PUT /client/core/Clinica/{id}/default?porDefeito=true|false
   * legacy: EMPRESAS.pordefeito
   */
  public async setClinicaDefault(
    id: string,
    porDefeito: boolean
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putWithoutDataRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}/default?porDefeito=${porDefeito}`
    )
  }

  /**
   * GET /client/core/Clinica/autocomplete?q=...
   */
  public async getClinicasAutocomplete(
    q: string,
  ): Promise<ResponseApi<GSResponse<AutoCompleteItemDTO[]>>> {
    const query = encodeURIComponent(q ?? '')
    return this.httpClient.getRequest<GSResponse<AutoCompleteItemDTO[]>>(
      state.URL,
      `${BASE}/autocomplete?q=${query}`,
    )
  }

  /**
   * GET /client/core/Clinica/autocomplete-selected?q=...
   */
  public async getClinicasSelectedAutocomplete(
    q: string,
  ): Promise<ResponseApi<GSResponse<AutoCompleteItemDTO[]>>> {
    const query = encodeURIComponent(q ?? '')
    return this.httpClient.getRequest<GSResponse<AutoCompleteItemDTO[]>>(
      state.URL,
      `${BASE}/autocomplete-selected?q=${query}`,
    )
  }
}

