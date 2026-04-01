import type { PaginationFilterRequest, TableFilter } from '@/types/dtos/common/table-filters.dtos'
import type { ConfiguracaoTratamentosDTO } from '@/types/dtos/core/configuracao-tratamentos.dtos'

export interface ClinicaDTO {
  id: string
  nome: string
  nomeComercial?: string | null
  abreviatura?: string | null
  porDefeito?: boolean

  // Configuração de Tratamentos unificada na carga da Clínica
  configuracaoTratamentos?: ConfiguracaoTratamentosDTO | null

  // Identificação (tab_1_1)
  morada?: string | null
  ccPostal?: string | null
  localidade?: string | null
  indicativoTelefone?: string | null
  telefone?: string | null
  telemovel?: string | null
  fax?: string | null
  email?: string | null
  web?: string | null
  sucursal?: string | null
  numeroContribuinte?: string | null
  nib?: string | null
  observacoes?: string | null
  urlFoto?: string | null

  // Dados Fiscais (tab_1_2)
  atividade?: string | null
  regcom?: string | null
  capsocial?: number | null
  cae?: string | null
  zonFisc?: ZonaFiscal | null
  tipo?: string | null
  portaria?: string | null
  despachoUcc?: string | null
  obsNotaCredito?: string | null
  cmoeda?: string | null

  // Faturação (tab_1_3)
  faturaRecibo?: number | null
  imprimeTicket?: boolean | null
  temSaft?: boolean | null
  cab?: boolean | null
  faturacaoDocumentosImpressao?: string | null
  emailLink?: boolean | null

  linha1?: string | null
  linha2?: string | null
  linha3?: string | null
  linha4?: string | null
  linha5?: string | null
  linha6?: string | null

  regrafaturacao?: string | null
  motivoIsencaoDefeito?: string | null
  valorMaxFaturaSimpli?: number | null
  armazemHabitual?: string | null
  atUser?: string | null
  atPass?: string | null

  // ---- Horário de Funcionamento (tab_1_5 de ClinicasEdt.aspx) ----
  interrupcao?: boolean | null
  horaInicManha?: string | null
  horaFimManha?: string | null
  horaInicTarde?: string | null
  horaFimTarde?: string | null
  folgaSeg?: boolean | null
  folgaTer?: boolean | null
  folgaQua?: boolean | null
  folgaQui?: boolean | null
  folgaSex?: boolean | null
  folgaSab?: boolean | null
  folgaDom?: boolean | null

  // ---- Outros Parâmetros (tab_1_4) ----
  descarga?: number | null
  ruptura?: number | null
  valorart?: number | null

  tiporecal?: number | null
  valorecal?: number | null

  controlarPlafond?: boolean | null
  ctrlPlafond?: number | null

  validade?: boolean | null
  diasvalid?: number | null
  ligacb?: boolean | null

  entidadeUtilizadora?: string | null
  localPrescricao?: string | null
  nomeEtiqueta?: string | null
  codSb?: string | null
  netiquetas?: number | null
  cccCodLocalEmissao?: number | null
  cccDescLocalEmissao?: string | null
  regiao?: string | null
  cid?: number | null
  portaLeitorCartoes?: number | null
  stocksColunaStockReal?: boolean | null

  calendarioMarcacoesRadio?: number | null
  novoEstadoPaginaAtendimento?: boolean | null
  novaPrescricao?: boolean | null
  gestaoSalas?: boolean | null

  tipoAdmissPorDefeito?: number | null
  diretoriaDocumentos?: string | null
  caminhoSaft?: string | null

  exportContabilidadeFa?: string | null
  exportTipoContaFa?: string | null
  exportPredUtenteFa?: number | null

  exportContabilidadeFr?: string | null
  exportTipoContaFr?: string | null
  exportPredUtenteFr?: number | null

  labelAuxiliares?: string | null
  envioEmail?: number | null
  movimentosInternos?: boolean | null

  msgFaltaPagamento?: string | null
  msgCredenciais?: string | null
  kqueueAvisoAtraso?: boolean | null
  kqueueTempoAvisoAtraso?: number | null
  kqueueMensagemAvisoAtraso?: string | null

  /** Legado: Consen_RGPD / AutenticacaoEmpresa (ClinicasEdt tab RGPD) */
  rgpdDescritivo?: string | null
  rgpdConsentimento?: string | null
  rgpdMarketing?: string | null

  /** Legado: EmpresasEmails (Assunto_*, Cont_*) */
  emailAssuntoConsultas?: string | null
  emailConteudoConsultas?: string | null
  emailAssuntoTratamentos?: string | null
  emailConteudoTratamentos?: string | null
  emailAssuntoExames?: string | null
  emailConteudoExames?: string | null
  emailAssuntoRelatorios?: string | null
  emailConteudoRelatorios?: string | null

  createdOn?: string
  lastModifiedOn?: string | null
}

export interface AutoCompleteItemDTO {
  value: string
  label: string
}

export interface UpdateClinicaRequest {
  nome: string
  nomeComercial?: string | null
  abreviatura?: string | null

  // Identificação (tab_1_1)
  morada?: string | null
  ccPostal?: string | null
  localidade?: string | null
  indicativoTelefone?: string | null
  telefone?: string | null
  telemovel?: string | null
  fax?: string | null
  email?: string | null
  web?: string | null
  sucursal?: string | null
  numeroContribuinte?: string | null
  nib?: string | null
  observacoes?: string | null
  urlFoto?: string | null

  // Dados Fiscais (tab_1_2)
  atividade?: string | null
  regcom?: string | null
  capsocial?: number | null
  cae?: string | null
  zonFisc?: ZonaFiscal | null
  tipo?: string | null
  portaria?: string | null
  despachoUcc?: string | null
  obsNotaCredito?: string | null
  cmoeda?: string | null

  // Faturação (tab_1_3)
  faturaRecibo?: number | null
  imprimeTicket?: boolean | null
  temSaft?: boolean | null
  cab?: boolean | null
  faturacaoDocumentosImpressao?: string | null
  emailLink?: boolean | null

  linha1?: string | null
  linha2?: string | null
  linha3?: string | null
  linha4?: string | null
  linha5?: string | null
  linha6?: string | null

  regrafaturacao?: string | null
  motivoIsencaoDefeito?: string | null
  valorMaxFaturaSimpli?: number | null
  armazemHabitual?: string | null
  atUser?: string | null
  atPass?: string | null

  // ---- Horário de Funcionamento (tab_1_5 de ClinicasEdt.aspx) ----
  interrupcao?: boolean | null
  horaInicManha?: string | null
  horaFimManha?: string | null
  horaInicTarde?: string | null
  horaFimTarde?: string | null
  folgaSeg?: boolean | null
  folgaTer?: boolean | null
  folgaQua?: boolean | null
  folgaQui?: boolean | null
  folgaSex?: boolean | null
  folgaSab?: boolean | null
  folgaDom?: boolean | null

  // ---- Outros Parâmetros (tab_1_4) ----
  descarga?: number | null
  ruptura?: number | null
  valorart?: number | null

  tiporecal?: number | null
  valorecal?: number | null

  controlarPlafond?: boolean | null
  ctrlPlafond?: number | null

  validade?: boolean | null
  diasvalid?: number | null
  ligacb?: boolean | null

  entidadeUtilizadora?: string | null
  localPrescricao?: string | null
  nomeEtiqueta?: string | null
  codSb?: string | null
  netiquetas?: number | null
  cccCodLocalEmissao?: number | null
  cccDescLocalEmissao?: string | null
  regiao?: string | null
  cid?: number | null
  portaLeitorCartoes?: number | null
  stocksColunaStockReal?: boolean | null

  calendarioMarcacoesRadio?: number | null
  novoEstadoPaginaAtendimento?: boolean | null
  novaPrescricao?: boolean | null
  gestaoSalas?: boolean | null

  tipoAdmissPorDefeito?: number | null
  diretoriaDocumentos?: string | null
  caminhoSaft?: string | null

  exportContabilidadeFa?: string | null
  exportTipoContaFa?: string | null
  exportPredUtenteFa?: number | null

  exportContabilidadeFr?: string | null
  exportTipoContaFr?: string | null
  exportPredUtenteFr?: number | null

  labelAuxiliares?: string | null
  envioEmail?: number | null
  movimentosInternos?: boolean | null

  msgFaltaPagamento?: string | null
  msgCredenciais?: string | null
  kqueueAvisoAtraso?: boolean | null
  kqueueTempoAvisoAtraso?: number | null
  kqueueMensagemAvisoAtraso?: string | null

  rgpdDescritivo?: string | null
  rgpdConsentimento?: string | null
  rgpdMarketing?: string | null

  emailAssuntoConsultas?: string | null
  emailConteudoConsultas?: string | null
  emailAssuntoTratamentos?: string | null
  emailConteudoTratamentos?: string | null
  emailAssuntoExames?: string | null
  emailConteudoExames?: string | null
  emailAssuntoRelatorios?: string | null
  emailConteudoRelatorios?: string | null

  // ---- Tratamentos (unificado no update da Clínica) ----
  gravarConfiguracaoTratamentos?: boolean | null
  tipoSrvTratamentos?: string | null
  areaPrestacaoDefeitoAreaZ?: string | null
  controlarAparelhos?: boolean | null
  segundos?: number | null
  faltasMax?: number | null
  faltasConsecutivasMax?: number | null
  taxamoderadora?: number | null
  credencialExternaAdse?: boolean | null
  tipoPagamento?: number | null
  avisoInqueritoSessoesDiarias?: boolean | null
}

export enum ZonaFiscal {
  Continente = 1, 
  Madeira = 2,
  Acores = 3,
}

export interface ClinicaTableDTO {
  id: string
  nome?: string | null
  nomeComercial?: string | null
  abreviatura?: string | null
  porDefeito?: boolean
  createdOn: string
}

export interface ClinicaTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

