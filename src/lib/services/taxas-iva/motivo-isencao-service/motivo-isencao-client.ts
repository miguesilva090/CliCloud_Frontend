import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MotivoIsencaoLightDTO,
  MotivoIsencaoTableDTO,
} from '@/types/dtos/taxas-iva/motivo-isencao.dtos'

const BASE = '/client/taxas-iva/MotivoIsencao'

export class MotivoIsencaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getMotivosIsencaoLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<MotivoIsencaoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<MotivoIsencaoLightDTO[]>>(
      state.URL,
      url
    )
  }

  async createMotivoIsencao(body: {
    codigo: string
    descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      { codigo: string; descricao: string },
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async updateMotivoIsencao(
    id: string,
    body: { codigo: string; descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      { codigo: string; descricao: string },
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async getMotivoIsencaoById(
    id: string
  ): Promise<ResponseApi<GSResponse<MotivoIsencaoTableDTO>>> {
    return this.httpClient.getRequest<GSResponse<MotivoIsencaoTableDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
