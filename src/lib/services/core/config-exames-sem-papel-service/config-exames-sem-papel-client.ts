import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    AtualizarConfigExamesSemPapelRequest,
    ConfigExamesSemPapelDTO,
} from '@/types/dtos/core/config-exames-sem-papel.dtos'


const BASE = '/client/core/ConfigExamesSemPapel'

export class ConfigExamesSemPapelClient extends BaseApiClient {
    async getConfiguracaoAtual() : Promise<ResponseApi<GSResponse<ConfigExamesSemPapelDTO>>> {
        return this.httpClient.getRequest<GSResponse<ConfigExamesSemPapelDTO>>(state.URL, `${BASE}/configuracao`)
    }

    async updateConfiguracao(
        payload: AtualizarConfigExamesSemPapelRequest,
    ) : Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
    }
}