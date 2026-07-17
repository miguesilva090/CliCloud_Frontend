import state from "@/states/state"
import type { GSResponse } from "@/types/api/responses"
import type { ResponseApi } from "@/types/responses"
import { BaseApiClient } from "@/lib/base-client"
import type {
    MedicamentoAutocompleteItemDto,
    MedicamentoListagemResumoResultDto,
    MedicamentoPrescricaoLinhaDto,
    MedicamentoPrescricaoOpcaoDto,
    MedicamentosListagemParams,
} from "@/types/dtos/prescricao/medicamentos-infarmed.dtos"

const BASE = "/client/prescricao/medicamentos"

function buildQuery(
    params: Record<string, string | number | boolean | undefined | null >
) {
    const qs = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return
        qs.set(key, String(value))
    })

    const query = qs.toString()
    return query ? `?${query}` : ''
}

export class MedicamentosInfarmedClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    public async autocomplete(
        q: string,
        tipoReceita?: number,
        prescritivel?: boolean,
    ) : Promise<ResponseApi<GSResponse<MedicamentoAutocompleteItemDto[]>>> {
        const url = 
        `${BASE}/autocomplete` + 
        buildQuery({
            q, 
            tipoReceita,
            prescritivel,
        })

        return this.httpClient.getRequest<GSResponse<MedicamentoAutocompleteItemDto[]>>(
            state.URL,
            url
        )
    }

    public async listagemResumo(
        params: MedicamentosListagemParams
    ): Promise<ResponseApi<GSResponse<MedicamentoListagemResumoResultDto>>> {
        const url = 
        BASE +
        buildQuery({
            nome: params.nome,
            tipo: params.tipo ?? 10,
            page: params.page ?? 1,
            contar: params.contar ?? false,
            tipoReceita: params.tipoReceita,
            prescritivel: params.prescritivel,
        })

        return this.httpClient.getRequest<GSResponse<MedicamentoListagemResumoResultDto>>(
            state.URL,
            url
        )
    }

    public async getPrescricaoByEmbId(
        embId: string,
        patologias?: string
    ): Promise<ResponseApi<GSResponse<MedicamentoPrescricaoLinhaDto>>> {
        const url = 
        `${BASE}/embalagem/${encodeURIComponent(embId)}/prescricao` +
        buildQuery({ patologias })

        return this.httpClient.getRequest<GSResponse<MedicamentoPrescricaoLinhaDto>>(
            state.URL,
            url
        )
    }

    public async getPrescricaoByCnpem(
        cnpem: string,
        nrRegisto?: string,
        patologias?: string
    ): Promise<ResponseApi<GSResponse<MedicamentoPrescricaoLinhaDto>>> {
        const url = 
        `${BASE}/cnpem/${encodeURIComponent(cnpem)}/prescricao` +
        buildQuery({ nrRegisto, patologias })


        return this.httpClient.getRequest<GSResponse<MedicamentoPrescricaoLinhaDto>>(
            state.URL, 
            url
        )
    }

    public async getEquivalentesByCnpem(
        cnpem: string,
        patologias?: string
    ): Promise<ResponseApi<GSResponse<MedicamentoPrescricaoOpcaoDto[]>>> {
        const url = 
        `${BASE}/cnpem/${encodeURIComponent(cnpem)}/equivalentes` +
        buildQuery({ patologias })

        return this.httpClient.getRequest<GSResponse<MedicamentoPrescricaoOpcaoDto[]>>(
            state.URL, 
            url
        )
    }
}