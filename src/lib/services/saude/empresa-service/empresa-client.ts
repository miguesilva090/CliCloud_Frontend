import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  EmpresaTableDTO,
  EmpresaDTO,
  EmpresaTableFilterRequest,
  CreateEmpresaRequest,
  UpdateEmpresaRequest,
} from '@/types/dtos/saude/empresas.dtos'

const BASE = '/client/empresas/Empresa'

export class EmpresaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getEmpresasPaginated(
    params: EmpresaTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<EmpresaTableDTO>>> {
    return this.httpClient.postRequest<
      EmpresaTableFilterRequest,
      PaginatedResponse<EmpresaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getEmpresa(
    id: string
  ): Promise<ResponseApi<GSResponse<EmpresaDTO>>> {
    return this.httpClient.getRequest<GSResponse<EmpresaDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createEmpresa(
    payload: CreateEmpresaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateEmpresaRequest,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  public async updateEmpresa(
    id: string,
    payload: UpdateEmpresaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateEmpresaRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  public async deleteEmpresa(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}

