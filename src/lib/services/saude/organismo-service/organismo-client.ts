import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  OrganismoLightDTO,
  OrganismoTableDTO,
  OrganismoDTO,
  OrganismoTableFilterRequest,
  CreateOrganismoRequest,
  UpdateOrganismoRequest,
} from '@/types/dtos/saude/organismos.dtos'

const BASE = '/client/organismos/Organismo'

export class OrganismoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getOrganismoLight(
    keyword = '',
    siglaFicheiro?: string,
  ): Promise<ResponseApi<GSResponse<OrganismoLightDTO[]>>> {
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (siglaFicheiro) params.set('siglaFicheiro', siglaFicheiro)

    const query = params.toString()
    const url = query ? `${BASE}/light?${query}` : `${BASE}/light`

    return this.httpClient.getRequest<GSResponse<OrganismoLightDTO[]>>(
      state.URL,
      url,
    )
  }

  public async getOrganismosPaginated(
    params: OrganismoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<OrganismoTableDTO>>> {
    return this.httpClient.postRequest<
      OrganismoTableFilterRequest,
      PaginatedResponse<OrganismoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getOrganismo(
    id: string
  ): Promise<ResponseApi<GSResponse<OrganismoDTO>>> {
    return this.httpClient.getRequest<GSResponse<OrganismoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createOrganismo(
    payload: CreateOrganismoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateOrganismoRequest,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  public async updateOrganismo(
    id: string,
    payload: UpdateOrganismoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateOrganismoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  public async deleteOrganismo(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
