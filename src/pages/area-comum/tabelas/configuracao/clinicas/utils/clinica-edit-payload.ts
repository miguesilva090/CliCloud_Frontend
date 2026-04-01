import { ZonaFiscal, type UpdateClinicaRequest } from '@/types/dtos/core/clinica.dtos'

const toRequired = (v: unknown): string => String(v ?? '').trim()
const toNullable = (v: unknown): string | null => {
  const trimmed = toRequired(v)
  return trimmed === '' ? null : trimmed
}


export function buildUpdateClinicaPayload(
  values: any,
  _clinica: any,
): UpdateClinicaRequest {
  return {
    nome: toRequired(values.nome),
    nomeComercial: toNullable(values.nomeComercial),
    abreviatura: toNullable(values.abreviatura),

    // Identificação (tab_1_1)
    morada: toNullable(values.morada),
    ccPostal: toNullable(values.ccPostal),
    localidade: toNullable(values.localidade),
    indicativoTelefone: toNullable(values.indicativoTelefone),
    telefone: toNullable(values.telefone),
    telemovel: toNullable(values.telemovel),
    fax: toNullable(values.fax),
    email: toNullable(values.email),
    web: toNullable(values.web),
    sucursal: toNullable(values.sucursal),
    numeroContribuinte: toNullable(values.numeroContribuinte),
    nib: toNullable(values.nib),
    observacoes: toNullable(values.observacoes),
    urlFoto: toNullable(values.urlFoto),

    // Dados Fiscais (tab_1_2)
    atividade: toNullable(values.atividade),
    regcom: toNullable(values.regcom),
    capsocial: toRequired(values.capsocial) ? Number(toRequired(values.capsocial)) : null,
    cae: toNullable(values.cae),
    zonFisc: toRequired(values.zonFisc)
      ? (Number(toRequired(values.zonFisc)) as ZonaFiscal)
      : null,
    tipo: toNullable(values.tipo),
    portaria: toNullable(values.portaria),
    despachoUcc: toNullable(values.despachoUcc),
    obsNotaCredito: toNullable(values.obsNotaCredito),
    cmoeda: toRequired(values.cmoeda),

    // Faturação (tab_1_3)
    faturaRecibo: toRequired(values.faturaRecibo)
      ? parseInt(toRequired(values.faturaRecibo), 10)
      : 1,

    imprimeTicket: values.imprimeTicket ?? false,
    temSaft: values.temSaft ?? false,
    cab: values.cab ?? false,
    faturacaoDocumentosImpressao: toNullable(values.faturacaoDocumentosImpressao),
    emailLink: values.emailLink ?? false,

    linha1: toNullable(values.linha1),
    linha2: toNullable(values.linha2),
    linha3: toNullable(values.linha3),
    linha4: toNullable(values.linha4),
    linha5: toNullable(values.linha5),
    linha6: toNullable(values.linha6),

    regrafaturacao: toRequired(values.regrafaturacao) || '1',

    motivoIsencaoDefeito: toNullable(values.motivoIsencaoDefeito),

    valorMaxFaturaSimpli: toRequired(values.valorMaxFaturaSimpli)
      ? parseInt(toRequired(values.valorMaxFaturaSimpli), 10)
      : 0,
      
    armazemHabitual: toNullable(values.armazemHabitual),
    atUser: toNullable(values.atUser),
    atPass: toNullable(values.atPass),

    // ---- Horário (tab_1_5) ----
    interrupcao: values.interrupcao ?? null,
    horaInicManha: toNullable(values.horaInicManha),
    horaFimManha: toNullable(values.horaFimManha),
    horaInicTarde: toNullable(values.horaInicTarde),
    horaFimTarde: toNullable(values.horaFimTarde),
    folgaSeg: values.folgaSeg ?? null,
    folgaTer: values.folgaTer ?? null,
    folgaQua: values.folgaQua ?? null,
    folgaQui: values.folgaQui ?? null,
    folgaSex: values.folgaSex ?? null,
    folgaSab: values.folgaSab ?? null,
    folgaDom: values.folgaDom ?? null,

    // Outros Parâmetros (tab_1_4)
    descarga: toRequired(values.descarga) ? parseInt(toRequired(values.descarga), 10) : null,
    ruptura: toRequired(values.ruptura) ? parseInt(toRequired(values.ruptura), 10) : null,
    valorart: toRequired(values.valorart) ? parseInt(toRequired(values.valorart), 10) : null,

    tiporecal: toRequired(values.tiporecal)
      ? parseInt(toRequired(values.tiporecal), 10)
      : null,
    valorecal: toRequired(values.valorecal) ? Number(toRequired(values.valorecal)) : null,

    controlarPlafond: values.controlarPlafond ?? null,
    ctrlPlafond: toRequired(values.ctrlPlafond)
      ? parseInt(toRequired(values.ctrlPlafond), 10)
      : null,
    validade: values.validade ?? null,
    diasvalid: toRequired(values.diasvalid) ? parseInt(toRequired(values.diasvalid), 10) : null,
    ligacb: values.ligacb ?? null,

    entidadeUtilizadora: toNullable(values.entidadeUtilizadora),
    localPrescricao: toNullable(values.localPrescricao),
    nomeEtiqueta: toNullable(values.nomeEtiqueta),
    codSb: toNullable(values.codSb),
    netiquetas: toRequired(values.netiquetas)
      ? parseInt(toRequired(values.netiquetas), 10)
      : null,
    cccCodLocalEmissao: toRequired(values.cccCodLocalEmissao)
      ? parseInt(toRequired(values.cccCodLocalEmissao), 10)
      : null,
    cccDescLocalEmissao: toNullable(values.cccDescLocalEmissao),
    regiao: toNullable(values.regiao),

    cid: toRequired(values.cid) ? parseInt(toRequired(values.cid), 10) : null,

    portaLeitorCartoes: toRequired(values.portaLeitorCartoes)
      ? parseInt(toRequired(values.portaLeitorCartoes), 10)
      : null,
    stocksColunaStockReal: values.stocksColunaStockReal ?? null,

    calendarioMarcacoesRadio: toRequired(values.calendarioMarcacoesRadio)
      ? parseInt(toRequired(values.calendarioMarcacoesRadio), 10)
      : null,
    novoEstadoPaginaAtendimento: values.ativoNovaPagina ?? null,
    novaPrescricao: values.novaPrescricao ?? null,
    gestaoSalas: values.gestaoSalas ?? null,

    tipoAdmissPorDefeito: toRequired(values.tipoAdmissPorDefeito)
      ? parseInt(toRequired(values.tipoAdmissPorDefeito), 10)
      : null,
    diretoriaDocumentos: toNullable(values.diretoriaDocumentos),
    caminhoSaft: toNullable(values.caminhoSaft),

    exportContabilidadeFa: toNullable(values.exportContabilidadeFa),
    exportTipoContaFa: toNullable(values.exportTipoContaFa),
    exportPredUtenteFa: toRequired(values.exportPredUtenteFa)
      ? parseInt(toRequired(values.exportPredUtenteFa), 10)
      : null,
    exportContabilidadeFr: toNullable(values.exportContabilidadeFr),
    exportTipoContaFr: toNullable(values.exportTipoContaFr),
    exportPredUtenteFr: toRequired(values.exportPredUtenteFr)
      ? parseInt(toRequired(values.exportPredUtenteFr), 10)
      : null,

    labelAuxiliares: toNullable(values.labelAuxiliares),
    envioEmail: toRequired(values.envioEmail)
      ? parseInt(toRequired(values.envioEmail), 10)
      : null,
    movimentosInternos: values.movimentosInternos ?? null,

    msgFaltaPagamento: toNullable(values.msgFaltaPagamento),
    msgCredenciais: toNullable(values.msgCredenciais),
    kqueueAvisoAtraso: values.kqueueAvisoAtraso ?? null,
    kqueueTempoAvisoAtraso: toRequired(values.kqueueTempoAvisoAtraso)
      ? parseInt(toRequired(values.kqueueTempoAvisoAtraso), 10)
      : null,
    kqueueMensagemAvisoAtraso: toNullable(values.kqueueMensagemAvisoAtraso),

    rgpdDescritivo: toNullable(values.rgpdDescritivo),
    rgpdConsentimento: toNullable(values.rgpdConsentimento),
    rgpdMarketing: toNullable(values.rgpdMarketing),

    emailAssuntoConsultas: toNullable(values.emailAssuntoConsultas),
    emailConteudoConsultas: toNullable(values.emailConteudoConsultas),
    emailAssuntoTratamentos: toNullable(values.emailAssuntoTratamentos),
    emailConteudoTratamentos: toNullable(values.emailConteudoTratamentos),
    emailAssuntoExames: toNullable(values.emailAssuntoExames),
    emailConteudoExames: toNullable(values.emailConteudoExames),
    emailAssuntoRelatorios: toNullable(values.emailAssuntoRelatorios),
    emailConteudoRelatorios: toNullable(values.emailConteudoRelatorios),
  }
}

