export type TrocaMarcacoesMedicosRequest = {
  medicoOrigemId: string
  medicoDestinoId: string
  dataOrigem: string
  dataDestino: string
}

export type TrocaMarcacoesMedicosDTO = {
  marcacaoId: string
  utenteNome?: string | null
  utenteNumero?: number | null
  horaInicio?: string | null
  especialidadeDesignacao?: string | null
}

export type TrocaMarcacoesMedicosConflitoDTO = {
  marcacaoId?: string | null
  utenteNome?: string | null
  horaInicio?: string | null
  codigo: string
  mensagem: string
}

export type TrocaMarcacoesMedicosPreviewDTO = {
  totalOrigem: number
  podeExecutar: boolean
  itens: TrocaMarcacoesMedicosDTO[]
  conflitos: TrocaMarcacoesMedicosConflitoDTO[]
}

export type TrocaMarcacoesMedicosResultDTO = {
  quantidadeTransferida: number
  marcacaoIds: string[]
  quantidadeAdmissoesAtualizadas: number
}
