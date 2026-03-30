import state from '@/states/state'
import {
  GSGenericResponse,
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import {
  CreateConcelhoDTO,
  ConcelhoDTO,
  ConcelhoLightDTO,
  ConcelhoTableDTO,
  UpdateConcelhoDTO,
} from '@/types/dtos/base/concelhos.dtos'
import { ResponseApi } from '@/types/responses'
import { BaseApiClient, BaseApiError } from '@/lib/base-client'
import { ConcelhoError } from './concelhos-errors'

export class ConcelhosClient extends BaseApiClient {
  public async getConcelhosPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<ConcelhoTableDTO>>> {
    const cacheKey = this.getCacheKey(
      'POST',
      '/client/utility/Concelho/paginated',
      params
    )
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<ConcelhoTableDTO>
          >(state.URL, '/client/utility/Concelho/paginated', params)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new ConcelhoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new ConcelhoError(
            'Falha ao obter concelhos paginados',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getConcelhos(): Promise<ResponseApi<GSResponse<ConcelhoDTO[]>>> {
    const cacheKey = this.getCacheKey('GET', '/client/utility/Concelho')
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<ConcelhoDTO[]>
          >(state.URL, '/client/utility/Concelho')

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new ConcelhoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new ConcelhoError('Falha ao obter concelhos', undefined, error)
        }
      })
    )
  }

  public async getConcelhosLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<ConcelhoLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/Concelho/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/Concelho/light'
    const cacheKey = this.getCacheKey('GET', url)
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<ConcelhoLightDTO[]>
          >(state.URL, url)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new ConcelhoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new ConcelhoError(
            'Falha ao obter concelhos (lightweight)',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getAllConcelhos(
    filters?: Record<string, string>,
    sorting?: Array<{ id: string; desc: boolean }>
  ): Promise<ResponseApi<GSResponse<ConcelhoTableDTO[]>>> {
    const cacheKey = this.getCacheKey('POST', '/client/utility/Concelho/all', {
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
            GSResponse<ConcelhoTableDTO[]>
          >(state.URL, '/client/utility/Concelho/all', { filters, sorting })

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new ConcelhoError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new ConcelhoError(
            'Falha ao obter todos os concelhos',
            undefined,
            error
          )
        }
      })
    )
  }

  public async createConcelho(
    data: CreateConcelhoDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<
          CreateConcelhoDTO,
          GSResponse<string>
        >(state.URL, '/client/utility/Concelho', data)

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

  public async updateConcelho(
    id: string,
    data: UpdateConcelhoDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.putRequest<
          UpdateConcelhoDTO,
          GSResponse<string>
        >(state.URL, `/client/utility/Concelho/${id}`, data)

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new ConcelhoError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ConcelhoError('Falha ao atualizar concelho', undefined, error)
      }
    })
  }

  public async deleteConcelho(
    id: string
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequest<GSGenericResponse>(
          state.URL,
          `/client/utility/Concelho/${id}`
        )

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new ConcelhoError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ConcelhoError('Falha ao apagar concelho', undefined, error)
      }
    })
  }

  public async deleteMultipleConcelhos(
    ids: string[]
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequestWithBody<
          { ids: string[] },
          GSGenericResponse
        >(state.URL, '/client/utility/Concelho/bulk', { ids: ids })

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new ConcelhoError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ConcelhoError(
          'Falha ao apagar múltiplos concelhos',
          undefined,
          error
        )
      }
    })
  }

  public async getConcelho(
    id: string
  ): Promise<ResponseApi<GSResponse<ConcelhoDTO>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.getRequest<
          GSResponse<ConcelhoDTO>
        >(state.URL, `/client/utility/Concelho/${id}`)

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new ConcelhoError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ConcelhoError('Falha ao obter concelho', undefined, error)
      }
    })
  }
}
