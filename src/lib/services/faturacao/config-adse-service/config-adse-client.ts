import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type {
  ConfigAdseDTO,
  GuardarConfigAdseRequest,
} from '@/types/dtos/faturacao/config-adse.dtos'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'

const BASE = '/client/faturacao/configuracao-adse'

export class ConfigAdseClient extends BaseApiClient {
  async listConfiguracoes(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<ConfigAdseDTO[]>>> {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest(state.URL, `${BASE}${query}`)
  }

  async getConfiguracao(
    empresaId: string
  ): Promise<ResponseApi<GSResponse<ConfigAdseDTO>>> {
    const query = empresaId ? `?empresaId=${encodeURIComponent(empresaId)}` : ''
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao${query}`)
  }

  async guardarConfiguracao(
    empresaId: string,
    payload: GuardarConfigAdseRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    const resolvedEmpresaId = empresaId || payload.empresaId || ''
    const query = resolvedEmpresaId
      ? `?empresaId=${encodeURIComponent(resolvedEmpresaId)}`
      : ''
    return this.httpClient.putRequest(
      state.URL,
      `${BASE}/configuracao${query}`,
      payload
    )
  }
}
