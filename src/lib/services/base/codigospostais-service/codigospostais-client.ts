import state from '@/states/state'
import {
  GSGenericResponse,
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import {
  CodigoPostalDTO,
  CodigoPostalLightDTO,
  CodigoPostalTableDTO,
  CreateCodigoPostalDTO,
  UpdateCodigoPostalDTO,
} from '@/types/dtos/base/codigospostais.dtos'
import { ResponseApi } from '@/types/responses'
import { BaseApiClient, BaseApiError } from '@/lib/base-client'
import { CodigoPostalError } from './codigospostais-errors'

export class CodigosPostaisClient extends BaseApiClient {
  public async getCodigosPostaisPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<CodigoPostalTableDTO>>> {
    const cacheKey = this.getCacheKey(
      'POST',
      '/client/utility/CodigoPostal/paginated',
      params
    )
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<CodigoPostalTableDTO>
          >(state.URL, '/client/utility/CodigoPostal/paginated', params)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new CodigoPostalError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new CodigoPostalError(
            'Falha ao obter códigos postais paginados',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getCodigosPostais(): Promise<
    ResponseApi<GSResponse<CodigoPostalDTO[]>>
  > {
    const cacheKey = this.getCacheKey('GET', '/client/utility/CodigoPostal')
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<CodigoPostalDTO[]>
          >(state.URL, '/client/utility/CodigoPostal')

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new CodigoPostalError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new CodigoPostalError(
            'Falha ao obter códigos postais',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getCodigosPostaisLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<CodigoPostalLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/CodigoPostal/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/CodigoPostal/light'
    const cacheKey = this.getCacheKey('GET', url)
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<CodigoPostalLightDTO[]>
          >(state.URL, url)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new CodigoPostalError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new CodigoPostalError(
            'Falha ao obter códigos postais (lightweight)',
            undefined,
            error
          )
        }
      })
    )
  }

  public async getAllCodigosPostais(
    filters?: Record<string, string>,
    sorting?: Array<{ id: string; desc: boolean }>
  ): Promise<ResponseApi<GSResponse<CodigoPostalTableDTO[]>>> {
    const cacheKey = this.getCacheKey(
      'POST',
      '/client/utility/CodigoPostal/all',
      {
        filters,
        sorting,
      }
    )
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.postRequest<
            {
              filters?: Record<string, string>
              sorting?: Array<{ id: string; desc: boolean }>
            },
            GSResponse<CodigoPostalTableDTO[]>
          >(state.URL, '/client/utility/CodigoPostal/all', { filters, sorting })

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new CodigoPostalError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new CodigoPostalError(
            'Falha ao obter todos os códigos postais',
            undefined,
            error
          )
        }
      })
    )
  }

  public async createCodigoPostal(
    data: CreateCodigoPostalDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<
          CreateCodigoPostalDTO,
          GSResponse<string>
        >(state.URL, '/client/utility/CodigoPostal', data)

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

  public async updateCodigoPostal(
    id: string,
    data: UpdateCodigoPostalDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.putRequest<
          UpdateCodigoPostalDTO,
          GSResponse<string>
        >(state.URL, `/client/utility/CodigoPostal/${id}`, data)

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new CodigoPostalError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new CodigoPostalError(
          'Falha ao atualizar código postal',
          undefined,
          error
        )
      }
    })
  }

  public async deleteCodigoPostal(
    id: string
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequest<GSGenericResponse>(
          state.URL,
          `/client/utility/CodigoPostal/${id}`
        )

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new CodigoPostalError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new CodigoPostalError(
          'Falha ao apagar código postal',
          undefined,
          error
        )
      }
    })
  }

  public async deleteMultipleCodigosPostais(
    ids: string[]
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequestWithBody<
          { ids: string[] },
          GSGenericResponse
        >(state.URL, '/client/utility/CodigoPostal/bulk', { ids: ids })

        if (!response.info) {
          console.error('Formato de resposta inválido:', response)
          throw new CodigoPostalError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new CodigoPostalError(
          'Falha ao apagar múltiplos códigos postais',
          undefined,
          error
        )
      }
    })
  }

  public async getCodigoPostal(
    id: string
  ): Promise<ResponseApi<GSResponse<CodigoPostalDTO>>> {
    const cacheKey = this.getCacheKey(
      'GET',
      `/client/utility/CodigoPostal/${id}`
    )
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<CodigoPostalDTO>
          >(state.URL, `/client/utility/CodigoPostal/${id}`)

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new CodigoPostalError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new CodigoPostalError(
            'Falha ao obter código postal',
            undefined,
            error
          )
        }
      })
    )
  }
}
