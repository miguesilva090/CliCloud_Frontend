import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'

export type DocumentoFichaClinicaDTO = {
  id: string
  utenteId: string
  categoria: string
  tipo: string
  descricao: string
  nomeFicheiro: string
  caminhoRelativo: string
  terminacao: string
  createdOn: string
}

export type CreateDocumentoFichaClinicaRequest = {
  utenteId: string
  descricao: string
  categoria?: string
}

export type DeleteMultipleDocumentosFichaClinicaRequest = {
  ids: string[]
}

const BASE = '/client/processo-clinico/documentos-ficha-clinica'

export class DocumentosFichaClinicaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string,
    categoria?: string,
  ): Promise<ResponseApi<GSResponse<DocumentoFichaClinicaDTO[]>>> {
    const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : ''
    return this.httpClient.getRequest<GSResponse<DocumentoFichaClinicaDTO[]>>(
      state.URL,
      `${BASE}/utente/${utenteId}${query}`,
    )
  }

  async upload(
    body: CreateDocumentoFichaClinicaRequest,
    file: File,
  ): Promise<ResponseApi<GSResponse<string>>> {
    const formData = new FormData()
    formData.append('UtenteId', body.utenteId)
    formData.append('Descricao', body.descricao)
    formData.append('Categoria', body.categoria ?? 'Clinico')
    formData.append('file', file)

    return this.httpClient.postRequest<FormData, GSResponse<string>>(
      state.URL,
      `${BASE}/upload`,
      formData,
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }

  async deleteMultiple(
    ids: string[],
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    const payload: DeleteMultipleDocumentosFichaClinicaRequest = { ids }
    return this.httpClient.postRequest<
      DeleteMultipleDocumentosFichaClinicaRequest,
      GSResponse<string[]>
    >(state.URL, `${BASE}/delete-multiple`, payload)
  }
}

