import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MedicoExternoTableDTO,
  MedicoExternoDTO,
  MedicoExternoLightDTO,
  MedicoExternoTableFilterRequest,
  CreateMedicoExternoRequest,
  UpdateMedicoExternoRequest,
} from '@/types/dtos/saude/medicos-externos.dtos'

const BASE = '/client/medicos/MedicoExterno'

export class MedicoExternoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getMedicosExternosPaginated(
    params: MedicoExternoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<MedicoExternoTableDTO>>> {
    return this.httpClient.postRequest<
      MedicoExternoTableFilterRequest,
      PaginatedResponse<MedicoExternoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getMedicoExternoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<MedicoExternoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<MedicoExternoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getMedicoExterno(
    id: string
  ): Promise<ResponseApi<GSResponse<MedicoExternoDTO>>> {
    return this.httpClient.getRequest<GSResponse<MedicoExternoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createMedicoExterno(
    payload: CreateMedicoExternoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateMedicoExternoRequest,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  public async updateMedicoExterno(
    id: string,
    payload: UpdateMedicoExternoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateMedicoExternoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  public async deleteMedicoExterno(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
