import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarModeloDocumentoRequest,
  CriarModeloDocumentoRequest,
  GerarInstanciaDocumentoRequest,
  InstanciaDocumentoDTO,
  ModeloDocumentoDTO,
  FicheiroDocumentoDTO,
} from '@/types/dtos/documentos/motor-documental.dtos'

const BASE = '/client/documentos/motor'

export class MotorDocumentalClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getModelos(keyword = ''): Promise<ResponseApi<GSResponse<ModeloDocumentoDTO[]>>> {
    const url = keyword.trim()
      ? `${BASE}/modelos?keyword=${encodeURIComponent(keyword.trim())}`
      : `${BASE}/modelos`

    return this.httpClient.getRequest<GSResponse<ModeloDocumentoDTO[]>>(state.URL, url)
  }

  public async getModeloById(id: string): Promise<ResponseApi<GSResponse<ModeloDocumentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<ModeloDocumentoDTO>>(state.URL, `${BASE}/modelos/${id}`)
  }

  public async createModelo(
    body: CriarModeloDocumentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CriarModeloDocumentoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/modelos`,
      body
    )
  }

  public async updateModelo(
    id: string,
    body: AtualizarModeloDocumentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<AtualizarModeloDocumentoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/modelos/${id}`,
      body
    )
  }

  public async publicarNovaVersaoModelo(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<undefined, GSResponse<string>>(
      state.URL,
      `${BASE}/modelos/${id}/publicar`,
      undefined
    )
  }

  public async gerarInstancia(
    body: GerarInstanciaDocumentoRequest
  ): Promise<ResponseApi<GSResponse<InstanciaDocumentoDTO>>> {
    return this.httpClient.postRequest<GerarInstanciaDocumentoRequest, GSResponse<InstanciaDocumentoDTO>>(
      state.URL,
      `${BASE}/instancias/gerar`,
      body
    )
  }

  public async deleteModelo(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/modelos/${id}`)
  }

  public async getInstancias(modeloId?: string): Promise<ResponseApi<GSResponse<InstanciaDocumentoDTO[]>>> {
    const url = modeloId
      ? `${BASE}/instancias?modeloId=${modeloId}`
      : `${BASE}/instancias`
    return this.httpClient.getRequest<GSResponse<InstanciaDocumentoDTO[]>>(state.URL, url)
  }

  public getDownloadModeloDocxUrl(id: string): string {
    return `${state.URL}${BASE}/modelos/${id}/download-docx`
  }

  public getDownloadInstanciaDocxUrl(id: string): string {
    return `${state.URL}${BASE}/instancias/${id}/download-docx`
  }

  /** @deprecated Use getDownloadModeloDocxUrl instead */
  public getDownloadDocxUrl(id: string): string {
    return this.getDownloadModeloDocxUrl(id)
  }

  public async getFicheirosInstancia(
    instanciaId: string 
  ): Promise<ResponseApi<GSResponse<FicheiroDocumentoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<FicheiroDocumentoDTO[]>>(
      state.URL,
      `${BASE}/instancias/${instanciaId}/ficheiros`
    )
  }

  public async uploadFicheiroInstancia(
    instanciaId: string,
    file: File
  ): Promise<ResponseApi<GSResponse<FicheiroDocumentoDTO>>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.httpClient.postRequest<FormData, GSResponse<FicheiroDocumentoDTO>>(
      state.URL,
      `${BASE}/instancias/${instanciaId}/ficheiros/upload`,
      formData
    )
  }

  public async deleteFicheiro(
    ficheiroId: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/ficheiros/${ficheiroId}`
    )
  }

  public getDownloadFicheiroUrl(ficheiroId: string): string {
    return `${state.URL}${BASE}/ficheiros/${ficheiroId}/download`
  }
}
