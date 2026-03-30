import { z } from 'zod'

export type ClinicaEditFormValues = {
  nome: string
  nomeComercial: string
  abreviatura: string

  // Identificação (tab_1_1)
  morada: string
  ccPostal: string
  localidade: string
  indicativoTelefone: string
  telefone: string
  telemovel: string
  fax: string
  email: string
  web: string
  sucursal: string
  numeroContribuinte: string
  nib: string
  observacoes: string
  urlFoto: string

  // Dados Fiscais (tab_1_2)
  atividade: string
  regcom: string
  capsocial: string
  cae: string
  zonFisc: string
  tipo: string
  portaria: string
  despachoUcc: string
  obsNotaCredito: string
  cmoeda: string

  // Faturação (tab_1_3)
  faturaRecibo: string
  imprimeTicket: boolean
  temSaft: boolean
  cab: boolean
  faturacaoDocumentosImpressao: string
  emailLink: boolean

  linha1: string
  linha2: string
  linha3: string
  linha4: string
  linha5: string
  linha6: string

  regrafaturacao: string
  motivoIsencaoDefeito: string
  valorMaxFaturaSimpli: string
  armazemHabitual: string
  atUser: string
  atPass: string

  // Horário (tab_1_5)
  interrupcao: boolean
  horaInicManha: string
  horaFimManha: string
  horaInicTarde: string
  horaFimTarde: string
  folgaSeg: boolean
  folgaTer: boolean
  folgaQua: boolean
  folgaQui: boolean
  folgaSex: boolean
  folgaSab: boolean
  folgaDom: boolean

  // ---- Outros Parâmetros (tab_1_4) ----
  descarga: string
  ruptura: string
  valorart: string
  tiporecal: string
  valorecal: string

  controlarPlafond: boolean
  ctrlPlafond: string
  validade: boolean
  diasvalid: string
  ligacb: boolean

  entidadeUtilizadora: string
  localPrescricao: string
  nomeEtiqueta: string
  codSb: string
  netiquetas: string
  cccCodLocalEmissao: string
  cccDescLocalEmissao: string
  regiao: string

  cid: string

  portaLeitorCartoes: string
  stocksColunaStockReal: boolean

  calendarioMarcacoesRadio: string
  ativoNovaPagina: boolean
  novaPrescricao: boolean
  gestaoSalas: boolean

  tipoAdmissPorDefeito: string
  diretoriaDocumentos: string
  caminhoSaft: string

  exportContabilidadeFa: string
  exportTipoContaFa: string
  exportPredUtenteFa: string
  exportContabilidadeFr: string
  exportTipoContaFr: string
  exportPredUtenteFr: string

  labelAuxiliares: string
  envioEmail: string
  movimentosInternos: boolean

  msgFaltaPagamento: string
  msgCredenciais: string
  kqueueAvisoAtraso: boolean
  kqueueTempoAvisoAtraso: string
  kqueueMensagemAvisoAtraso: string

  rgpdDescritivo: string
  rgpdConsentimento: string
  rgpdMarketing: string

  emailAssuntoConsultas: string
  emailConteudoConsultas: string
  emailAssuntoTratamentos: string
  emailConteudoTratamentos: string
  emailAssuntoExames: string
  emailConteudoExames: string
  emailAssuntoRelatorios: string
  emailConteudoRelatorios: string
}

export const clinicaEditSchema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório').max(200),
    nomeComercial: z.string().max(60).optional(),
    abreviatura: z.string().max(30).optional(),
    numeroContribuinte: z.string().max(20).optional(),

    // Identificação (tab_1_1) - opcionais
    morada: z.string().max(50).optional(),
    ccPostal: z.string().max(20).optional(),
    localidade: z.string().max(50).optional(),
    indicativoTelefone: z.string().max(10).optional(),
    telefone: z.string().max(20).optional(),
    telemovel: z.string().max(15).optional(),
    fax: z.string().max(20).optional(),
    email: z.string().max(255).optional(),
    web: z.string().max(255).optional(),
    sucursal: z.string().max(10).optional(),
    nib: z.string().max(21).optional(),
    observacoes: z.string().max(2000).optional(),
    urlFoto: z.string().max(500).optional(),

    // Dados Fiscais (tab_1_2)
    cmoeda: z.string().max(50).optional(),
    atividade: z.string().max(50).optional(),
    regcom: z.string().max(50).optional(),
    capsocial: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v.trim() === '' || !Number.isNaN(Number(v)),
        'Capitalsocial inválido',
      ),
    cae: z.string().max(5).optional(),
    zonFisc: z.string().max(50).optional(),
    tipo: z.string().max(200).optional(),
    portaria: z.string().max(254).optional(),
    despachoUcc: z.string().max(250).optional(),
    obsNotaCredito: z.string().max(250).optional(),

    // Faturação (tab_1_3) - opcionais (sem NotEmpty)
    faturaRecibo: z.string().max(10).optional(),
    imprimeTicket: z.boolean().optional(),
    temSaft: z.boolean().optional(),
    cab: z.boolean().optional(),
    faturacaoDocumentosImpressao: z.string().max(30).optional(),
    emailLink: z.boolean().optional(),

    linha1: z.string().max(120).optional(),
    linha2: z.string().max(120).optional(),
    linha3: z.string().max(120).optional(),
    linha4: z.string().max(120).optional(),
    linha5: z.string().max(120).optional(),
    linha6: z.string().max(120).optional(),

    regrafaturacao: z.string().max(10).optional(),
    motivoIsencaoDefeito: z.string().max(50).optional(),
    valorMaxFaturaSimpli: z
      .string()
      .optional()
      .refine(
        (v) =>
          v === undefined || v.trim() === '' || !Number.isNaN(Number(v)),
        'Valor max fatura inválido',
      ),
    armazemHabitual: z.string().max(50).optional(),
    atUser: z.string().max(200).optional(),
    atPass: z.string().max(200).optional(),

    // Outros Parâmetros (tab_1_4)
    movimentosInternos: z.boolean().optional(),
    stocksColunaStockReal: z.boolean().optional(),
    portaLeitorCartoes: z
      .string()
      // No legado este campo pode ser deixado em branco (representa "sem configuração").
      // Para não bloquear gravações em outras abas, só validamos quando o utilizador preencher.
      .refine((v) => v.trim() === '' || /^\d+$/.test(v.trim()), 'Porta inválida'),

    msgFaltaPagamento: z.string().max(5000).optional(),
    msgCredenciais: z.string().max(5000).optional(),

    // Kqueue (tab_1_4)
    kqueueAvisoAtraso: z.boolean().optional(),
    kqueueTempoAvisoAtraso: z.string().optional(),
    kqueueMensagemAvisoAtraso: z.string().optional(),
  })
  .passthrough()
  .superRefine((vals, ctx) => {
    const kqueueAviso = !!vals.kqueueAvisoAtraso
    if (!kqueueAviso) return

    const tempo = vals.kqueueTempoAvisoAtraso?.trim() ?? ''
    if (!tempo || !/^\d+$/.test(tempo) || Number(tempo) <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['kqueueTempoAvisoAtraso'],
        message: 'Indique os minutos para atraso',
      })
    }

    const mensagem = vals.kqueueMensagemAvisoAtraso?.trim() ?? ''
    if (!mensagem) {
      ctx.addIssue({
        code: 'custom',
        path: ['kqueueMensagemAvisoAtraso'],
        message: 'Indique a mensagem de aviso para atraso',
      })
    }
  })

export const clinicaEditDefaultValues: ClinicaEditFormValues = {
  nome: '',
  nomeComercial: '',
  abreviatura: '',

  // Identificação (tab_1_1)
  morada: '',
  ccPostal: '',
  localidade: '',
  indicativoTelefone: '351',
  telefone: '',
  telemovel: '',
  fax: '',
  email: '',
  web: '',
  sucursal: '',
  numeroContribuinte: '',
  nib: '',
  observacoes: '',
  urlFoto: '',

  // Dados Fiscais (tab_1_2)
  atividade: '',
  regcom: '',
  capsocial: '',
  cae: '',
  zonFisc: '',
  tipo: '',
  portaria: '',
  despachoUcc: '',
  obsNotaCredito: '',
  cmoeda: '',

  // Faturação (tab_1_3)
  faturaRecibo: '1',
  imprimeTicket: false,
  temSaft: false,
  cab: false,
  faturacaoDocumentosImpressao: '',
  emailLink: false,

  linha1: '',
  linha2: '',
  linha3: '',
  linha4: '',
  linha5: '',
  linha6: '',

  regrafaturacao: '1',
  motivoIsencaoDefeito: '',
  valorMaxFaturaSimpli: '',
  armazemHabitual: '',
  atUser: '',
  atPass: '',

  // ---- Horário (tab_1_5) ----
  interrupcao: false,
  horaInicManha: '',
  horaFimManha: '',
  horaInicTarde: '',
  horaFimTarde: '',
  folgaSeg: false,
  folgaTer: false,
  folgaQua: false,
  folgaQui: false,
  folgaSex: false,
  folgaSab: false,
  folgaDom: false,

  // Outros Parâmetros (tab_1_4)
  descarga: '',
  ruptura: '',
  valorart: '',
  tiporecal: '',
  valorecal: '',
  controlarPlafond: false,
  ctrlPlafond: '',
  validade: false,
  diasvalid: '',
  ligacb: false,
  entidadeUtilizadora: '',
  localPrescricao: '',
  nomeEtiqueta: '',
  codSb: '',
  netiquetas: '',
  cccCodLocalEmissao: '',
  cccDescLocalEmissao: '',
  regiao: ' ',
  cid: '',
  portaLeitorCartoes: '',
  stocksColunaStockReal: false,
  calendarioMarcacoesRadio: '',
  ativoNovaPagina: false,
  novaPrescricao: false,
  gestaoSalas: false,
  tipoAdmissPorDefeito: '',
  diretoriaDocumentos: '',
  caminhoSaft: '',
  exportContabilidadeFa: '',
  exportTipoContaFa: '',
  exportPredUtenteFa: '',
  exportContabilidadeFr: '',
  exportTipoContaFr: '',
  exportPredUtenteFr: '',
  labelAuxiliares: '',
  envioEmail: '',
  movimentosInternos: false,
  msgFaltaPagamento: '',
  msgCredenciais: '',
  kqueueAvisoAtraso: false,
  kqueueTempoAvisoAtraso: '',
  kqueueMensagemAvisoAtraso: '',

  rgpdDescritivo: '',
  rgpdConsentimento: '',
  rgpdMarketing: '',

  emailAssuntoConsultas: '',
  emailConteudoConsultas: '',
  emailAssuntoTratamentos: '',
  emailConteudoTratamentos: '',
  emailAssuntoExames: '',
  emailConteudoExames: '',
  emailAssuntoRelatorios: '',
  emailConteudoRelatorios: '',
}

