import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
  PaginatedRequest,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { EntidadeFinanceiraTableDTO } from '@/types/dtos/utility/entidade-financeira.dtos'

const BASE = '/client/entidades-financeiras/EntidadesFinanceiras'

export class EntidadesFinanceirasClient extends BaseApiClient {
  /**
   * POST /client/entidades-financeiras/EntidadesFinanceiras/paginated
   */
  public async getEntidadesFinanceirasPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<EntidadeFinanceiraTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<EntidadeFinanceiraTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  /**
   * POST /client/entidades-financeiras/EntidadesFinanceiras
   * Criação completa de EntidadeFinanceira (fluxo simplificado usa apenas alguns campos)
   */
  public async createEntidadeFinanceira(body: {
    Nome: string
    TipoEntidadeId: number
    Codigo: string
    PaisPrefixo: string
    TipoEntidadeFinanceiraId: string
    Abreviatura?: string | null
    Email?: string | null
    NumeroContribuinte?: string | null
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}`,
      body
    )
  }

  /**
   * PUT /client/entidades-financeiras/EntidadesFinanceiras/{id}
   * Atualização de EntidadeFinanceira (fluxo simplificado usa apenas alguns campos)
   */
  public async updateEntidadeFinanceira(
    id: string,
    body: {
      Nome: string
      TipoEntidadeId: number
      Codigo: string
      PaisPrefixo: string
      TipoEntidadeFinanceiraId: string
      Abreviatura?: string | null
      Email?: string | null
      NumeroContribuinte?: string | null
    }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  /**
   * DELETE /client/entidades-financeiras/EntidadesFinanceiras/{id}
   */
  public async deleteEntidadeFinanceira(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  /**
   * POST /client/entidades-financeiras/EntidadesFinanceiras/basica
   * Fluxo simplificado para criação a partir da listagem básica
   */
  public async createEntidadeFinanceiraBasica(
    body: {
      codigo: string
      nome: string
      abreviatura?: string
      paisId: string
      paisPrefixo: string
      tipoEntidadeFinanceiraId: string
      condicaoSns?: number | null
      email?: string | null
      numeroContribuinte?: string | null
    }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      typeof body,
      GSResponse<string>
    >(state.URL, `${BASE}/basica`, body)
  }
}

