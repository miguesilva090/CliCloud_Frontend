import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  FuncionarioTableDTO,
  FuncionarioDTO,
  FuncionarioTableFilterRequest,
  CreateFuncionarioRequest,
  UpdateFuncionarioRequest,
} from '@/types/dtos/saude/funcionarios.dtos'

const BASE = '/client/funcionarios/Funcionario'

export class FuncionarioClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getFuncionariosPaginated(
    params: FuncionarioTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<FuncionarioTableDTO>>> {
    return this.httpClient.postRequest<
      FuncionarioTableFilterRequest,
      PaginatedResponse<FuncionarioTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getFuncionario(
    id: string
  ): Promise<ResponseApi<GSResponse<FuncionarioDTO>>> {
    return this.httpClient.getRequest<GSResponse<FuncionarioDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createFuncionario(
    payload: CreateFuncionarioRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateFuncionarioRequest,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  public async updateFuncionario(
    id: string,
    payload: UpdateFuncionarioRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateFuncionarioRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  public async deleteFuncionario(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
