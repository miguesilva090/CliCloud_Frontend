import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  SubsistemaServicoDTO,
  SubsistemaServicoTableDTO,
  SubsistemaServicoTableFilterRequest,
  CreateSubsistemaServicoRequest,
  UpdateSubsistemaServicoRequest,
} from '@/types/dtos/servicos/subsistema-servico.dtos'

const BASE = '/client/servicos/SubsistemaServico'

export class SubsistemaServicoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getSubsistemaServico(
    servicoId?: string
  ): Promise<ResponseApi<GSResponse<SubsistemaServicoDTO[]>>> {
    const url =
      servicoId && servicoId.length > 0
        ? `${BASE}?servicoId=${encodeURIComponent(servicoId)}`
        : BASE
    return this.httpClient.getRequest<GSResponse<SubsistemaServicoDTO[]>>(state.URL, url)
  }

  public async getSubsistemaServicoPaginated(
    params: SubsistemaServicoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<SubsistemaServicoTableDTO>>> {
    return this.httpClient.postRequest<
      SubsistemaServicoTableFilterRequest,
      PaginatedResponse<SubsistemaServicoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getSubsistemaServicoById(
    id: string
  ): Promise<ResponseApi<GSResponse<SubsistemaServicoDTO>>> {
    return this.httpClient.getRequest<GSResponse<SubsistemaServicoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createSubsistemaServico(
    body: CreateSubsistemaServicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateSubsistemaServicoRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateSubsistemaServico(
    id: string,
    body: UpdateSubsistemaServicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateSubsistemaServicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteSubsistemaServico(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

