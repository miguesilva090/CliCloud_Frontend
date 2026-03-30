export interface FornecedorEditFormValues {
  nome: string
  email: string
  numeroContribuinte: string
  observacoes: string
  status: number
  telefone: string
  // Morada (sem Código, sem Zona)
  paisId: string
  distritoId: string
  concelhoId: string
  freguesiaId: string
  codigoPostalId: string
  rua: string
  ruaId: string
  numeroPorta: string
  andarRua: string
  // Outros
  numeroConta: string
  plafond: string
  desconto: string
  condicaoPagamento: string
  moeda: string
  numeroNib: string
  enderecoWeb: string
  diasPrevEntrega: string
  diasEfectiEntrega: string
  origem: string
}

