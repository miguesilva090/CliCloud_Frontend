import state from "@/states/state"
import type { ResponseApi } from "@/types/responses"
import type { GSResponse, PaginatedResponse } from "@/types/api/responses"
import type { TableFilterRequest, AllFilterRequest } from "@/types/dtos/common/table-filters.dtos"
import { BaseApiClient } from "@/lib/base-client"
import type { ServicoTratamentoTableDTO, ServicoTratamentoDTO, CreateServicoTratamentoRequest, UpdateServicoTratamentoRequest, ServicoTratamentoAllFilterRequest} from "@/types/dtos/tratamentos/servico-tratamento.dtos"


const BASE = "/client/tratamentos/ServicoTratamento"

type PaginatedParams = Partial<TableFilterRequest>

export class ServicoTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(params: PaginatedParams): Promise<ResponseApi<PaginatedResponse<ServicoTratamentoTableDTO>>> {
    return this.httpClient.postRequest<PaginatedParams, PaginatedResponse<ServicoTratamentoTableDTO>>(state.URL, `${BASE}/paginated`, params)
  }

  async getAll(body: AllFilterRequest): Promise<ResponseApi<GSResponse<ServicoTratamentoTableDTO[]>>> {
    return this.httpClient.postRequest<AllFilterRequest, GSResponse<ServicoTratamentoTableDTO[]>>(state.URL, `${BASE}/all`, body)
  }

  async getAllByTratamentoId(tratamentoId: string): Promise<ResponseApi<GSResponse<ServicoTratamentoTableDTO[]>>> {
    const body: ServicoTratamentoAllFilterRequest = {
      filters: [{ id: "tratamentoId", value: tratamentoId }],
    }
    return this.getAll(body)
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<ServicoTratamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<ServicoTratamentoDTO>>(state.URL, `${BASE}/${id}`)
  }

  async create(body: CreateServicoTratamentoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateServicoTratamentoRequest, GSResponse<string>>(state.URL, BASE, body)
  }

  async update(id: string, body: UpdateServicoTratamentoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateServicoTratamentoRequest, GSResponse<string>>(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }

}
