import { modules } from './modules'

/** Categorias da sidebar conforme layout CliCloud: Inicio + Áreas com ícones melhorados */
export const roleMenuItems = {
  client: [
    {
      title: 'inicio',
      href: '/',
      icon: 'home',
      label: 'Inicio',
    },
    {
      title: 'area-clinica',
      href: '/area-clinica',
      icon: 'activity',
      label: 'Área Clinica',
      moduloId: modules.areaClinica.id,
      items: [
        {
          title: 'processo-clinico',
          href: '/area-clinica/processo-clinico',
          icon: 'activity',
          label: 'Processo Clinico',
          funcionalidadeId: modules.areaClinica.permissions.processoClinico.id,
        },
        {
          title: 'prescricao-eletronica',
          href: '/area-clinica/prescricao-eletronica',
          icon: 'fileText',
          label: 'Prescrição Eletronica',
          funcionalidadeId: modules.areaClinica.permissions.prescricaoEletronica.id,
        },
        {
          title: 'prescricao-mcdts',
          href: '/area-clinica/prescricao-mcdts',
          icon: 'fileText',
          label: 'Prescrição MCDTs',
          funcionalidadeId: modules.areaClinica.permissions.prescricaoMcdts.id,
        },
        {
          title: 'enfermagem',
          href: '/area-clinica/enfermagem',
          icon: 'user',
          label: 'Enfermagem',
          funcionalidadeId: modules.areaClinica.permissions.enfermagem.id,
        },
      ],
    },
    {
      title: 'area-administrativa',
      href: '/area-administrativa',
      icon: 'folderOpen',
      label: 'Área Administrativa',
      items: [
        {
          title: 'reports-list',
          href: '/reports',
          icon: 'fileText',
          label: 'Lista de Relatórios',
          funcionalidadeId: modules.reports.permissions.reportsList.id,
        },
        {
          title: 'report-designer',
          href: '/reports/designer?newReport=true',
          icon: 'fileText',
          label: 'Report Designer',
          funcionalidadeId: modules.reports.permissions.reportDesigner.id,
          openInNewTab: true,
        },
      ],
    },
    {
      title: 'area-gestao',
      href: '/area-gestao',
      icon: 'briefcase',
      label: 'Área Gestão',
    },
    {
      title: 'area-financeira',
      href: '/area-financeira',
      icon: 'building2',
      label: 'Área Financeira',
    },
    {
      title: 'area-aprovisionamento',
      href: '/area-aprovisionamento',
      icon: 'package',
      label: 'Área Aprovisionamento',
    },
    {
      title: 'area-comum',
      href: '/area-comum',
      icon: 'settings',
      label: 'Área Comum',
      moduloId: modules.areaComum.id,
      items: [
        {
          title: 'tabelas',
          href: '/area-comum',
          icon: 'list',
          label: 'Tabelas',
        },
        {
          title: 'posto-assinaturas',
          href: '/area-comum/posto-assinaturas',
          icon: 'edit',
          label: 'Posto de Assinaturas',
        },
        {
          title: 'utilitarios',
          href: '/area-comum/utilitarios',
          icon: 'settings',
          label: 'Utilitários',
        },
        {
          title: 'app-saude',
          href: '/area-comum/app-saude',
          icon: 'heart',
          label: 'App de Saúde',
        },
        {
          title: 'ajuda',
          href: '/area-comum/ajuda',
          icon: 'helpCircle',
          label: 'Ajuda',
        },
      ],
    },
  ],
  guest: [],
} as const

export const roleHeaderMenus = {
  client: {
    'processo-clinico': [
      {
        label: 'Atendimento ao Utente',
        href: '/area-clinica/processo-clinico/atendimento',
        icon: 'user',
        funcionalidadeId: modules.areaClinica.permissions.processoAtendimento.id,
        funcionalidadeFallbackIds: [
          modules.areaClinica.permissions.processoClinico.id,
        ],
        items: [
          {
            label: 'Consultas do Dia',
            href: '/area-clinica/processo-clinico/atendimento/consultas-do-dia',
            description: 'Consultas do dia',
            icon: 'clock',
          },
          {
            label: 'Ficha Clínica',
            href: '/area-clinica/processo-clinico/atendimento/ficha-clinica',
            description: 'Ficha clínica',
            icon: 'fileText',
          },
        ],
      },
      {
        label: 'Agenda',
        href: '/area-clinica/processo-clinico/agenda',
        icon: 'calendar',
        funcionalidadeId: modules.areaClinica.permissions.processoAgenda.id,
        funcionalidadeFallbackIds: [
          modules.areaClinica.permissions.processoClinico.id,
        ],
        items: [
          {
            label: 'Consultas Marcadas',
            href: '/area-clinica/processo-clinico/agenda/consultas-marcadas',
            description: 'Consultas marcadas',
            icon: 'clock',
          },
          {
            label: 'Listagem Consultas Marcadas',
            href: '/area-clinica/processo-clinico/agenda/listagem-consultas-marcadas',
            description: 'Listagem',
            icon: 'list',
          },
          {
            label: 'Mapa de Consultas Marcadas',
            href: '/area-clinica/processo-clinico/agenda/mapa-consultas-marcadas',
            description: 'Mapa',
            icon: 'tablerMap',
          },
        ],
      },
      {
        label: 'Exames Sem Papel',
        href: '/area-clinica/processo-clinico/exames',
        icon: 'fileText',
        funcionalidadeId: modules.areaClinica.permissions.processoExames.id,
        funcionalidadeFallbackIds: [
          modules.areaClinica.permissions.processoClinico.id,
        ],
        items: [
          {
            label: 'Exames Sem Papel',
            href: '/area-clinica/processo-clinico/exames/exames-sem-papel',
            description: 'Exames sem papel',
            icon: 'fileText',
          },
        ],
      },
      {
        label: 'Atestados Carta Condução',
        href: '/area-clinica/processo-clinico/atestados',
        icon: 'car',
        funcionalidadeId: modules.areaClinica.permissions.processoAtestados.id,
        funcionalidadeFallbackIds: [
          modules.areaClinica.permissions.processoClinico.id,
        ],
        items: [
          {
            label: 'Novo Atestado',
            href: '/area-clinica/processo-clinico/atestados/novo-atestado',
            description: 'Novo atestado',
            icon: 'add',
          },
          {
            label: 'Listagem Atestados',
            href: '/area-clinica/processo-clinico/atestados/listagem-atestados',
            description: 'Listagem',
            icon: 'list',
          },
        ],
      },
      {
        label: 'Histórico',
        href: '/area-clinica/processo-clinico/historico',
        icon: 'history',
        funcionalidadeId: modules.areaClinica.permissions.processoHistorico.id,
        funcionalidadeFallbackIds: [
          modules.areaClinica.permissions.processoClinico.id,
        ],
        items: [
          {
            label: 'Consultas Efetuadas',
            href: '/area-clinica/processo-clinico/historico/consultas-efetuadas',
            description: 'Consultas efetuadas',
            icon: 'history',
          },
          {
            label: 'Listagem Consultas Efetuadas',
            href: '/area-clinica/processo-clinico/historico/listagem-consultas-efetuadas',
            description: 'Listagem',
            icon: 'list',
          },
          {
            label: 'Mapa Consultas Efetuadas',
            href: '/area-clinica/processo-clinico/historico/mapa-consultas-efetuadas',
            description: 'Mapa',
            icon: 'tablerMap',
          },
        ],
      },
      {
        label: 'Tabelas',
        href: '/area-clinica/processo-clinico/tabelas',
        icon: 'list',
        funcionalidadeId: modules.areaClinica.permissions.processoTabelas.id,
        funcionalidadeFallbackIds: [
          modules.areaClinica.permissions.processoClinico.id,
        ],
        items: [
          {
            label: 'Medicamentos e terapêutica',
            href: '/area-clinica/processo-clinico/tabelas',
            items: [
              {
                label: 'Medicamentos',
                href: '/area-clinica/processo-clinico/tabelas/medicamentos',
                description: 'Medicamentos',
                icon: 'list',
              },
              {
                label: 'Outros Medicamentos',
                href: '/area-clinica/processo-clinico/tabelas/outros-medicamentos',
                description: 'Outros medicamentos',
                icon: 'list',
              },
              {
                label: 'Alergias',
                href: '/area-clinica/processo-clinico/tabelas/alergias',
                description: 'Alergias',
                icon: 'warning',
              },
            ],
          },
          {
            label: 'Profissionais e clínica',
            href: '/area-clinica/processo-clinico/tabelas',
            items: [
              {
                label: 'Médicos',
                href: '/area-clinica/processo-clinico/tabelas/medicos',
                description: 'Médicos',
                icon: 'user',
              },
              {
                label: 'Patologias',
                href: '/area-clinica/processo-clinico/tabelas/patologias',
                description: 'Patologias',
                icon: 'activity',
              },
              {
                label: 'História Clínica',
                href: '/area-clinica/processo-clinico/tabelas/historia-clinica',
                description: 'História clínica',
                icon: 'history',
              },
            ],
          },
          {
            label: 'Outros',
            href: '/area-clinica/processo-clinico/tabelas',
            items: [
              {
                label: 'Mapas de Body Chart',
                href: '/area-clinica/processo-clinico/tabelas/mapas-body-chart',
                description: 'Mapas body chart',
                icon: 'tablerMap',
              },
              {
                label: 'Estados Dentários',
                href: '/area-clinica/processo-clinico/tabelas/estados-dentarios',
                description: 'Estados dentários',
                icon: 'list',
              },
              {
                label: 'Feriados',
                href: '/area-clinica/processo-clinico/tabelas/feriados',
                description: 'Feriados',
                icon: 'calendar',
              },
            ],
          },
        ],
      },
    ],
    tabelas: [
      {
        label: 'Entidades',
        href: '/area-comum/tabelas/entidades',
        funcionalidadeId: modules.areaComum.permissions.entidades.id,
        items: [
          { label: 'Utentes', href: '/area-comum/tabelas/entidades/utentes', funcionalidadeId: modules.areaComum.permissions.utentes.id },
          { label: 'Médicos', href: '/area-comum/tabelas/entidades/medicos', funcionalidadeId: modules.areaComum.permissions.medicos.id },
          { label: 'Médicos Externos', href: '/area-comum/tabelas/entidades/medicos-externos', funcionalidadeId: modules.areaComum.permissions.medicosExternos.id },
          { label: 'Organismos', href: '/area-comum/tabelas/entidades/organismos', funcionalidadeId: modules.areaComum.permissions.organismos.id },
          { label: 'Centros de Saúde', href: '/area-comum/tabelas/entidades/centros-saude', funcionalidadeId: modules.areaComum.permissions.centrosSaude.id },
          { label: 'Funcionarios', href: '/area-comum/tabelas/entidades/funcionarios', funcionalidadeId: modules.areaComum.permissions.funcionarios.id },
          { label: 'Fornecedores', href: '/area-comum/tabelas/entidades/fornecedores', funcionalidadeId: modules.areaComum.permissions.fornecedores.id },
          { label: 'Empresas', href: '/area-comum/tabelas/entidades/empresas', funcionalidadeId: modules.areaComum.permissions.empresas.id },
          { label: 'Técnicos', href: '/area-comum/tabelas/entidades/tecnicos', funcionalidadeId: modules.areaComum.permissions.tecnicos.id },
        ],
      },
      { 
        label: 'Tabelas', 
        href: '/area-comum/tabelas',
        funcionalidadeId: modules.areaComum.permissions.tabelas.id,
        items: [
          {
            label: 'Geográficas',
            href: '/area-comum/tabelas/tabelas/geograficas',
            funcionalidadeId: modules.areaComum.permissions.geograficas.id,
            items: [
              { label: 'Países', href: '/area-comum/tabelas/tabelas/geograficas/paises', funcionalidadeId: modules.areaComum.permissions.paises.id },
              { label: 'Distritos', href: '/area-comum/tabelas/tabelas/geograficas/distritos', funcionalidadeId: modules.areaComum.permissions.distritos.id },
              { label: 'Concelhos', href: '/area-comum/tabelas/tabelas/geograficas/concelhos', funcionalidadeId: modules.areaComum.permissions.concelhos.id },
              { label: 'Freguesias', href: '/area-comum/tabelas/tabelas/geograficas/freguesias', funcionalidadeId: modules.areaComum.permissions.freguesias.id },
              { label: 'Códigos Postais', href: '/area-comum/tabelas/tabelas/geograficas/codigospostais', funcionalidadeId: modules.areaComum.permissions.codigospostais.id },
            ],
          },
         
          { label: 'Tipos de Entidades Financeiras', href: '/area-comum/tabelas/tabelas/tipos-entidades', funcionalidadeId: modules.areaComum.permissions.tiposEntidadesFinanceiras.id },
          { label: 'Entidades Financeiras Responsaveis', href: '/area-comum/tabelas/tabelas/entidades-financeiras-responsaveis', funcionalidadeId: modules.areaComum.permissions.entidadesFinanceirasResponsaveis.id },
          { label: 'Bancos', href: '/area-comum/tabelas/tabelas/bancos', funcionalidadeId: modules.areaComum.permissions.bancos.id },
          { label: 'Categorias das Especialidades', href : '/area-comum/tabelas/tabelas/categorias-das-especialidades', funcionalidadeId: modules.areaComum.permissions.categoriasEspecialidades.id },
          { label: 'Especialidades', href: '/area-comum/tabelas/tabelas/especialidades', funcionalidadeId: modules.areaComum.permissions.especialidades.id },
          { label: 'Estados Civis', href: '/area-comum/tabelas/tabelas/estados-civis', funcionalidadeId: modules.areaComum.permissions.estadosCivis.id },
          {
            label: 'Feriados',
            href: '/area-comum/tabelas/tabelas/feriados',
            funcionalidadeId: modules.areaComum.permissions.feriados.id,
          },
          { label: 'Grupos Sanguineos', href: '/area-comum/tabelas/tabelas/grupos-sanguineos', funcionalidadeId: modules.areaComum.permissions.gruposSanguineos.id },
          { label: 'Habilitações', href: '/area-comum/tabelas/tabelas/habilitacoes', funcionalidadeId: modules.areaComum.permissions.habilitacoes.id },
          {
            label: 'Tipos de notificação',
            href: '/area-comum/tabelas/notificacao-tipos',
            funcionalidadeId: modules.areaComum.permissions.notificacaoTipos.id,
          },
          {
            label: 'Notificações',
            href: '/area-comum/tabelas/notificacoes',
            funcionalidadeId: modules.areaComum.permissions.notificacoes.id,
          },
          {
            label: 'Notificações enviadas',
            href: '/area-comum/tabelas/notificacoes/enviadas',
            funcionalidadeId: modules.areaComum.permissions.notificacoesEnviadas.id,
          },
          {
            label: 'Notificações de atualização',
            href: '/area-comum/tabelas/notificacoes/atualizacoes',
            funcionalidadeId: modules.areaComum.permissions.notificacoesAtualizacao.id,
          },
          { label: 'Moedas', href: '/area-comum/tabelas/tabelas/moedas', funcionalidadeId: modules.areaComum.permissions.moedas.id },
          { label: 'Profissões', href: '/area-comum/tabelas/tabelas/profissoes', funcionalidadeId: modules.areaComum.permissions.profissoes.id },
          { label: 'Sexos', href: '/area-comum/tabelas/tabelas/sexos', funcionalidadeId: modules.areaComum.permissions.sexos.id },
          { label: 'Graus Parentesco', href: '/area-comum/tabelas/tabelas/graus-parentesco', funcionalidadeId: modules.areaComum.permissions.grausParentesco.id },
          { label: 'Taxas IVA', href: '/area-comum/tabelas/tabelas/taxas-iva', funcionalidadeId: modules.areaComum.permissions.taxasIva.id },
          { label: 'Proveniências Utentes', href: '/area-comum/tabelas/tabelas/proveniencias-utentes', funcionalidadeId: modules.areaComum.permissions.provenienciasUtentes.id },    
        ]
      
      },
      {
        label: 'Stocks',
        href: '/area-comum/tabelas/stocks',
        funcionalidadeId: modules.areaComum.permissions.stocks.id,
        items: [
          { label: 'Vias de Administração', href: '/area-comum/tabelas/stocks/vias-administracao', funcionalidadeId: modules.areaComum.permissions.viasAdministracao.id },
          { label: 'Grupo de Vias de Administração', href: '/area-comum/tabelas/stocks/grupo-vias-administracao', funcionalidadeId: modules.areaComum.permissions.grupoViasAdministracao.id },
        ],
      },
      { 
        label: 'Consultas', 
        href: '/area-comum/tabelas/consultas',
        funcionalidadeId: modules.areaComum.permissions.consultas.id,
        items: [
          { label: 'Margem de Médicos', href: '/area-comum/tabelas/consultas/margem-medicos', icon: 'user', funcionalidadeId: modules.areaComum.permissions.margemMedicos.id },
          {
            label: 'Serviços',
            href: '/area-comum/tabelas/consultas/servicos/servicos',
            description: 'Tabelas de serviços de consulta',
            icon: 'list',
            funcionalidadeId: modules.areaComum.permissions.servicos.id,
            dropdown: [
              {
                label: 'Serviços',
                href: '/area-comum/tabelas/consultas/servicos/servicos',
                description: 'Tabela de serviços',
                icon: 'list',
                funcionalidadeId: modules.areaComum.permissions.tabelaServicos.id,
              },
              {
                label: 'Subsistemas de Serviços',
                href: '/area-comum/tabelas/consultas/servicos/subsistemas-servicos',
                description: 'Tabela de subsistemas de serviços',
                icon: 'list',
                funcionalidadeId: modules.areaComum.permissions.subsistemasServicos.id,
              },
              {
                label: 'Tipos de Serviço',
                href: '/area-comum/tabelas/consultas/servicos/tipos-servico',
                description: 'Tabela de tipos de serviço',
                icon: 'list',
                funcionalidadeId: modules.areaComum.permissions.tiposServico.id,
              },
            ],
          },
          { label: 'Alergias', href: '/area-comum/tabelas/consultas/alergias', icon: 'warning', funcionalidadeId: modules.areaComum.permissions.alergias.id },
          { label: 'Graus de Alergia', href: '/area-comum/tabelas/consultas/graus-alergia', icon: 'warning', funcionalidadeId: modules.areaComum.permissions.grausAlergia.id },
          { label: 'Doenças', href: '/area-comum/tabelas/consultas/doencas', icon: 'activity', funcionalidadeId: modules.areaComum.permissions.doencas.id },
          { label: 'Tipos de Consultas', href: '/area-comum/tabelas/consultas/tipos-consultas', icon: 'list', funcionalidadeId: modules.areaComum.permissions.tiposConsultas.id },
        ],
      },
      {
        label: 'Tratamentos',
        href: '/area-comum/tabelas/tratamentos',
        funcionalidadeId: modules.areaComum.permissions.tratamentos.id,
        items: [
          { label: 'Locais de Tratamentos', href: '/area-comum/tabelas/tratamentos/locais-tratamento', funcionalidadeId: modules.areaComum.permissions.locaisTratamento.id },
          { label: 'Estados Lista Espera', href: '/area-comum/tabelas/tratamentos/estados-lista-espera', funcionalidadeId: modules.areaComum.permissions.estadosListaEspera.id },
          { label: 'Prioridades', href: '/area-comum/tabelas/tratamentos/prioridades' ,funcionalidadeId: modules.areaComum.permissions.prioridades.id},
          { label: 'Patologias', href: '/area-comum/tabelas/tratamentos/patologias' ,funcionalidadeId: modules.areaComum.permissions.patologias.id},
          { label: 'Regiões do Corpo', href: '/area-comum/tabelas/tratamentos/regioes-corpo' ,funcionalidadeId: modules.areaComum.permissions.regioesCorpo.id},
          { label: 'Goniometrias', href: '/area-comum/tabelas/tratamentos/goniometrias' ,funcionalidadeId: modules.areaComum.permissions.goniometrias.id},
          { label: 'Tipos de Dor', href: '/area-comum/tabelas/tratamentos/tipos-de-dor' ,funcionalidadeId: modules.areaComum.permissions.tiposDeDor.id},
          { label: 'Fraquezas Musculares', href: '/area-comum/tabelas/tratamentos/fraquezas-musculares' ,funcionalidadeId: modules.areaComum.permissions.fraquezasMusculares.id},
          { label: 'Motivos de Alta', href: '/area-comum/tabelas/tratamentos/motivos-alta', funcionalidadeId: modules.areaComum.permissions.motivosAlta.id },
          { label: 'Motivos de Desmarcação', href: '/area-comum/tabelas/tratamentos/motivos-desmarcacao', funcionalidadeId: modules.areaComum.permissions.motivosDesmarcacao.id },
          {
            label: 'Equipamentos',
            href: '/area-comum/tabelas/tratamentos',
            funcionalidadeId: modules.areaComum.permissions.equipamentos.id,
            items: [
              { label: 'Aparelhos', href: '/area-comum/tabelas/tratamentos/aparelhos', funcionalidadeId: modules.areaComum.permissions.aparelhos.id },
              { label: 'Tipo de Aparelhos', href: '/area-comum/tabelas/tratamentos/tipos-aparelho', funcionalidadeId: modules.areaComum.permissions.tiposAparelho.id },
              { label: 'Marcas', href: '/area-comum/tabelas/tratamentos/marcas-aparelho', funcionalidadeId: modules.areaComum.permissions.marcasAparelho.id },
              { label: 'Modelos', href: '/area-comum/tabelas/tratamentos/modelos-aparelho', funcionalidadeId: modules.areaComum.permissions.modelosAparelho.id },
            ],
          },
        ],
      },
      {
        label: 'Exames',
        href: '/area-comum/tabelas/exames',
        funcionalidadeId: modules.areaComum.permissions.exames.id,
        items: [
          { label: 'Categorias de Procedimento', href: '/area-comum/tabelas/exames/categorias-procedimento', funcionalidadeId: modules.areaComum.permissions.categoriasProcedimento.id },
          { label: 'Análises', href: '/area-comum/tabelas/exames/analises', funcionalidadeId: modules.areaComum.permissions.analises.id },
          { label: 'Tipos de Exame', href: '/area-comum/tabelas/exames/tipos-exame', funcionalidadeId: modules.areaComum.permissions.tiposExame.id },
          { label: 'Acordos', href: '/area-comum/tabelas/exames/acordos', funcionalidadeId: modules.areaComum.permissions.acordos.id },
        ],
      },
      {
        label: 'Configuração',
        href: '/area-comum/tabelas/configuracao/clinicas',
        funcionalidadeId: modules.areaComum.permissions.configuracoes.id,
        items: [
          
          {
            label: 'Configuração da Clínica',
            href: '/area-comum/tabelas/configuracao/clinicas',
            description: 'Listagem, ver e editar clínicas',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesClinica.id,
          },
          {
            label: 'Configuração de SMS',
            href: '/area-comum/tabelas/configuracao/sms',
            description: 'Configurar fornecedor SMS (Arpoone)',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesSms.id,
          },
          {
            label: 'Configuração de Voz',
            href: '/area-comum/tabelas/configuracao/voz',
            description: 'Configurar STT/TTS, idioma, voz e parâmetros de execução',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesVoz.id,
          },
          {
            label: 'Configuração de Teleconsulta',
            href: '/area-comum/tabelas/configuracao/teleconsulta',
            description: 'Configurar provider Jitsi, URL base, janela de entrada e parâmetros JWT',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesTeleconsulta.id,
          },
          {
            label: 'Configuração Atestados Carta Condução',
            href: '/area-comum/tabelas/configuracao/carta-conducao',
            description: 'Configurar URL online/offline, credenciais e autoridade de saúde pública',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesCartaConducao.id,
          },
          {
            label: 'Configuração de Email',
            href: '/area-comum/tabelas/configuracao/email',
            description: 'Configurar servidor de email e templates automáticos',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesEmail.id,
          },
          {
            label: 'Configuração WebServices',
            href: '/area-comum/tabelas/configuracao/webservices',
            description: 'Configurar endpoints e credenciais SPMS (materializadas e desmaterializadas)',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesWebservices.id,
          },
          {
            label: 'Configuração Exames Sem Papel',
            href: '/area-comum/tabelas/configuracao/exames-sem-papel',
            description: 'Configurar endpoints e credenciais para integração de Exames Sem Papel',
            funcionalidadeId:
              modules.areaComum.permissions.configuracoesExamesSemPapel.id,
          },
          {
            label: 'Gestão de Separadores',
            href: '/area-comum/tabelas/configuracao/ficha-clinica-secoes',
            description: 'Gestão de separadores e formulários personalizados',
            funcionalidadeId:
              modules.areaComum.permissions.gestaoSeparadores.id,
            items: [
              {
                label: 'Separadores',
                href: '/area-comum/tabelas/configuracao/separadores',
                funcionalidadeId:
                  modules.areaComum.permissions.separadores.id,
              },
              {
                label: 'Separadores Personalizados',
                href: '/area-comum/tabelas/configuracao/separadores-personalizados',
                funcionalidadeId:
                  modules.areaComum.permissions.separadoresPersonalizados.id,
              },
              {
                label: 'Formulários Personalizados',
                href: '/area-comum/tabelas/configuracao/ficha-clinica-secoes',
                funcionalidadeId:
                  modules.areaComum.permissions.formulariosPersonalizados.id,
              },
            ],
          },
          {
            label: 'Feriados',
            href: '/area-comum/tabelas/tabelas/feriados',
            description: 'Gestão de feriados',
            funcionalidadeId: modules.areaComum.permissions.feriados.id,
          },
          {
            label: 'Documentos',
            href: '/area-comum/tabelas/configuracao/documentos',
            description: 'Modelos documentais e editor',
            funcionalidadeId: modules.areaComum.permissions.documentos.id,
          },
          {
            label: 'Configuração Referências MB',
            href: '/area-comum/tabelas/configuracao/referencias-mb',
            description: 'Configurar integração IfThenPay e callback de liquidação',
            funcionalidadeId: modules.areaComum.permissions.referenciasMb.id,
          },
        ],
      },
      {
        label: 'Notificações',
        href: '/area-comum/tabelas/notificacoes',
        title: 'Notificações (legado CliCloud.ASPcli\\Client\\Comum)',
        items: [
          {
            label: 'Notificações',
            href: '/area-comum/tabelas/notificacoes',
            description: 'Caixa de entrada — NotificacoesLst.aspx',
            funcionalidadeId: modules.areaComum.permissions.notificacoes.id,
          },
          {
            label: 'Notificações enviadas',
            href: '/area-comum/tabelas/notificacoes/enviadas',
            description: 'NotificacoesEnviadasLst.aspx',
            funcionalidadeId: modules.areaComum.permissions.notificacoesEnviadas.id,
          },
          {
            label: 'Tipo de notificações',
            href: '/area-comum/tabelas/notificacao-tipos',
            description: 'NotificacoesTipoLst.aspx',
            funcionalidadeId: modules.areaComum.permissions.notificacaoTipos.id,
          },
          {
            label: 'Notificações de atualização',
            href: '/area-comum/tabelas/notificacoes/atualizacoes',
            description: 'NotificacoesAtualizacoesLst.aspx',
            funcionalidadeId: modules.areaComum.permissions.notificacoesAtualizacao.id,
          },
        ],
      },
    ],
    'app-saude': [],
    ajuda: [],
    utilitarios: [
      {
        label: 'Tabelas',
        href: '/utilitarios/tabelas/',
        icon: '',
        funcionalidadeId: '',
        items: [
          {
            label: 'Geográficas',
            href: '/utilitarios/tabelas/',
            description: 'Tabelas geográficas',
            icon: 'tablerMap',
            dropdown: [
              {
                label: 'Países',
                href: '/utilitarios/tabelas/geograficas/paises',
                description: 'Faça a gestão de países',
                icon: 'tablerMap',
                colors: {
                  colorful: 'bg-blue-400',
                  'theme-color': 'bg-primary',
                  pastel: 'bg-blue-200',
                  vibrant: 'bg-blue-500',
                  neon: 'bg-cyan-300',
                },
                funcionalidadeId: modules.areaComum.permissions.paises.id,
              },
              {
                label: 'Distritos',
                href: '/utilitarios/tabelas/geograficas/distritos',
                description: 'Faça a gestão de distritos',
                icon: 'tablerMap',
                colors: {
                  colorful: 'bg-blue-500',
                  'theme-color': 'bg-primary',
                  pastel: 'bg-blue-300',
                  vibrant: 'bg-blue-600',
                  neon: 'bg-cyan-400',
                },
                funcionalidadeId: modules.areaComum.permissions.distritos.id,
              },
              {
                label: 'Concelhos',
                href: '/utilitarios/tabelas/geograficas/concelhos',
                description: 'Faça a gestão de concelhos',
                icon: 'tablerMap',
                colors: {
                  colorful: 'bg-blue-600',
                  'theme-color': 'bg-primary',
                  pastel: 'bg-blue-400',
                  vibrant: 'bg-blue-700',
                  neon: 'bg-pink-400',
                },
                funcionalidadeId: modules.areaComum.permissions.concelhos.id,
              },
              {
                label: 'Freguesias',
                href: '/utilitarios/tabelas/geograficas/freguesias',
                description: 'Faça a gestão de freguesias',
                icon: 'tablerMap',
                colors: {
                  colorful: 'bg-blue-700',
                  'theme-color': 'bg-primary',
                  pastel: 'bg-blue-500',
                  vibrant: 'bg-blue-800',
                  neon: 'bg-yellow-400',
                },
                funcionalidadeId: modules.utilitarios.permissions.freguesias.id,
              },
              {
                label: 'Códigos Postais',
                href: '/utilitarios/tabelas/geograficas/codigospostais',
                description: 'Faça a gestão de códigos postais',
                icon: 'tablerMap',
                colors: {
                  colorful: 'bg-blue-800',
                  'theme-color': 'bg-primary',
                  pastel: 'bg-blue-600',
                  vibrant: 'bg-blue-900',
                  neon: 'bg-green-400',
                },
                funcionalidadeId:
                  modules.utilitarios.permissions.codigospostais.id,
              },
              {
                label: 'Ruas',
                href: '/utilitarios/tabelas/geograficas/ruas',
                description: 'Faça a gestão de ruas',
                icon: 'tablerMap',
                colors: {
                  colorful: 'bg-blue-900',
                  'theme-color': 'bg-primary',
                  pastel: 'bg-blue-700',
                  vibrant: 'bg-blue-950',
                  neon: 'bg-purple-400',
                },
                funcionalidadeId: modules.utilitarios.permissions.ruas.id,
              },
            ],
          },
        ],
      },
    ],
    
  },
  guest: {},
} as const
