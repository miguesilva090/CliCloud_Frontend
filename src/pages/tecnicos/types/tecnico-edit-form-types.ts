export interface TecnicoEditFormValues {
  // Identificação básica
  nome: string
  email: string
  numeroContribuinte: string
  observacoes?: string
  status?: number

  // Contactos simples para formulário
  telefone?: string

  // Morada
  paisId: string
  distritoId: string
  concelhoId: string
  freguesiaId: string
  codigoPostalId: string
  rua?: string
  ruaId?: string
  numeroPorta: string
  andarRua: string

  // Dados pessoais mínimos
  dataNascimento?: string
  numeroCartaoIdentificacao?: string
  dataEmissaoCartaoIdentificacao?: string
  arquivo?: string

  // Dados profissionais
  especialidadeId?: string
  carteira?: string
  margem?: string
}

