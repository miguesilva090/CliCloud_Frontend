export enum EstadoPedidoConsentimento {
  Pendente = 0,
  Cancelado = 1,
  Assinado = 2,
}

export interface PedidoConsentimentoDTO {
  id: string
  instanciaDocumentoId: string
  utenteId?: string
  tipoConsentimento: string
  estado: EstadoPedidoConsentimento
  canal?: string
  expiraEm?: string
  assinadoEm?: string
  assinadoPor?: string
  observacoes?: string
  createdOn: string
}

export interface CriarPedidoConsentimentoRequest {
  instanciaDocumentoId: string
  utenteId?: string
  tipoConsentimento: string
  canal?: string
  expiraEm?: string
}

export interface MarcarPedidoConsentimentoAssinadoRequest {
  assinadoPor?: string
  observacoes?: string
  assinaturaBase64?: string
}
