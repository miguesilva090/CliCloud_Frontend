import state from '@/states/state'
import {
  GSGenericResponse,
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import {
  CreateFreguesiaDTO,
  FreguesiaDTO,
  FreguesiaLightDTO,
  FreguesiaTableDTO,
  UpdateFreguesiaDTO,
} from '@/types/dtos/base/freguesias.dtos'
import { ResponseApi } from '@/types/responses'
import { BaseApiClient, BaseApiError } from '@/lib/base-client'
import { FreguesiaError } from './freguesias-errors'

export class FreguesiasClient extends BaseApiClient {
  public async getFreguesiasPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<FreguesiaTableDTO>>> {
    const cacheKey = this.getCacheKey(
      'POST',
      '/client/utility/Freguesia/paginated',
      params
    )
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<FreguesiaTableDTO>
          >(state.URL, '/client/utility/Freguesia/paginated', params)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new FreguesiaError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new FreguesiaError(
            'Falha ao obter freguesias paginadas',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getFreguesias(): Promise<
    ResponseApi<GSResponse<FreguesiaDTO[]>>
  > {
    const cacheKey = this.getCacheKey('GET', '/client/utility/Freguesia')
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<FreguesiaDTO[]>
          >(state.URL, '/client/utility/Freguesia')

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new FreguesiaError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new FreguesiaError(
            'Falha ao obter freguesias',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getFreguesiasLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<FreguesiaLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/Freguesia/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/Freguesia/light'
    const cacheKey = this.getCacheKey('GET', url)
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<FreguesiaLightDTO[]>
          >(state.URL, url)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new FreguesiaError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new FreguesiaError(
            'Falha ao obter freguesias (lightweight)',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getAllFreguesias(
    filters?: Record<string, string>,
    sorting?: Array<{ id: string; desc: boolean }>
  ): Promise<ResponseApi<GSResponse<FreguesiaTableDTO[]>>> {
    const cacheKey = this.getCacheKey('POST', '/client/utility/Freguesia/all', {
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
            GSResponse<FreguesiaTableDTO[]>
          >(state.URL, '/client/utility/Freguesia/all', { filters, sorting })

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new FreguesiaError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new FreguesiaError(
            'Falha ao obter todas as freguesias',
            undefined,
            error
          )
        }
      })
    )
  }

  public async createFreguesia(
    data: CreateFreguesiaDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<
          CreateFreguesiaDTO,
          GSResponse<string>
        >(state.URL, '/client/utility/Freguesia', data)

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

  public async updateFreguesia(
    id: string,
    data: UpdateFreguesiaDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.putRequest<
          UpdateFreguesiaDTO,
          GSResponse<string>
        >(state.URL, `/client/utility/Freguesia/${id}`, data)

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new FreguesiaError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new FreguesiaError(
          'Falha ao atualizar freguesia',
          undefined,
          error
        )
      }
    })
  }

  public async deleteFreguesia(
    id: string
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequest<GSGenericResponse>(
          state.URL,
          `/client/utility/Freguesia/${id}`
        )

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new FreguesiaError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new FreguesiaError('Falha ao apagar freguesia', undefined, error)
      }
    })
  }

  public async deleteMultipleFreguesias(
    ids: string[]
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequestWithBody<
          { ids: string[] },
          GSGenericResponse
        >(state.URL, '/client/utility/Freguesia/bulk', { ids: ids })

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new FreguesiaError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new FreguesiaError(
          'Falha ao apagar múltiplas freguesias',
          undefined,
          error
        )
      }
    })
  }

  public async getFreguesia(
    id: string
  ): Promise<ResponseApi<GSResponse<FreguesiaDTO>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.getRequest<
          GSResponse<FreguesiaDTO>
        >(state.URL, `/client/utility/Freguesia/${id}`)

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new FreguesiaError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new FreguesiaError('Falha ao obter freguesia', undefined, error)
      }
    })
  }
}
