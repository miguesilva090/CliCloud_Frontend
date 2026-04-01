export function mapClinicaToClinicaEditFormValues(clinica: any) {
  return {
    nome: clinica.nome ?? '',
    nomeComercial: clinica.nomeComercial ?? '',
    abreviatura: clinica.abreviatura ?? '',

    morada: clinica.morada ?? '',
    ccPostal: clinica.ccPostal ?? '',
    localidade: clinica.localidade ?? '',
    indicativoTelefone: clinica.indicativoTelefone ?? '351',
    telefone: clinica.telefone ?? '',
    telemovel: clinica.telemovel ?? '',
    fax: clinica.fax ?? '',
    email: clinica.email ?? '',
    web: clinica.web ?? '',
    sucursal: clinica.sucursal ?? '',
    numeroContribuinte: clinica.numeroContribuinte ?? '',
    nib: clinica.nib ?? '',
    observacoes: clinica.observacoes ?? '',
    urlFoto: clinica.urlFoto ?? '',

    // Dados Fiscais (tab_1_2)
    atividade: clinica.atividade ?? '',
    regcom: clinica.regcom ?? '',
    capsocial: clinica.capsocial != null ? String(clinica.capsocial) : '',
    cae: clinica.cae ?? '',
    zonFisc: clinica.zonFisc != null ? String(clinica.zonFisc) : '',
    tipo: clinica.tipo ?? '',
    portaria: clinica.portaria ?? '',
    despachoUcc: clinica.despachoUcc ?? '',
    obsNotaCredito: clinica.obsNotaCredito ?? '',
    cmoeda:
      clinica.cmoeda != null
        ? String(clinica.cmoeda).trim()
        : clinica.cMoeda != null
          ? String(clinica.cMoeda).trim()
          : '',

    // Faturação (tab_1_3)
    faturaRecibo: clinica.faturaRecibo != null ? String(clinica.faturaRecibo) : '1',
    imprimeTicket: clinica.imprimeTicket ?? false,
    temSaft: clinica.temSaft ?? false,
    cab: clinica.cab ?? false,
    faturacaoDocumentosImpressao: clinica.faturacaoDocumentosImpressao ?? 'A4',
    emailLink: clinica.emailLink ?? false,

    linha1: clinica.linha1 ?? '',
    linha2: clinica.linha2 ?? '',
    linha3: clinica.linha3 ?? '',
    linha4: clinica.linha4 ?? '',
    linha5: clinica.linha5 ?? '',
    linha6: clinica.linha6 ?? '',

    regrafaturacao: clinica.regrafaturacao ?? '1',
    motivoIsencaoDefeito: clinica.motivoIsencaoDefeito ?? '',
    valorMaxFaturaSimpli:
      clinica.valorMaxFaturaSimpli != null ? String(clinica.valorMaxFaturaSimpli) : '',
    armazemHabitual: clinica.armazemHabitual ?? '',
    atUser: clinica.atUser ?? '',
    atPass: clinica.atPass ?? '',

    // ---- Horário (tab_1_5) ----
    interrupcao: clinica.interrupcao ?? false,
    horaInicManha: clinica.horaInicManha ?? '',
    horaFimManha: clinica.horaFimManha ?? '',
    horaInicTarde: clinica.horaInicTarde ?? '',
    horaFimTarde: clinica.horaFimTarde ?? '',
    folgaSeg: clinica.folgaSeg ?? false,
    folgaTer: clinica.folgaTer ?? false,
    folgaQua: clinica.folgaQua ?? false,
    folgaQui: clinica.folgaQui ?? false,
    folgaSex: clinica.folgaSex ?? false,
    folgaSab: clinica.folgaSab ?? false,
    folgaDom: clinica.folgaDom ?? false,

    // Outros Parâmetros (tab_1_4)
    descarga: clinica.descarga != null ? String(clinica.descarga) : '',
    ruptura: clinica.ruptura != null ? String(clinica.ruptura) : '',
    valorart: clinica.valorart != null ? String(clinica.valorart) : '',
    tiporecal: clinica.tiporecal != null ? String(clinica.tiporecal) : '',
    valorecal: clinica.valorecal != null ? String(clinica.valorecal) : '',

    controlarPlafond: clinica.controlarPlafond ?? false,
    ctrlPlafond: clinica.ctrlPlafond != null ? String(clinica.ctrlPlafond) : '',
    validade: clinica.validade ?? false,
    diasvalid: clinica.diasvalid != null ? String(clinica.diasvalid) : '',
    ligacb: clinica.ligacb ?? false,

    entidadeUtilizadora: clinica.entidadeUtilizadora ?? '',
    localPrescricao: clinica.localPrescricao ?? '',
    nomeEtiqueta: clinica.nomeEtiqueta ?? '',
    codSb: clinica.codSb ?? '',
    netiquetas: clinica.netiquetas != null ? String(clinica.netiquetas) : '',
    cccCodLocalEmissao:
      clinica.cccCodLocalEmissao != null ? String(clinica.cccCodLocalEmissao) : '',
    cccDescLocalEmissao: clinica.cccDescLocalEmissao ?? '',
    regiao: clinica.regiao ?? ' ',

    cid: clinica.cid != null ? String(clinica.cid) : '',

    portaLeitorCartoes: clinica.portaLeitorCartoes != null ? String(clinica.portaLeitorCartoes) : '',
    stocksColunaStockReal: clinica.stocksColunaStockReal ?? false,

    calendarioMarcacoesRadio:
      clinica.calendarioMarcacoesRadio != null ? String(clinica.calendarioMarcacoesRadio) : '',
    ativoNovaPagina: clinica.novoEstadoPaginaAtendimento ?? false,
    novaPrescricao: clinica.novaPrescricao ?? false,
    gestaoSalas: clinica.gestaoSalas ?? false,

    tipoAdmissPorDefeito:
      clinica.tipoAdmissPorDefeito != null ? String(clinica.tipoAdmissPorDefeito) : '',
    diretoriaDocumentos: clinica.diretoriaDocumentos ?? '',
    caminhoSaft: clinica.caminhoSaft ?? '',

    exportContabilidadeFa: clinica.exportContabilidadeFa ?? '',
    exportTipoContaFa: clinica.exportTipoContaFa ?? '',
    exportPredUtenteFa: clinica.exportPredUtenteFa != null ? String(clinica.exportPredUtenteFa) : '',

    exportContabilidadeFr: clinica.exportContabilidadeFr ?? '',
    exportTipoContaFr: clinica.exportTipoContaFr ?? '',
    exportPredUtenteFr: clinica.exportPredUtenteFr != null ? String(clinica.exportPredUtenteFr) : '',

    labelAuxiliares: clinica.labelAuxiliares ?? '',
    envioEmail: clinica.envioEmail != null ? String(clinica.envioEmail) : '',
    movimentosInternos: clinica.movimentosInternos ?? false,

    msgFaltaPagamento: clinica.msgFaltaPagamento ?? '',
    msgCredenciais: clinica.msgCredenciais ?? '',
    kqueueAvisoAtraso: clinica.kqueueAvisoAtraso ?? false,
    kqueueTempoAvisoAtraso:
      clinica.kqueueTempoAvisoAtraso != null ? String(clinica.kqueueTempoAvisoAtraso) : '',
    kqueueMensagemAvisoAtraso: clinica.kqueueMensagemAvisoAtraso ?? '',

    rgpdDescritivo: clinica.rgpdDescritivo ?? '',
    rgpdConsentimento: clinica.rgpdConsentimento ?? '',
    rgpdMarketing: clinica.rgpdMarketing ?? '',

    emailAssuntoConsultas: clinica.emailAssuntoConsultas ?? '',
    emailConteudoConsultas: clinica.emailConteudoConsultas ?? '',
    emailAssuntoTratamentos: clinica.emailAssuntoTratamentos ?? '',
    emailConteudoTratamentos: clinica.emailConteudoTratamentos ?? '',
    emailAssuntoExames: clinica.emailAssuntoExames ?? '',
    emailConteudoExames: clinica.emailConteudoExames ?? '',
    emailAssuntoRelatorios: clinica.emailAssuntoRelatorios ?? '',
    emailConteudoRelatorios: clinica.emailConteudoRelatorios ?? '',
  }
}

