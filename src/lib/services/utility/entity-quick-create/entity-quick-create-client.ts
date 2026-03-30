import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient, BaseApiError } from '@/lib/base-client'
import type {
  CreateOrganismoRequest,
  CreateSeguradoraRequest,
  OrganismoLightDTO,
  SeguradoraLightDTO,
} from '@/types/dtos/entity-quick-create.dtos'

const ORGANISMOS_BASE = '/client/organismos/Organismo'
const SEGURADORAS_BASE = '/client/seguradoras/Seguradora'

export class EntityQuickCreateClient extends BaseApiClient {
  async getOrganismosLight(keyword = ''): Promise<ResponseApi<GSResponse<OrganismoLightDTO[]>>> {
    const url = keyword
      ? `${ORGANISMOS_BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${ORGANISMOS_BASE}/light`
    return this.getRequest<OrganismoLightDTO[]>(url)
  }

  async getSeguradorasLight(keyword = ''): Promise<ResponseApi<GSResponse<SeguradoraLightDTO[]>>> {
    const url = keyword
      ? `${SEGURADORAS_BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${SEGURADORAS_BASE}/light`
    return this.getRequest<SeguradoraLightDTO[]>(url)
  }

  async createOrganismo(data: CreateOrganismoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate(ORGANISMOS_BASE, data)
  }

  async createSeguradora(data: CreateSeguradoraRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate(SEGURADORAS_BASE, data)
  }

  private async getRequest<T>(urlPath: string): Promise<ResponseApi<GSResponse<T>>> {
    return this.withRetry(async () => {
      return await this.httpClient.getRequest<GSResponse<T>>(state.URL, urlPath)
    })
  }

  private async postCreate<T>(path: string, data: unknown): Promise<ResponseApi<GSResponse<T>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<unknown, GSResponse<T>>(
          state.URL,
          path,
          data
        )
        return response
      } catch (error) {
        if (error instanceof BaseApiError && error.data) {
          return {
            info: error.data as GSResponse<T>,
            status: error.statusCode ?? 400,
            statusText: error.message,
          }
        }
        throw error
      }
    })
  }
}

export function EntityQuickCreateService(idFuncionalidade: string) {
  return new EntityQuickCreateClient(idFuncionalidade)
}
