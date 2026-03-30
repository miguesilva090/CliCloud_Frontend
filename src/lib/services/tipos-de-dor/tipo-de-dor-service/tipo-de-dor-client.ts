import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TipoDeDorLightDTO,
  TipoDeDorTableDTO,
  TipoDeDorDTO,
  CreateTipoDeDorRequest,
  UpdateTipoDeDorRequest,
} from '@/types/dtos/tipodedor/tipo-de-dor.dtos'

const BASE = '/client/tratamentos/TipoDeDor'

export class TipoDeDorClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getTiposDeDor(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<TipoDeDorDTO[]>>> {
    const url = keyword
      ? `${BASE}?keyword=${encodeURIComponent(keyword)}`
      : BASE
    return this.httpClient.getRequest<GSResponse<TipoDeDorDTO[]>>(state.URL, url)
  }

  public async getTiposDeDorLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<TipoDeDorLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<TipoDeDorLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getTiposDeDorPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<TipoDeDorTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<TipoDeDorTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getAllTiposDeDor(
    body: unknown
  ): Promise<ResponseApi<GSResponse<TipoDeDorTableDTO[]>>> {
    return this.httpClient.postRequest<
      typeof body,
      GSResponse<TipoDeDorTableDTO[]>
    >(state.URL, `${BASE}/all`, body)
  }

  public async getTipoDeDor(
    id: string
  ): Promise<ResponseApi<GSResponse<TipoDeDorDTO>>> {
    return this.httpClient.getRequest<GSResponse<TipoDeDorDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async getTipoDeDorByDescricao(
    descricao: string
  ): Promise<ResponseApi<GSResponse<TipoDeDorDTO>>> {
    return this.httpClient.getRequest<GSResponse<TipoDeDorDTO>>(
      state.URL,
      `${BASE}/descricao/${encodeURIComponent(descricao)}`
    )
  }

  public async createTipoDeDor(
    body: CreateTipoDeDorRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateTipoDeDorRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  public async updateTipoDeDor(
    id: string,
    body: UpdateTipoDeDorRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateTipoDeDorRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  public async deleteTipoDeDor(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleTiposDeDor(
    body: { ids: string[] }
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      typeof body,
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}
