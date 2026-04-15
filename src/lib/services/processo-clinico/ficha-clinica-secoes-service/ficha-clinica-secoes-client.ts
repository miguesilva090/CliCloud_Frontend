import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  FichaClinicaSecaoConteudoDTO,
  FichaClinicaSecaoTemplateDTO,
  FichaClinicaSecaoCampoDTO,
  CreateFichaClinicaSecaoConteudoRequest,
  UpdateFichaClinicaSecaoConteudoRequest,
  CreateFichaClinicaSecaoCampoRequest,
  UpdateFichaClinicaSecaoCampoRequest,
} from '@/types/dtos/processo-clinico/ficha-clinica-secoes.dtos'

const TEMPLATE_BASE = '/client/processo-clinico/FichaClinicaSecaoTemplate'
const CAMPO_BASE = '/client/processo-clinico/FichaClinicaSecaoCampo'
const CONTEUDO_BASE = '/client/processo-clinico/FichaClinicaSecaoConteudo'

export class FichaClinicaSecoesClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getTemplates(keyword = ''): Promise<ResponseApi<FichaClinicaSecaoTemplateDTO[]>> {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<FichaClinicaSecaoTemplateDTO[]>(
      state.URL,
      `${TEMPLATE_BASE}${query}`,
    )
  }

  async getConteudos(keyword = ''): Promise<ResponseApi<FichaClinicaSecaoConteudoDTO[]>> {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<FichaClinicaSecaoConteudoDTO[]>(
      state.URL,
      `${CONTEUDO_BASE}${query}`,
    )
  }

  async getConteudosByUtenteAndSeparador(
    utenteId: string,
    separadorId: string,
  ): Promise<ResponseApi<FichaClinicaSecaoConteudoDTO[]>> {
    return this.httpClient.getRequest<FichaClinicaSecaoConteudoDTO[]>(
      state.URL,
      `${CONTEUDO_BASE}/utente/${utenteId}/separador/${separadorId}`,
    )
  }

  async upsertConteudosLote(body: {
    utenteId: string
    separadorId: string
    itens: Array<{ campoId: string; texto: string }>
  }): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<
      { utenteId: string; separadorId: string; itens: Array<{ campoId: string; texto: string }> },
      { data?: string }
    >(state.URL, `${CONTEUDO_BASE}/upsert-lote`, body)
  }

  async createConteudo(
    body: CreateFichaClinicaSecaoConteudoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateFichaClinicaSecaoConteudoRequest, { data?: string }>(
      state.URL,
      CONTEUDO_BASE,
      body,
    )
  }

  async updateConteudo(
    id: string,
    body: UpdateFichaClinicaSecaoConteudoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateFichaClinicaSecaoConteudoRequest, { data?: string }>(
      state.URL,
      `${CONTEUDO_BASE}/${id}`,
      body,
    )
  }

  async createTemplate(
    body: Omit<FichaClinicaSecaoTemplateDTO, 'id' | 'createdOn' | 'lastModifiedOn'>,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<
      Omit<FichaClinicaSecaoTemplateDTO, 'id' | 'createdOn' | 'lastModifiedOn'>,
      { data?: string }
    >(state.URL, TEMPLATE_BASE, body)
  }

  async updateTemplate(
    id: string,
    body: { nome: string; descricao?: string; ordem: number; ativo: boolean },
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<
      { nome: string; descricao?: string; ordem: number; ativo: boolean },
      { data?: string }
    >(state.URL, `${TEMPLATE_BASE}/${id}`, body)
  }

  async deleteTemplate(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${TEMPLATE_BASE}/${id}`)
  }

  async deleteMultipleTemplates(ids: string[]): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequestWithBody<string[], { data?: string }>(
      state.URL,
      `${TEMPLATE_BASE}/bulk`,
      ids,
    )
  }

  async getCamposBySeparador(
    separadorId: string,
    keyword = '',
  ): Promise<ResponseApi<FichaClinicaSecaoCampoDTO[]>> {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<FichaClinicaSecaoCampoDTO[]>(
      state.URL,
      `${CAMPO_BASE}/por-separador/${separadorId}${query}`,
    )
  }

  async createCampo(
    body: CreateFichaClinicaSecaoCampoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateFichaClinicaSecaoCampoRequest, { data?: string }>(
      state.URL,
      CAMPO_BASE,
      body,
    )
  }

  async updateCampo(
    id: string,
    body: UpdateFichaClinicaSecaoCampoRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateFichaClinicaSecaoCampoRequest, { data?: string }>(
      state.URL,
      `${CAMPO_BASE}/${id}`,
      body,
    )
  }

  async deleteCampo(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${CAMPO_BASE}/${id}`)
  }

  async deleteMultipleCampos(ids: string[]): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequestWithBody<string[], { data?: string }>(
      state.URL,
      `${CAMPO_BASE}/bulk`,
      ids,
    )
  }
}

