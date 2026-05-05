import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient, BaseApiError } from '@/lib/base-client'

function getApiErrorMessage(info: unknown): string {
  if (info == null) return 'Falha ao criar utente'
  if (typeof info === 'string' && info.trim()) return info.trim()
  if (typeof info === 'object' && info !== null) {
    const o = info as Record<string, unknown>
    if (o.messages && typeof o.messages === 'object') {
      const flat = Object.values(o.messages as Record<string, string[]>).flat()
      if (flat.length) return flat.join(', ')
    }
    if (typeof o.message === 'string' && o.message.trim()) return o.message.trim()
  }
  return 'Falha ao criar utente'
}
import type {
  CreateUtenteRequest,
  UpdateUtenteRequest,
  UtenteDTO,
  UtenteLightDTO,
  UtenteTableDTO,
  UtenteTableFilterRequest,
} from '@/types/dtos/saude/utentes.dtos'
import { UtenteError } from './utentes-errors'

export class UtentesClient extends BaseApiClient {
  /**
   * GET /client/utentes/Utente?keyword=
   */
  public async getUtentes(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<UtenteDTO[]>>> {
    const url = keyword
      ? `/client/utentes/Utente?keyword=${encodeURIComponent(keyword)}`
      : '/client/utentes/Utente'
    const cacheKey = this.getCacheKey('GET', url)

    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          return await this.httpClient.getRequest<GSResponse<UtenteDTO[]>>(
            state.URL,
            url
          )
        } catch (error) {
          throw new UtenteError('Falha ao obter utentes', undefined, error)
        }
      })
    )
  }

  /**
   * GET /client/utentes/Utente/light?keyword=
   */
  public async getUtentesLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<UtenteLightDTO[]>>> {
    const url = keyword
      ? `/client/utentes/Utente/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utentes/Utente/light'
    const cacheKey = this.getCacheKey('GET', url)

    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          return await this.httpClient.getRequest<GSResponse<UtenteLightDTO[]>>(
            state.URL,
            url
          )
        } catch (error) {
          throw new UtenteError(
            'Falha ao obter utentes (lightweight)',
            undefined,
            error
          )
        }
      })
    )
  }

  /**
   * POST /client/utentes/Utente/paginated
   *
   * Nota: este endpoint devolve PaginatedResponse<T> (sem envelope Response).
   */
  public async getUtentesPaginated(
    params: UtenteTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<UtenteTableDTO>>> {
    const cacheKey = this.getCacheKey(
      'POST',
      '/client/utentes/Utente/paginated',
      params
    )

    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          return await this.httpClient.postRequest<
            UtenteTableFilterRequest,
            PaginatedResponse<UtenteTableDTO>
          >(state.URL, '/client/utentes/Utente/paginated', params)
        } catch (error) {
          throw new UtenteError(
            'Falha ao obter utentes paginados',
            undefined,
            error
          )
        }
      })
    )
  }

  /**
   * GET /client/utentes/Utente/{id}
   */
  public async getUtente(
    id: string
  ): Promise<ResponseApi<GSResponse<UtenteDTO>>> {
    const url = `/client/utentes/Utente/${id}`
    const cacheKey = this.getCacheKey('GET', url)

    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          return await this.httpClient.getRequest<GSResponse<UtenteDTO>>(
            state.URL,
            url
          )
        } catch (error) {
          throw new UtenteError('Falha ao obter utente', undefined, error)
        }
      })
    )
  }

  /**
   * GET /client/utentes/Utente/numeroUtente/{numeroUtente}
   */
  public async getUtenteByNumeroUtente(
    numeroUtente: string
  ): Promise<ResponseApi<GSResponse<UtenteDTO>>> {
    const url = `/client/utentes/Utente/numeroUtente/${encodeURIComponent(numeroUtente)}`
    const cacheKey = this.getCacheKey('GET', url)

    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          return await this.httpClient.getRequest<GSResponse<UtenteDTO>>(
            state.URL,
            url
          )
        } catch (error) {
          throw new UtenteError(
            'Falha ao obter utente por número de utente',
            undefined,
            error
          )
        }
      })
    )
  }

  /**
   * POST /client/utentes/Utente
   *
   * Cria um utente. O backend devolve `Response<Guid>` (envelope GSResponse<string> no frontend).
   */
  public async createUtente(
    payload: CreateUtenteRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    try {
      return await this.httpClient.postRequest<CreateUtenteRequest, GSResponse<string>>(
        state.URL,
        '/client/utentes/Utente',
        payload
      )
    } catch (error) {
      const message = error instanceof BaseApiError && error.data != null
        ? getApiErrorMessage(error.data)
        : 'Falha ao criar utente'
      throw new UtenteError(message, error instanceof BaseApiError ? error.statusCode : undefined, error)
    }
  }

  /**
   * PUT /client/utentes/Utente/{id}
   */
  public async updateUtente(
    id: string,
    payload: UpdateUtenteRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    try {
      return await this.httpClient.putRequest<UpdateUtenteRequest, GSResponse<string>>(
        state.URL,
        `/client/utentes/Utente/${id}`,
        payload
      )
    } catch (error) {
      if (error instanceof BaseApiError && error.data !== undefined) {
        const data = error.data
        const info: GSResponse<string> =
          typeof data === 'string'
            ? { status: 2, messages: { $: [data] } }
            : (data as GSResponse<string>)
        return {
          info,
          status: error.statusCode ?? 400,
          statusText: error.message,
        }
      }
      throw new UtenteError('Falha ao atualizar utente', undefined, error)
    }
  }

  /**
   * DELETE /client/utentes/Utente/{id}
   */
  public async deleteUtente(id: string): Promise<ResponseApi<GSResponse<string>>> {
    try {
      return await this.httpClient.deleteRequest<GSResponse<string>>(
        state.URL,
        `/client/utentes/Utente/${id}`
      )
    } catch (error) {
      throw new UtenteError('Falha ao apagar utente', undefined, error)
    }
  }
}

