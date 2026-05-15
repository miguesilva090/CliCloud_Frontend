import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  AdmissaoDTO,
  AdmissaoPaginatedRequest,
  AdmissaoTableDTO,
  CreateAdmissaoRequest,
  FechoDiarioRequest,
  FechoDiarioResultDTO,
  UpdateAdmissaoRequest,
} from '@/types/dtos/consultas/admissao.dtos'

const ADMISSOES_BASE = '/client/consultas/admissoes-administrativo'
const FECHO_BASE = '/client/consultas/fecho-diario-administrativo'

export class AdmissaoAdministrativoClient extends BaseApiClient {
  public async getPaginated(
    params: AdmissaoPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<AdmissaoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${ADMISSOES_BASE}/paginated`, params)
  }

  public async getById(id: string): Promise<ResponseApi<GSResponse<AdmissaoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${ADMISSOES_BASE}/${id}`)
  }

  public async create(
    payload: CreateAdmissaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, ADMISSOES_BASE, payload)
  }

  public async update(
    id: string,
    payload: UpdateAdmissaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${ADMISSOES_BASE}/${id}`, payload)
  }

  public async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${ADMISSOES_BASE}/${id}`)
  }

  public async confirmar(
    id: string,
    confirmado: boolean
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/confirmar`,
      confirmado
    )
  }

  public async setEfetuado(
    id: string,
    efetuado: boolean
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${ADMISSOES_BASE}/${id}/efetuado`, efetuado)
  }

  public async promoverParaConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/promover-consulta`,
      {}
    )
  }

  public async executarFecho(
    payload: FechoDiarioRequest
  ): Promise<ResponseApi<GSResponse<FechoDiarioResultDTO>>> {
    return this.httpClient.postRequest(state.URL, FECHO_BASE, payload)
  }
}
