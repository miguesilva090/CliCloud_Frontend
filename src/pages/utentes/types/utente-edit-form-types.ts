/**
 * Tipo do formulário de edição de utente.
 * Usado na página e nos tabs para evitar incompatibilidade UseFormReturn.
 */
export interface UtenteEditFormValues {
  nome: string
  email?: string
  numeroContribuinte: string
  numeroUtente?: string
  observacoes: string
  status: number
  /** Flag apenas para UI: se false, nenhum dos botões de status aparece selecionado. */
  statusSelecionado?: boolean
  aviso?: string
  desistencia?: boolean
  tipoConsulta?: number

  // Dados pessoais
  dataNascimento?: string
  dataEmissaoCartaoIdentificacao?: string
  dataValidadeCartaoIdentificacao?: string
  sexoId?: string | null
  estadoCivilId?: string | null
  habilitacaoId?: string | null
  grupoSanguineoId?: string | null
  cronico?: boolean
  numeroCartaoIdentificacao?: string
  nomeMae?: string
  nomePai?: string
  naturalidade?: string
  nacionalidade?: string
  profissaoId?: string | null
  arquivo?: string
  ccValidado?: number | null
  ccDataValidacao?: string

  // Contactos – Morada (obrigatório no backend)
  paisId: string
  distritoId: string
  concelhoId: string
  freguesiaId: string
  codigoPostalId: string
  /** Nome da rua (escrita livre). No envio resolve-se a ruaId (encontrar ou criar). */
  rua: string
  /** Id da rua (preenchido ao carregar ou ao criar via modal). */
  ruaId: string
  numeroPorta: string
  andarRua: string
  morada?: string
  indicativoTelefone?: string
  telefone?: string
  telemovel?: string

  // Informação SNS
  numeroSegurancaSocial?: string
  tipoTaxaModeradora?: number | null
  migrante?: boolean
  nDocMigrante?: string
  condicaoSns?: number | null
  entidadeFinanceiraResponsavelId?: string | null
  numeroBeneficiarioEfr?: string | null
  dataValidadeEfr?: string
  migranteTipoCartao?: string

  // Outras Informações
  provenienciaUtenteId?: string | null

  // Subsistema de Saúde (um organismo e uma seguradora por utente)
  organismoId?: string | null
  seguradoraId?: string | null
  /** Linhas da tabela Subsistema de Saúde (organismo, beneficiário, apólice, etc.). */
  subsistemaLinhas?: SubsistemaLinhaFormItem[]
  /** Empresa associada ao utente (valor "em cima", independente das linhas do subsistema). */
  empresaId?: string | null

  // Informação SNS
  centroSaudeId?: string | null
  medicoExternoId?: string | null
  medicoId?: string | null
}

export interface SubsistemaLinhaFormItem {
  organismoId?: string | null
  designacao?: string
  numeroBeneficiario?: string
  sigla?: string
  nomeBeneficiario?: string
  dataCartao?: string
  numeroApolice?: string
  empresaId?: string | null
  /** Apenas para exibição ao editar (vem do backend); não é enviado no save. */
  empresaNome?: string
}

