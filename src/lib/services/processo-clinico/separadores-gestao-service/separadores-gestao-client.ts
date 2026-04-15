import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  CreateSeparadorVinculoRequest,
  CreateSeparadorPersonalizadoRequest,
  CreateSeparadorPersonalizadoVinculoRequest,
  CreateSeparadorRequest,
  SeparadorDTO,
  SeparadorFichaClinicaDTO,
  SeparadorVinculoDTO,
  SeparadorPersonalizadoDTO,
  SeparadorPersonalizadoVinculoDTO,
  UpdateSeparadorPersonalizadoRequest,
  UpdateSeparadorRequest,
} from '@/types/dtos/processo-clinico/separadores-gestao.dtos'

const SEPARADOR_BASE = '/client/processo-clinico/Separador'
const SEPARADOR_VINCULO_BASE = '/client/processo-clinico/SeparadorVinculo'
const SEPARADOR_PERSONALIZADO_BASE = '/client/processo-clinico/SeparadorPersonalizado'
const VINCULO_BASE = '/client/processo-clinico/SeparadorPersonalizadoVinculo'

export class SeparadoresGestaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getSeparadores(keyword = ''): Promise<ResponseApi<SeparadorDTO[]>> {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<SeparadorDTO[]>(state.URL, `${SEPARADOR_BASE}${query}`)
  }

  async getSeparadoresFichaClinicaVisiveis(
    medicoId?: string | null,
    especialidadeId?: string | null,
  ): Promise<ResponseApi<SeparadorFichaClinicaDTO[]>> {
    const params = new URLSearchParams()
    if (medicoId) params.set('medicoId', medicoId)
    if (especialidadeId) params.set('especialidadeId', especialidadeId)
    const query = params.toString()
    const url = query
      ? `${SEPARADOR_BASE}/ficha-clinica-visiveis?${query}`
      : `${SEPARADOR_BASE}/ficha-clinica-visiveis`
    return this.httpClient.getRequest<SeparadorFichaClinicaDTO[]>(state.URL, url)
  }

  async createSeparador(body: CreateSeparadorRequest): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateSeparadorRequest, { data?: string }>(
      state.URL,
      SEPARADOR_BASE,
      body,
    )
  }

  async updateSeparador(
    id: string,
    body: UpdateSeparadorRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateSeparadorRequest, { data?: string }>(
      state.URL,
      `${SEPARADOR_BASE}/${id}`,
      body,
    )
  }

  async deleteSeparador(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${SEPARADOR_BASE}/${id}`)
  }

  async deleteMultipleSeparadores(ids: string[]): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequestWithBody<string[], { data?: string }>(
      state.URL,
      `${SEPARADOR_BASE}/bulk`,
      ids,
    )
  }

  async getSeparadorVinculos(separadorId: string): Promise<ResponseApi<SeparadorVinculoDTO[]>> {
    return this.httpClient.getRequest<SeparadorVinculoDTO[]>(
      state.URL,
      `${SEPARADOR_VINCULO_BASE}/separador/${separadorId}`,
    )
  }

  async createSeparadorVinculo(
    body: CreateSeparadorVinculoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateSeparadorVinculoRequest, { data?: string }>(
      state.URL,
      SEPARADOR_VINCULO_BASE,
      body,
    )
  }

  async deleteSeparadorVinculo(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${SEPARADOR_VINCULO_BASE}/${id}`)
  }

  async getSeparadoresPersonalizados(keyword = ''): Promise<ResponseApi<SeparadorPersonalizadoDTO[]>> {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<SeparadorPersonalizadoDTO[]>(
      state.URL,
      `${SEPARADOR_PERSONALIZADO_BASE}${query}`,
    )
  }

  async createSeparadorPersonalizado(
    body: CreateSeparadorPersonalizadoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateSeparadorPersonalizadoRequest, { data?: string }>(
      state.URL,
      SEPARADOR_PERSONALIZADO_BASE,
      body,
    )
  }

  async updateSeparadorPersonalizado(
    id: string,
    body: UpdateSeparadorPersonalizadoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateSeparadorPersonalizadoRequest, { data?: string }>(
      state.URL,
      `${SEPARADOR_PERSONALIZADO_BASE}/${id}`,
      body,
    )
  }

  async deleteSeparadorPersonalizado(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(
      state.URL,
      `${SEPARADOR_PERSONALIZADO_BASE}/${id}`,
    )
  }

  async deleteMultipleSeparadoresPersonalizados(ids: string[]): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequestWithBody<string[], { data?: string }>(
      state.URL,
      `${SEPARADOR_PERSONALIZADO_BASE}/bulk`,
      ids,
    )
  }

  async getVinculos(separadorPersonalizadoId: string): Promise<ResponseApi<SeparadorPersonalizadoVinculoDTO[]>> {
    return this.httpClient.getRequest<SeparadorPersonalizadoVinculoDTO[]>(
      state.URL,
      `${VINCULO_BASE}/separador/${separadorPersonalizadoId}`,
    )
  }

  async createVinculo(
    body: CreateSeparadorPersonalizadoVinculoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateSeparadorPersonalizadoVinculoRequest, { data?: string }>(
      state.URL,
      VINCULO_BASE,
      body,
    )
  }

  async deleteVinculo(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${VINCULO_BASE}/${id}`)
  }
}

