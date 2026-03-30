import type { UpdateClinicaRequest } from '@/types/dtos/core/clinica.dtos'

export function buildUpdateClinicaPayload(
  values: any,
  clinica: any,
): UpdateClinicaRequest {
  return {
    nome: values.nome.trim(),
    nomeComercial: values.nomeComercial.trim() || clinica.nomeComercial || null,
    abreviatura: values.abreviatura.trim() || null,

    // Identificação (tab_1_1)
    morada: values.morada.trim() || null,
    ccPostal: values.ccPostal.trim() || null,
    localidade: values.localidade.trim() || null,
    indicativoTelefone: values.indicativoTelefone.trim() || null,
    telefone: values.telefone.trim() || null,
    telemovel: values.telemovel.trim() || null,
    fax: values.fax.trim() || null,
    email: values.email.trim() || null,
    web: values.web.trim() || null,
    sucursal: values.sucursal.trim() || null,
    numeroContribuinte:
      values.numeroContribuinte.trim() || clinica.numeroContribuinte || null,
    nib: values.nib.trim() || null,
    observacoes: values.observacoes.trim() || null,
    urlFoto: values.urlFoto.trim() || null,

    // Dados Fiscais (tab_1_2)
    atividade: values.atividade.trim() || null,
    regcom: values.regcom.trim() || null,
    capsocial: values.capsocial.trim() ? Number(values.capsocial.trim()) : null,
    cae: values.cae.trim() || null,
    zonFisc: values.zonFisc.trim() || null,
    tipo: values.tipo.trim() || null,
    portaria: values.portaria.trim() || null,
    despachoUcc: values.despachoUcc.trim() || null,
    obsNotaCredito: values.obsNotaCredito.trim() || null,
    cmoeda: values.cmoeda.trim() || clinica.cmoeda || null,

    // Faturação (tab_1_3)
    faturaRecibo: values.faturaRecibo.trim()
      ? parseInt(values.faturaRecibo.trim(), 10)
      : null,
    imprimeTicket: values.imprimeTicket ?? null,
    temSaft: values.temSaft ?? null,
    cab: values.cab ?? null,
    faturacaoDocumentosImpressao:
      values.faturacaoDocumentosImpressao.trim() || null,
    emailLink: values.emailLink ?? null,

    linha1: values.linha1.trim() || null,
    linha2: values.linha2.trim() || null,
    linha3: values.linha3.trim() || null,
    linha4: values.linha4.trim() || null,
    linha5: values.linha5.trim() || null,
    linha6: values.linha6.trim() || null,

    regrafaturacao: values.regrafaturacao.trim() || null,
    motivoIsencaoDefeito: values.motivoIsencaoDefeito.trim() || null,
    valorMaxFaturaSimpli: values.valorMaxFaturaSimpli.trim()
      ? parseInt(values.valorMaxFaturaSimpli.trim(), 10)
      : null,
    armazemHabitual: values.armazemHabitual.trim() || null,
    atUser: values.atUser.trim() || null,
    atPass: values.atPass.trim() || null,

    // ---- Horário (tab_1_5) ----
    interrupcao: values.interrupcao ?? null,
    horaInicManha: values.horaInicManha.trim() || null,
    horaFimManha: values.horaFimManha?.trim() || null,
    horaInicTarde: values.horaInicTarde?.trim() || null,
    horaFimTarde: values.horaFimTarde.trim() || null,
    folgaSeg: values.folgaSeg ?? null,
    folgaTer: values.folgaTer ?? null,
    folgaQua: values.folgaQua ?? null,
    folgaQui: values.folgaQui ?? null,
    folgaSex: values.folgaSex ?? null,
    folgaSab: values.folgaSab ?? null,
    folgaDom: values.folgaDom ?? null,

    // Outros Parâmetros (tab_1_4)
    descarga: values.descarga.trim() ? parseInt(values.descarga.trim(), 10) : null,
    ruptura: values.ruptura.trim() ? parseInt(values.ruptura.trim(), 10) : null,
    valorart: values.valorart.trim() ? parseInt(values.valorart.trim(), 10) : null,

    tiporecal: values.tiporecal.trim()
      ? parseInt(values.tiporecal.trim(), 10)
      : null,
    valorecal: values.valorecal.trim() ? Number(values.valorecal.trim()) : null,

    controlarPlafond: values.controlarPlafond ?? null,
    ctrlPlafond: values.ctrlPlafond.trim()
      ? parseInt(values.ctrlPlafond.trim(), 10)
      : null,
    validade: values.validade ?? null,
    diasvalid: values.diasvalid.trim() ? parseInt(values.diasvalid.trim(), 10) : null,
    ligacb: values.ligacb ?? null,

    entidadeUtilizadora: values.entidadeUtilizadora.trim() || null,
    localPrescricao: values.localPrescricao.trim() || null,
    nomeEtiqueta: values.nomeEtiqueta.trim() || null,
    codSb: values.codSb.trim() || null,
    netiquetas: values.netiquetas.trim()
      ? parseInt(values.netiquetas.trim(), 10)
      : null,
    cccCodLocalEmissao: values.cccCodLocalEmissao.trim()
      ? parseInt(values.cccCodLocalEmissao.trim(), 10)
      : null,
    cccDescLocalEmissao: values.cccDescLocalEmissao.trim() || null,
    regiao: values.regiao.trim() || null,

    cid: values.cid.trim() ? parseInt(values.cid.trim(), 10) : null,

    portaLeitorCartoes: values.portaLeitorCartoes.trim()
      ? parseInt(values.portaLeitorCartoes.trim(), 10)
      : null,
    stocksColunaStockReal: values.stocksColunaStockReal ?? null,

    calendarioMarcacoesRadio: values.calendarioMarcacoesRadio.trim()
      ? parseInt(values.calendarioMarcacoesRadio.trim(), 10)
      : null,
    novoEstadoPaginaAtendimento: values.ativoNovaPagina ?? null,
    novaPrescricao: values.novaPrescricao ?? null,
    gestaoSalas: values.gestaoSalas ?? null,

    tipoAdmissPorDefeito: values.tipoAdmissPorDefeito.trim()
      ? parseInt(values.tipoAdmissPorDefeito.trim(), 10)
      : null,
    diretoriaDocumentos: values.diretoriaDocumentos.trim() || null,
    caminhoSaft: values.caminhoSaft.trim() || null,

    exportContabilidadeFa: values.exportContabilidadeFa.trim() || null,
    exportTipoContaFa: values.exportTipoContaFa.trim() || null,
    exportPredUtenteFa: values.exportPredUtenteFa.trim()
      ? parseInt(values.exportPredUtenteFa.trim(), 10)
      : null,
    exportContabilidadeFr: values.exportContabilidadeFr.trim() || null,
    exportTipoContaFr: values.exportTipoContaFr.trim() || null,
    exportPredUtenteFr: values.exportPredUtenteFr.trim()
      ? parseInt(values.exportPredUtenteFr.trim(), 10)
      : null,

    labelAuxiliares: values.labelAuxiliares.trim() || null,
    envioEmail: values.envioEmail.trim()
      ? parseInt(values.envioEmail.trim(), 10)
      : null,
    movimentosInternos: values.movimentosInternos ?? null,

    msgFaltaPagamento: values.msgFaltaPagamento.trim() || null,
    msgCredenciais: values.msgCredenciais.trim() || null,
    kqueueAvisoAtraso: values.kqueueAvisoAtraso ?? null,
    kqueueTempoAvisoAtraso: values.kqueueTempoAvisoAtraso.trim()
      ? parseInt(values.kqueueTempoAvisoAtraso.trim(), 10)
      : null,
    kqueueMensagemAvisoAtraso: values.kqueueMensagemAvisoAtraso.trim() || null,

    rgpdDescritivo: values.rgpdDescritivo.trim() || null,
    rgpdConsentimento: values.rgpdConsentimento.trim() || null,
    rgpdMarketing: values.rgpdMarketing.trim() || null,

    emailAssuntoConsultas: values.emailAssuntoConsultas.trim() || null,
    emailConteudoConsultas: values.emailConteudoConsultas.trim() || null,
    emailAssuntoTratamentos: values.emailAssuntoTratamentos.trim() || null,
    emailConteudoTratamentos: values.emailConteudoTratamentos.trim() || null,
    emailAssuntoExames: values.emailAssuntoExames.trim() || null,
    emailConteudoExames: values.emailConteudoExames.trim() || null,
    emailAssuntoRelatorios: values.emailAssuntoRelatorios.trim() || null,
    emailConteudoRelatorios: values.emailConteudoRelatorios.trim() || null,
  }
}

