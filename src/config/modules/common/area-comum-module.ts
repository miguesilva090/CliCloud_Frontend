import { utilitarios } from '../base/utilitarios-module'
import { Module } from '../types'

const g = utilitarios.permissions

/**
 * Módulo «Área Comum» na API de licenças (CliCloud): 00000002-…-000003.
 * As tabelas geográficas pertencem ao módulo «Utilitários» (…000001); reutilizamos os mesmos GUIDs
 * de `utilitarios-module` para os guards das rotas /area-comum/tabelas/geograficas/*.
 */
export const areaComum: Module = {
  id: '00000002-0000-0000-0000-000000000003',
  name: 'Área Comum',
  permissions: {
    paises: g.paises,
    distritos: g.distritos,
    concelhos: g.concelhos,
    freguesias: g.freguesias,
    codigospostais: g.codigospostais,
    codigosPostais: g.codigospostais,
    ruas: g.ruas,
    tabelas: {
      id: '00000002-0000-0000-0001-000000000003',
      name: 'Tabelas',
    },
    utilitariosLinhaMenu: {
      id: '00000002-0000-0000-0002-000000000003',
      name: 'Utilitários',
    },
    appSaude: {
      id: '00000002-0000-0000-0003-000000000003',
      name: 'App de Saúde',
    },
    ajuda: {
      id: '00000002-0000-0000-0004-000000000003',
      name: 'Ajuda',
    },
    utentes: {
      id: '00000002-0000-0000-0010-000000000003',
      name: 'Utentes',
    },
    medicos: {
      id: '00000002-0000-0000-0011-000000000003',
      name: 'Médicos',
    },
    medicosExternos: {
      id: '00000002-0000-0000-0012-000000000003',
      name: 'Médicos Externos',
    },
    organismos: {
      id: '00000002-0000-0000-0013-000000000003',
      name: 'Organismos',
    },
    centrosSaude: {
      id: '00000002-0000-0000-0014-000000000003',
      name: 'Centros de Saúde',
    },
    funcionarios: {
      id: '00000002-0000-0000-0015-000000000003',
      name: 'Funcionários',
    },
    fornecedores: {
      id: '00000002-0000-0000-0016-000000000003',
      name: 'Fornecedores',
    },
    empresas: {
      id: '00000002-0000-0000-0017-000000000003',
      name: 'Empresas',
    },
    tecnicos: {
      id: '00000002-0000-0000-0018-000000000003',
      name: 'Técnicos',
    },
    entidades: {
      id: '00000002-0000-0000-0019-000000000003',
      name: 'Entidades',
    },
    configuracoes: {
      id: '00000002-0000-0000-0020-000000000003',
      name: 'Configurações',
    },
    configuracoesClinica:{
      id: '00000002-0000-0000-0021-000000000003',
      name: 'Configurações da Clínica',
    },
    configuracoesSms:{
      id: '00000002-0000-0000-0022-000000000003',
      name: 'Configurações de SMS',
    },
    configuracoesVoz:{
      id: '00000002-0000-0000-0023-000000000003',
      name: 'Configurações de Voz',
    },
    configuracoesTeleconsulta:{
      id: '00000002-0000-0000-0024-000000000003',
      name: 'Configurações de Teleconsulta',
    },
    configuracoesCartaConducao:{
      id: '00000002-0000-0000-0025-000000000003',
      name: 'Configurações de Carta de Condução',
    },
    configuracoesEmail:{
      id: '00000002-0000-0000-0026-000000000003',
      name: 'Configurações de Email',
    },
    configuracoesWebservices:{
      id: '00000002-0000-0000-0027-000000000003',
      name: 'Configurações de WebServices',
    },
    configuracoesExamesSemPapel:{
      id: '00000002-0000-0000-0028-000000000003',
      name: 'Configurações de Exames Sem Papel',
    },
    gestaoSeparadores:{
      id: '00000002-0000-0000-0029-000000000003',
      name: 'Gestão de Separadores',
    },
    separadores: {
      id: '00000002-0000-0000-0030-000000000003',
      name: 'Separadores',
    },
    separadoresPersonalizados: {
      id: '00000002-0000-0000-0031-000000000003',
      name: 'Separadores Personalizados',
    },
    formulariosPersonalizados: {
      id: '00000002-0000-0000-0032-000000000003',
      name: 'Formulários Personalizados',
    },
    feriados: {
      id: '00000002-0000-0000-0033-000000000003',
      name: 'Feriados',
    },
    documentos: {
      id: '00000002-0000-0000-0034-000000000003',
      name: 'Documentos',
    },
    referenciasMb: {
      id: '00000002-0000-0000-0035-000000000003',
      name: 'Referências MB',
    },
    tiposEntidadesFinanceiras: {
      id: '00000002-0000-0000-0036-000000000003',
      name: 'Tipos de Entidades Financeiras',
    },
    entidadesFinanceirasResponsaveis: {
      id: '00000002-0000-0000-0037-000000000003',
      name: 'Entidades Financeiras Responsáveis',
    },
    bancos: {
      id: '00000002-0000-0000-0038-000000000003',
      name: 'Bancos',
    },
    categoriasEspecialidades: {
      id: '00000002-0000-0000-0039-000000000003',
      name: 'Categorias das Especialidades',
    },
    especialidades: {
      id: '00000002-0000-0000-0040-000000000003',
      name: 'Especialidades',
    },
    estadosCivis: {
      id: '00000002-0000-0000-0041-000000000003',
      name: 'Estados Civis',
    },
    gruposSanguineos: {
      id: '00000002-0000-0000-0042-000000000003',
      name: 'Grupos Sanguíneos',
    },
    habilitacoes: {
      id: '00000002-0000-0000-0043-000000000003',
      name: 'Habilitações',
    },
    moedas: {
      id: '00000002-0000-0000-0044-000000000003',
      name: 'Moedas',
    },
    profissoes: {
      id: '00000002-0000-0000-0045-000000000003',
      name: 'Profissões',
    },
    sexos: {
      id: '00000002-0000-0000-0046-000000000003',
      name: 'Sexos',
    },
    grausParentesco: {
      id: '00000002-0000-0000-0047-000000000003',
      name: 'Graus de Parentesco',
    },
    taxasIva: {
      id: '00000002-0000-0000-0048-000000000003',
      name: 'Taxas de IVA',
    },
    provenienciasUtentes: {
      id: '00000002-0000-0000-0049-000000000003',
      name: 'Proveniências de Utentes',
    },
    viasAdministracao: {
      id: '00000002-0000-0000-0050-000000000003',
      name: 'Vias de Administração',
    },
    grupoViasAdministracao: {
      id: '00000002-0000-0000-0051-000000000003',
      name: 'Grupo de Vias de Administração',
    },
    stocks: {
      id: '00000002-0000-0000-0052-000000000003',
      name: 'Stocks',
    },
    geograficas: {
      id: '00000002-0000-0000-0053-000000000003',
      name: 'Geográficas',
    },
    consultas: {
      id: '00000002-0000-0000-0054-000000000003',
      name: 'Consultas',
    },
    margemMedicos: {
      id: '00000002-0000-0000-0055-000000000003',
      name: 'Margem de Médicos',
    },
    servicos: {
      id: '00000002-0000-0000-0056-000000000003',
      name: 'Serviços',
    },
    tabelaServicos: {
      id: '00000002-0000-0000-0057-000000000003',
      name: 'Tabela de Serviços',
    },
    subsistemasServicos: {
      id: '00000002-0000-0000-0058-000000000003',
      name: 'Subsistemas de Serviços',
    },
    tiposServico: {
      id: '00000002-0000-0000-0059-000000000003',
      name: 'Tipos de Serviço',
    },
    alergias: {
      id: '00000002-0000-0000-0060-000000000003',
      name: 'Alergias',
    },
    grausAlergia: {
      id: '00000002-0000-0000-0061-000000000003',
      name: 'Graus de Alergia',
    },
    doencas: {
      id: '00000002-0000-0000-0062-000000000003',
      name: 'Doenças',
    },
    tiposConsultas: {
      id: '00000002-0000-0000-0063-000000000003',
      name: 'Tipos de Consultas',
    },
    tratamentos: {
      id: '00000002-0000-0000-0064-000000000003',
      name: 'Tratamentos',
    },
    locaisTratamento: {
      id: '00000002-0000-0000-0065-000000000003',
      name: 'Locais de Tratamento',
    },
    estadosListaEspera: {
      id: '00000002-0000-0000-0066-000000000003',
      name: 'Estados de Lista de Espera',
    },
    prioridades: {
      id: '00000002-0000-0000-0067-000000000003',
      name: 'Prioridades',
    },
    patologias: {
      id: '00000002-0000-0000-0068-000000000003',
      name: 'Patologias',
    },
    regioesCorpo: {
      id: '00000002-0000-0000-0069-000000000003',
      name: 'Regiões do Corpo',
    },
    goniometrias: {
      id: '00000002-0000-0000-0070-000000000003',
      name: 'Goniometrias',
    },
    tiposDeDor: {
      id: '00000002-0000-0000-0071-000000000003',
      name: 'Tipos de Dor',
    },
    fraquezasMusculares: {
      id: '00000002-0000-0000-0072-000000000003',
      name: 'Fraquezas Musculares',
    },
    motivosAlta: {
      id: '00000002-0000-0000-0073-000000000003',
      name: 'Motivos de Alta',
    },
    motivosDesmarcacao: {
      id: '00000002-0000-0000-0074-000000000003',
      name: 'Motivos de Desmarcação',
    },
    equipamentos:{
      id: '00000002-0000-0000-0075-000000000003',
      name: 'Equipamentos',
    },
    aparelhos: {
      id: '00000002-0000-0000-0076-000000000003',
      name: 'Aparelhos',
    },
    tiposAparelho: {
      id: '00000002-0000-0000-0077-000000000003',
      name: 'Tipos de Aparelhos',
    },
    marcasAparelho: {
      id: '00000002-0000-0000-0078-000000000003',
      name: 'Marcas de Aparelhos',
    },
    modelosAparelho: {
      id: '00000002-0000-0000-0079-000000000003',
      name: 'Modelos de Aparelhos',
    },
    exames: {
      id: '00000002-0000-0000-0080-000000000003',
      name: 'Exames',
    },
    categoriasProcedimento: {
      id: '00000002-0000-0000-0081-000000000003',
      name: 'Categorias de Procedimento',
    },
    analises: {
      id: '00000002-0000-0000-0082-000000000003',
      name: 'Análises',
    },
    tiposExame: {
      id: '00000002-0000-0000-0083-000000000003',
      name: 'Tipos de Exame',
    },
    acordos: {
      id: '00000002-0000-0000-0084-000000000003',
      name: 'Acordos',
    },
    /** Alinhado às funcionalidades seed do projeto de licenças (0085–0088). */
    notificacoes: {
      id: '00000002-0000-0000-0085-000000000003',
      name: 'Notificações',
    },
    notificacaoTipos: {
      id: '00000002-0000-0000-0086-000000000003',
      name: 'Tipos de Notificação',
    },
    notificacoesEnviadas: {
      id: '00000002-0000-0000-0087-000000000003',
      name: 'Notificações enviadas',
    },
    notificacoesAtualizacao: {
      id: '00000002-0000-0000-0088-000000000003',
      name: 'Notificações de atualização',
    },


  },
}
