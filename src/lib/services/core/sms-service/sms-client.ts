import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    ConfiguracaoSmsDTO,
    AtualizarConfiguracaoSmsRequest,
    EnviarSmsTesteRequest,
    ConfiguracaoSmsAutomaticaDTO,
    AtualizarConfiguracaoAutomaticaRequest,
    GuardarTodosMedicosSmsRequest,
    GuardarMedicosSmsRequest,
    HistoricoSmsTabelaDTO,
    HistoricoSmsTabelaFiltro,
} from '@/types/dtos/core/sms.dtos'
import type { PaginatedResponse } from '@/types/api/responses'

const BASE = '/client/core/Sms'

export class SmsClient extends BaseApiClient {
    async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfiguracaoSmsDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
    }

    async updateConfiguracao(payload: AtualizarConfiguracaoSmsRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
    }

    async enviarTeste(payload: EnviarSmsTesteRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/enviar-teste`, payload)
    }

    async getConfiguracoesAutomaticas(): Promise<ResponseApi<GSResponse<ConfiguracaoSmsAutomaticaDTO[]>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/automaticos`)
    }

    async updateConfiguracaoAutomatica(
        codigo: string,
        payload: AtualizarConfiguracaoAutomaticaRequest,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest(state.URL, `${BASE}/automaticos/${codigo}`, payload)
    }

    async updateTodosMedicos(
        codigo: string,
        payload: GuardarTodosMedicosSmsRequest,
    ): Promise<ResponseApi<GSResponse<boolean>>> {
        return this.httpClient.putRequest(state.URL, `${BASE}/automaticos/${codigo}/todos-medicos`, payload)
    }

    async getMedicosSelecionados(codigo: string): Promise<ResponseApi<GSResponse<string[]>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/automaticos/${codigo}/medicos`)
    }

    async updateMedicosSelecionados(
        codigo: string,
        payload: GuardarMedicosSmsRequest,
    ): Promise<ResponseApi<GSResponse<boolean>>> {
        return this.httpClient.putRequest(state.URL, `${BASE}/automaticos/${codigo}/medicos`, payload)
    }

    async getHistoricoPaginado(
        payload: HistoricoSmsTabelaFiltro,
    ): Promise<ResponseApi<PaginatedResponse<HistoricoSmsTabelaDTO>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/historico/paginado`, payload)
    }
}
