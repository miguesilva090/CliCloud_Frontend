export interface FichaClinicaSecaoTemplateDTO {
  id: string
  codigo: string
  nome: string
  descricao?: string | null
  ordem: number
  ativo: boolean
  createdOn: string
  lastModifiedOn?: string | null
}

export interface FichaClinicaSecaoCampoDTO {
  id: string
  separadorId: string
  nome: string
  tipoCampo: string
  numeroLinhas: number
  ordem: number
  ativo: boolean
  separadorNome: string
  createdOn: string
  lastModifiedOn?: string | null
}

export interface FichaClinicaSecaoConteudoDTO {
  id: string
  utenteId: string
  campoId: string
  campoNome: string
  separadorId: string
  separadorNome: string
  texto: string
  createdOn: string
  lastModifiedOn?: string | null
}

export interface CreateFichaClinicaSecaoConteudoRequest {
  utenteId: string
  campoId: string
  texto: string
}

export interface UpdateFichaClinicaSecaoConteudoRequest {
  id: string
  texto: string
}

export interface CreateFichaClinicaSecaoCampoRequest {
  separadorId: string
  nome: string
  tipoCampo: string
  numeroLinhas: number
  ordem: number
  ativo: boolean
}

export interface UpdateFichaClinicaSecaoCampoRequest {
  id: string
  nome: string
  tipoCampo: string
  numeroLinhas: number
  ordem: number
  ativo: boolean
}

