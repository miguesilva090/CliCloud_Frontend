import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  EvolucaoTratamentoFicheiroDTO,
  CreateEvolucaoTratamentoFicheiroRequest,
} from '@/types/dtos/tratamentos/evolucao-tratamento-ficheiro.dtos'

const BASE = '/client/tratamentos/EvolucaoTratamentoFicheiros'

export class EvolucaoTratamentoFicheirosClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByEvolucaoId(
    evolucaoTratamentoId: string,
  ): Promise<ResponseApi<GSResponse<EvolucaoTratamentoFicheiroDTO[]>>> {
    const url = `${BASE}?evolucaoTratamentoId=${encodeURIComponent(evolucaoTratamentoId)}`
    return this.httpClient.getRequest<GSResponse<EvolucaoTratamentoFicheiroDTO[]>>(state.URL, url)
  }

  async create(
    body: CreateEvolucaoTratamentoFicheiroRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateEvolucaoTratamentoFicheiroRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

