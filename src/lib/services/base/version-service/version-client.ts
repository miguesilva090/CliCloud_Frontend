import state from '@/states/state'
import { GSResponse } from '@/types/api/responses'
import { VersionDTO } from '@/types/dtos/base/version.dtos'
import { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import { VersionError } from './version-errors'

export class VersionClient extends BaseApiClient {
  /**
   * Get API version information
   * GET /api/version (requires authentication)
   */
  public async getVersion(): Promise<ResponseApi<GSResponse<VersionDTO>>> {
    const cacheKey = this.getCacheKey('GET', '/api/version')
    return this.withCache(cacheKey, () =>
      this.withRetry(async () => {
        try {
          const response = await this.httpClient.getRequest<
            GSResponse<VersionDTO>
          >(state.URL, '/api/version')

          if (!response.info) {
            console.error('Formato de resposta inválido:', response)
            throw new VersionError('Formato de resposta inválido')
          }

          return response
        } catch (error) {
          throw new VersionError(
            'Falha ao obter informações de versão',
            undefined,
            error
          )
        }
      })
    )
  }
}
