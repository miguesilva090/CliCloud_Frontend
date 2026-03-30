import state from '@/states/state'
import {
  GSGenericResponse,
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import {
  CreateDistritoDTO,
  DistritoDTO,
  DistritoLightDTO,
  DistritoTableDTO,
  UpdateDistritoDTO,
} from '@/types/dtos/base/distritos.dtos'
import { ResponseApi } from '@/types/responses'
import { BaseApiClient, BaseApiError } from '@/lib/base-client'
import { DistritoError } from './distritos-errors'

export class DistritosClient extends BaseApiClient {
  public async getDistritosPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<DistritoTableDTO>>> {
    const cacheKey = this.getCacheKey(
      'POST',
      '/client/utility/Distrito/paginated',
      params
    )
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<DistritoTableDTO>
          >(state.URL, '/client/utility/Distrito/paginated', params)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new DistritoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new DistritoError(
            'Falha ao obter distritos paginados',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getDistritos(): Promise<ResponseApi<GSResponse<DistritoDTO[]>>> {
    const cacheKey = this.getCacheKey('GET', '/client/utility/Distrito')
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<DistritoDTO[]>
          >(state.URL, '/client/utility/Distrito')

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new DistritoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new DistritoError('Falha ao obter distritos', undefined, error)
        }
      })
    )
  }

  public async getDistritosLight(
    keyword?: string,
    paisId?: string
  ): Promise<ResponseApi<GSResponse<DistritoLightDTO[]>>> {
    const params = new URLSearchParams()
    if (keyword) {
      params.append('keyword', keyword)
    }
    if (paisId) {
      params.append('paisId', paisId)
    }
    const queryString = params.toString()
    const url = queryString
      ? `/client/utility/Distrito/light?${queryString}`
      : '/client/utility/Distrito/light'
    const cacheKey = this.getCacheKey('GET', url)
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<DistritoLightDTO[]>
          >(state.URL, url)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new DistritoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new DistritoError(
            'Falha ao obter distritos (lightweight)',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getAllDistritos(
    filters?: Record<string, string>,
    sorting?: Array<{ id: string; desc: boolean }>
  ): Promise<ResponseApi<GSResponse<DistritoTableDTO[]>>> {
    const cacheKey = this.getCacheKey('POST', '/client/utility/Distrito/all', {
      filters,
      sorting,
    })
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.postRequest<
            {
              filters?: Record<string, string>
              sorting?: Array<{ id: string; desc: boolean }>
            },
            GSResponse<DistritoTableDTO[]>
          >(state.URL, '/client/utility/Distrito/all', { filters, sorting })

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new DistritoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new DistritoError(
            'Falha ao obter todos os distritos',
            undefined,
            error
          )
        }
      })
    )
  }

  public async createDistrito(
    data: CreateDistritoDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<
          CreateDistritoDTO,
          GSResponse<string>
        >(state.URL, '/client/utility/Distrito', data)

        return response
      } catch (error) {
        if (error instanceof BaseApiError && error.data) {
          // If it's a validation error, return it as a response
          return {
            info: error.data as GSResponse<string>,
            status: error.statusCode || 400,
            statusText: error.message,
          }
        }
        throw error
      }
    })
  }

  public async updateDistrito(
    id: string,
    data: UpdateDistritoDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.putRequest<
          UpdateDistritoDTO,
          GSResponse<string>
        >(state.URL, `/client/utility/Distrito/${id}`, data)

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new DistritoError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new DistritoError('Falha ao atualizar distrito', undefined, error)
      }
    })
  }

  public async deleteDistrito(
    id: string
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequest<GSGenericResponse>(
          state.URL,
          `/client/utility/Distrito/${id}`
        )

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new DistritoError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new DistritoError('Falha ao apagar distrito', undefined, error)
      }
    })
  }

  public async deleteMultipleDistritos(
    ids: string[]
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequestWithBody<
          { ids: string[] },
          GSGenericResponse
        >(state.URL, '/client/utility/Distrito/all', { ids: ids })

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new DistritoError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new DistritoError(
          'Falha ao apagar múltiplos distritos',
          undefined,
          error
        )
      }
    })
  }

  public async getDistrito(
    id: string
  ): Promise<ResponseApi<GSResponse<DistritoDTO>>> {
    const cacheKey = this.getCacheKey('GET', `/client/utility/Distrito/${id}`)
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<DistritoDTO>
          >(state.URL, `/client/utility/Distrito/${id}`)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new DistritoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new DistritoError('Falha ao obter distrito', undefined, error)
        }
      })
    )
  }
}
