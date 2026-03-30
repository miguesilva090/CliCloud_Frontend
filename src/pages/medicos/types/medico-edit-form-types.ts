/**
 * Tipo do formulário de edição de médico.
 * Alinhado com CreateMedicoRequest / UpdateMedicoRequest e MedicoDTO.
 */
export interface MedicoEditFormValues {
  nome: string
  email: string
  numeroContribuinte: string
  observacoes?: string
  status?: number

  // Dados pessoais (EntidadePessoa)
  dataNascimento?: string
  dataEmissaoCartaoIdentificacao?: string
  dataValidadeCartaoIdentificacao?: string
  sexo?: number | null
  sexoId?: string | null
  estadoCivil?: number | null
  estadoCivilId?: string | null
  nacionalidade?: string
  naturalidade?: string
  numeroCartaoIdentificacao?: string
  /** URL parcial da foto do médico (assets/imagens/...). */
  urlFoto?: string | null
  arquivo?: string
  carteira?: string
  nomeUtilizador?: string
  numeroIdentificacaoBancaria?: string
  /** URL parcial da assinatura do médico (assets/imagens/...). */
  urlFotoAssinatura?: string | null

  // Contactos / Morada
  paisId?: string | null
  distritoId?: string | null
  concelhoId?: string | null
  freguesiaId?: string | null
  codigoPostalId?: string | null
  /** Nome da rua (escrita livre). No envio resolve-se a ruaId quando preenchido. */
  rua?: string
  ruaId?: string | null
  numeroPorta?: string
  andarRua?: string
  indicativoTelefone?: string
  telefone?: string
  telemovel?: string
  fax?: string

  // Médico (Dados Profissionais)
  /** Filtro para especialidade (CategoriaEspecialidade) - não persiste no médico */
  categoriaEspecialidadeId?: string | null
  retencao?: number | null
  director: boolean
  especialidadeId?: string | null
  margem?: number | null
  loginPRVR?: string
  comunicacaoNif: boolean
  comunicacaoNifAdse?: boolean | null
  grupoFuncional?: string
  letra?: string
  cartaoCidadaoMedico: number
  idUtilizador?: string | null
  globalbooking: boolean
}

