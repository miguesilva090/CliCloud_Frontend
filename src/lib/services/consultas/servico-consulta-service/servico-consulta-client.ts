import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ServicoConsultaAllFilterRequest,
  ServicoConsultaDTO,
  ServicoConsultaTableDTO,
} from '@/types/dtos/consultas/servico-consulta.dtos'

const BASE = '/client/consultas/ServicoConsulta'

export type CreateServicoConsultaBody = {
  consultaId: string
  servicoId?: string | null
  exameId?: string | null
  valorServico?: number | null
  codigoArtigo?: string | null
  nomeArtigo?: string | null
  valorArtigo?: number | null
  quantidade?: number | null
  margemMed?: number | null
  margemIns?: number | null
  recMed?: number | null
  recInst?: number | null
  descInst?: number | null
  descCli?: number | null
  valorDesc?: number | null
  ordem?: number | null
  dente?: string | null
  linha?: number | null
  nCheque?: string | null
  electrocardiograma?: number | null
  valorUt?: number | null
}

export type UpdateServicoConsultaBody = Omit<CreateServicoConsultaBody, 'consultaId'>

export class ServicoConsultaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getByConsultaAll(
    consultaId: string
  ): Promise<ResponseApi<GSResponse<ServicoConsultaTableDTO[]>>> {
    const body: ServicoConsultaAllFilterRequest = {
      filters: [{ id: 'consultaId', value: consultaId }],
      sorting: [],
    }
    return this.httpClient.postRequest<ServicoConsultaAllFilterRequest, GSResponse<ServicoConsultaTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  public async getServicoConsultaPaginated(
    params: PaginatedRequest & { filters?: Array<{ id: string; value: string }> }
  ): Promise<ResponseApi<PaginatedResponse<ServicoConsultaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: Array<{ id: string; value: string }> },
      PaginatedResponse<ServicoConsultaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createServicoConsulta(
    body: CreateServicoConsultaBody
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateServicoConsultaBody, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateServicoConsulta(
    id: string,
    body: UpdateServicoConsultaBody
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateServicoConsultaBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteServicoConsulta(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async getServicoConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<ServicoConsultaDTO>>> {
    return this.httpClient.getRequest<GSResponse<ServicoConsultaDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}

