export interface NotificacaoTableDTO {
  id: string
  titulo: string
  estado: number
  prioridade: number
  notificacaoTipoId: string
  tipoDesignacao?: string | null
  remetenteId: string
  destinatarioUtilizadorId?: string | null
  clinicaDestinoId?: string | null
  dataLeitura?: string | null
  lida: boolean
  createdOn: string
}

export interface NotificacaoDTO {
  id: string
  titulo: string
  descricao?: string | null
  estado: number
  prioridade: number
  notificacaoTipoId: string
  tipoDesignacao?: string | null
  remetenteId: string
  destinatarioUtilizadorId?: string | null
  clinicaDestinoId?: string | null
  dataLeitura?: string | null
  leituraPor?: string | null
  createdOn: string
  lastModifiedOn?: string | null
}
