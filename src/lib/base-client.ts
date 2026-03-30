import { GSResponse } from '@/types/api/responses'
import { createHttpClient, HttpClient } from '@/lib/http-client'

export class BaseApiError extends Error {
  name: string

  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'BaseApiError'
  }
}

export abstract class BaseApiClient {
  protected httpClient: HttpClient
  protected cache: Map<string, { data: unknown; timestamp: number }>
  protected readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  protected readonly MAX_RETRIES = 0

  constructor(idFuncionalidade: string) {
    this.httpClient = createHttpClient(idFuncionalidade)
    this.cache = new Map()
  }

  protected validateResponse<T>(response: unknown): response is GSResponse<T> {
    return (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      'status' in response
    )
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0) {
        const delay = Math.pow(2, this.MAX_RETRIES - retries) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.withRetry(operation, retries - 1)
      }
      throw error
    }
  }

  protected getCacheKey(method: string, url: string, params?: unknown): string {
    return `${method}:${url}:${JSON.stringify(params)}`
  }

  protected async withCache<T>(
    cacheKey: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T
    }

    const result = await operation()
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  }

  protected handleError(error: unknown, message: string): never {
    throw new BaseApiError(
      message,
      error instanceof Error ? 500 : undefined,
      error
    )
  }
}
