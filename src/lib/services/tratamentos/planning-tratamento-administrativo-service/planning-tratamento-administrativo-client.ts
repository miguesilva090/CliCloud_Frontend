import state from "@/states/state";
import { BaseApiClient } from "@/lib/base-client";
import type { ResponseApi } from "@/types/responses";
import type { GSResponse } from "@/types/api/responses";
import type {
    PlanningSessoesRequest,
    PlanningSessoesResponse,
} from "@/types/dtos/tratamentos/planning-tratamento.dtos";

const BASE = "/client/tratamentos/PlanningTratamentoAdministrativo";

export class PlanningTratamentoAdministrativoClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade);
    }

    async getSessoes(
        body: PlanningSessoesRequest
    ): Promise<ResponseApi<GSResponse<PlanningSessoesResponse>>> {
        return this.httpClient.postRequest<
            PlanningSessoesRequest,
            GSResponse<PlanningSessoesResponse>
        >(state.URL, `${BASE}/sessoes`, body)
    }
}

export function PlanningTratamentoAdministrativoService(
    idFuncionalidade = 'PClinico_Tratamentos'
) {
    return new PlanningTratamentoAdministrativoClient(idFuncionalidade);
}