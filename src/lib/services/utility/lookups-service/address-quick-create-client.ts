import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient, BaseApiError } from '@/lib/base-client'
import type { CreatePaisDTO } from '@/types/dtos/base/paises.dtos'
import type { CreateDistritoDTO } from '@/types/dtos/base/distritos.dtos'
import type { CreateConcelhoDTO } from '@/types/dtos/base/concelhos.dtos'
import type { CreateFreguesiaDTO } from '@/types/dtos/base/freguesias.dtos'
import type { CreateCodigoPostalDTO } from '@/types/dtos/base/codigospostais.dtos'
import type { CreateRuaDTO } from '@/types/dtos/base/ruas.dtos'

/**
 * Client for creating address entities via client/utility/* (same backend as lookups).
 * Use this for quick-create modals so creates hit the same API as the light lists.
 */
export class AddressQuickCreateClient extends BaseApiClient {
  async createPais(data: CreatePaisDTO): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate('/client/utility/Pais', data)
  }

  async createDistrito(data: CreateDistritoDTO): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate('/client/utility/Distrito', data)
  }

  async createConcelho(data: CreateConcelhoDTO): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate('/client/utility/Concelho', data)
  }

  async createFreguesia(data: CreateFreguesiaDTO): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate('/client/utility/Freguesia', data)
  }

  async createCodigoPostal(data: CreateCodigoPostalDTO): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate('/client/utility/CodigoPostal', data)
  }

  async createRua(data: CreateRuaDTO): Promise<ResponseApi<GSResponse<string>>> {
    return this.postCreate('/client/utility/Rua', data)
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

export function AddressQuickCreateService(idFuncionalidade: string) {
  return new AddressQuickCreateClient(idFuncionalidade)
}
