import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  FornecedorTableDTO,
  FornecedorDTO,
  FornecedorTableFilterRequest,
  CreateFornecedorRequest,
  UpdateFornecedorRequest,
} from '@/types/dtos/saude/fornecedores.dtos'

const BASE = '/client/fornecedores/Fornecedor'

export class FornecedorClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getFornecedoresPaginated(
    params: FornecedorTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<FornecedorTableDTO>>> {
    return this.httpClient.postRequest<
      FornecedorTableFilterRequest,
      PaginatedResponse<FornecedorTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getFornecedor(
    id: string
  ): Promise<ResponseApi<GSResponse<FornecedorDTO>>> {
    return this.httpClient.getRequest<GSResponse<FornecedorDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createFornecedor(
    payload: CreateFornecedorRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateFornecedorRequest,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  public async updateFornecedor(
    id: string,
    payload: UpdateFornecedorRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateFornecedorRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  public async deleteFornecedor(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
