import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MargemMedicoDTO,
  MargemMedicoLightDTO,
  MargemMedicoTableDTO,
  MargemMedicoTableFilterRequest,
  MargemMedicoAllFilterRequest,
  CreateMargemMedicoRequest,
  UpdateMargemMedicoRequest,
  DeleteMultipleMargemMedicoRequest,
} from '@/types/dtos/saude/margem-medico.dtos'

const BASE = '/client/medicos/MargemMedico'

export class MargemMedicoClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    public async getMargemMedicoLight(
        keyword = ''
    ): Promise<ResponseApi<GSResponse<MargemMedicoLightDTO[]>>> {
        const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<MargemMedicoLightDTO[]>>(state.URL, url)
    }

    public async getMargemMedicoPaginated(
        params: MargemMedicoTableFilterRequest
    ): Promise<ResponseApi<PaginatedResponse<MargemMedicoTableDTO>>> {
        return this.httpClient.postRequest<
            MargemMedicoTableFilterRequest,
            PaginatedResponse<MargemMedicoTableDTO>
        >(state.URL, `${BASE}/paginated`, params)
    }

    public async getAllMargemMedico(
        body: MargemMedicoAllFilterRequest
    ): Promise<ResponseApi<GSResponse<MargemMedicoTableDTO[]>>> {
        return this.httpClient.postRequest<
            MargemMedicoAllFilterRequest,
            GSResponse<MargemMedicoTableDTO[]>
        >(state.URL, `${BASE}/all`, body)
    }

    public async getMargemMedico(
        id: string
    ): Promise<ResponseApi<GSResponse<MargemMedicoDTO>>> {
        return this.httpClient.getRequest<GSResponse<MargemMedicoDTO>>(
            state.URL,
            `${BASE}/${id}`
        )
    }

    public async getMargemMedicoByMedicoId(
        medicoId: string 
    ): Promise<ResponseApi<GSResponse<MargemMedicoDTO[]>>> {
        return this.httpClient.getRequest<GSResponse<MargemMedicoDTO[]>>(
            state.URL, 
            `${BASE}/medico/${medicoId}`
        )
    }

    public async createMargemMedico(
        body: CreateMargemMedicoRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<
            CreateMargemMedicoRequest,
            GSResponse<string>>(
                state.URL, 
                BASE, 
                body
        )
    }


    public async updateMargemMedico(
        id: string,
        body: UpdateMargemMedicoRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<
            UpdateMargemMedicoRequest, 
            GSResponse<string>>(
                state.URL, 
                `${BASE}/${id}`,
                body
        )
    }

    public async deleteMargemMedico(
        id: string
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<
            GSResponse<string>>(
                state.URL, 
                `${BASE}/${id}`
        )
    }

    public async deleteMultipleMargemMedico(
        body: DeleteMultipleMargemMedicoRequest
    ): Promise<ResponseApi<GSResponse<string[]>>> {
        return this.httpClient.deleteRequestWithBody<
            DeleteMultipleMargemMedicoRequest,
            GSResponse<string[]>
        >(state.URL, `${BASE}/bulk`, body)
    }
}