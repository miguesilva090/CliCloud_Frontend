import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  ExamesSemPapelContextoDTO,
  ExameSemPapelFiltroRequest,
  ExameSemPapelAssinaturaSessaoRequest,
  ExameSemPapelLoteRequest,
  ExameSemPapelLoteResultadoDTO,
  ExameSemPapelTabelaDTO,
} from '@/types/dtos/consultas/exames-sem-papel.dtos'

const BASE = '/client/consultas/ExamesSemPapel'

export class ExamesSemPapelClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getContexto(): Promise<ResponseApi<GSResponse<ExamesSemPapelContextoDTO>>> {
    return this.httpClient.getRequest<GSResponse<ExamesSemPapelContextoDTO>>(
      state.URL,
      `${BASE}/contexto`
    )
  }

  async getTabela(
    payload: ExameSemPapelFiltroRequest
  ): Promise<ResponseApi<PaginatedResponse<ExameSemPapelTabelaDTO>>> {
    return this.httpClient.postRequest<
      ExameSemPapelFiltroRequest,
      PaginatedResponse<ExameSemPapelTabelaDTO>
    >(state.URL, `${BASE}/tabela`, payload)
  }

  async guardarAssinaturaSessao(
    payload: ExameSemPapelAssinaturaSessaoRequest
  ): Promise<ResponseApi<GSResponse<boolean>>> {
    return this.httpClient.postRequest<
      ExameSemPapelAssinaturaSessaoRequest,
      GSResponse<boolean>
    >(state.URL, `${BASE}/assinatura-sessao`, payload)
  }

  async limparAssinaturaSessao(): Promise<ResponseApi<GSResponse<boolean>>> {
    return this.httpClient.deleteRequest<GSResponse<boolean>>(
      state.URL,
      `${BASE}/assinatura-sessao`
    )
  }

  async assinarLote(
    payload: ExameSemPapelLoteRequest
  ): Promise<ResponseApi<GSResponse<ExameSemPapelLoteResultadoDTO>>> {
    return this.httpClient.postRequest<
      ExameSemPapelLoteRequest,
      GSResponse<ExameSemPapelLoteResultadoDTO>
    >(state.URL, `${BASE}/assinar-lote`, payload)
  }

  async comunicarLote(
    payload: ExameSemPapelLoteRequest
  ): Promise<ResponseApi<GSResponse<ExameSemPapelLoteResultadoDTO>>> {
    return this.httpClient.postRequest<
      ExameSemPapelLoteRequest,
      GSResponse<ExameSemPapelLoteResultadoDTO>
    >(state.URL, `${BASE}/comunicar-lote`, payload)
  }
}
