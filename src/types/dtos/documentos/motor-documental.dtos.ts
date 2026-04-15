export enum TipoModeloDocumento {
  Generico = 1,
  RgpdDescritivo = 2,
  RgpdConsentimento = 3,
  RgpdMarketing = 4,
}

export interface ModeloDocumentoDTO {
  id: string
  codigo: string
  nome: string
  tipo: TipoModeloDocumento
  versao: number
  ativo: boolean
  conteudoHtml: string
}

export interface CriarModeloDocumentoRequest {
  codigo: string
  nome: string
  tipo: TipoModeloDocumento
  conteudoHtml: string
}

export interface AtualizarModeloDocumentoRequest {
  nome: string
  conteudoHtml: string
  ativo: boolean
}

export interface GerarInstanciaDocumentoRequest {
  modeloDocumentoId: string
  utenteId?: string
  titulo?: string
  marcadores?: Record<string, string>
}

export interface InstanciaDocumentoDTO {
  id: string
  modeloDocumentoId: string
  titulo: string
  conteudoHtml: string
  utenteId?: string
  assinado: boolean
  createdOn: string
}

export interface FicheiroDocumentoDTO {
  id: string
  instanciaDocumentoId: string
  nomeOriginal: string
  nomeArmazenamento: string
  caminhoRelativo: string
  tipoMime: string
  tamanhoBytes: number 
  checksumSha256: string
  createdOn: string
}
