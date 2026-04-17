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
          funcionalidadeId: modules.areaComum.permissions.tabelas.id,
        },
        {
          title: 'posto-assinaturas',
          href: '/area-comum/posto-assinaturas',
          icon: 'edit',
          label: 'Posto de Assinaturas',
          funcionalidadeId: modules.areaComum.permissions.tabelas.id,
        },
        {
          title: 'utilitarios',
          href: '/area-comum/utilitarios',
          icon: 'settings',
          label: 'Utilitários',
          funcionalidadeId: modules.areaComum.permissions.utilitarios.id,
        },
        {
          title: 'app-saude',
          href: '/area-comum/app-saude',
          icon: 'heart',
          label: 'App de Saúde',
          funcionalidadeId: modules.areaComum.permissions.appSaude.id,
        },
        {
          title: 'ajuda',
          href: '/area-comum/ajuda',
          icon: 'helpCircle',
          label: 'Ajuda',
          funcionalidadeId: modules.areaComum.permissions.ajuda.id,
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
        items: [
          { label: 'Consultas do Dia', href: '/area-clinica/processo-clinico/atendimento/consultas-do-dia', description: 'Consultas do dia', icon: 'clock' },
          { label: 'Ficha Clínica', href: '/area-clinica/processo-clinico/atendimento/ficha-clinica', description: 'Ficha clínica', icon: 'fileText' },
        ],
      },
      {
        label: 'Agenda',
        href: '/area-clinica/processo-clinico/agenda',
        icon: 'calendar',
        items: [
          { label: 'Consultas Marcadas', href: '/area-clinica/processo-clinico/agenda/consultas-marcadas', description: 'Consultas marcadas', icon: 'clock' },
          { label: 'Listagem Consultas Marcadas', href: '/area-clinica/processo-clinico/agenda/listagem-consultas-marcadas', description: 'Listagem', icon: 'list' },
          { label: 'Mapa de Consultas Marcadas', href: '/area-clinica/processo-clinico/agenda/mapa-consultas-marcadas', description: 'Mapa', icon: 'tablerMap' },
        ],
      },
      {
        label: 'Exames Sem Papel',
        href: '/area-clinica/processo-clinico/exames',
        icon: 'fileText',
        items: [
          { label: 'Exames Sem Papel', href: '/area-clinica/processo-clinico/exames/exames-sem-papel', description: 'Exames sem papel', icon: 'fileText' },
        ],
      },
      {
        label: 'Atestados Carta Condução',
        href: '/area-clinica/processo-clinico/atestados',
        icon: 'car',
        items: [
          { label: 'Novo Atestado', href: '/area-clinica/processo-clinico/atestados/novo-atestado', description: 'Novo atestado', icon: 'add' },
          { label: 'Listagem Atestados', href: '/area-clinica/processo-clinico/atestados/listagem-atestados', description: 'Listagem', icon: 'list' },
        ],
      },
      {
        label: 'Histórico',
        href: '/area-clinica/processo-clinico/historico',
        icon: 'history',
        items: [
          { label: 'Consultas Efetuadas', href: '/area-clinica/processo-clinico/historico/consultas-efetuadas', description: 'Consultas efetuadas', icon: 'history' },
          { label: 'Listagem Consultas Efetuadas', href: '/area-clinica/processo-clinico/historico/listagem-consultas-efetuadas', description: 'Listagem', icon: 'list' },
          { label: 'Mapa Consultas Efetuadas', href: '/area-clinica/processo-clinico/historico/mapa-consultas-efetuadas', description: 'Mapa', icon: 'tablerMap' },
        ],
      },
      {
        label: 'Tabelas',
        href: '/area-clinica/processo-clinico/tabelas',
        icon: 'list',
        items: [
          { label: 'Medicamentos', href: '/area-clinica/processo-clinico/tabelas/medicamentos', description: 'Medicamentos', icon: 'list' },
          { label: 'Outros Medicamentos', href: '/area-clinica/processo-clinico/tabelas/outros-medicamentos', description: 'Outros medicamentos', icon: 'list' },
          { label: 'Médicos', href: '/area-clinica/processo-clinico/tabelas/medicos', description: 'Médicos', icon: 'user' },
          { label: 'Patologias', href: '/area-clinica/processo-clinico/tabelas/patologias', description: 'Patologias', icon: 'activity' },
          { label: 'História Clínica', href: '/area-clinica/processo-clinico/tabelas/historia-clinica', description: 'História clínica', icon: 'history' },
          { label: 'Mapas de Body Chart', href: '/area-clinica/processo-clinico/tabelas/mapas-body-chart', description: 'Mapas body chart', icon: 'tablerMap' },
          { label: 'Alergias', href: '/area-clinica/processo-clinico/tabelas/alergias', description: 'Alergias', icon: 'warning' },
          { label: 'Estados Dentários', href: '/area-clinica/processo-clinico/tabelas/estados-dentarios', description: 'Estados dentários', icon: 'list' },
          { label: 'Feriados', href: '/area-clinica/processo-clinico/tabelas/feriados', description: 'Feriados', icon: 'calendar' },
        ],
      },
    ],
    tabelas: [
      {
        label: 'Entidades',
        href: '/area-comum/tabelas/entidades',
        items: [
          { label: 'Utentes', href: '/area-comum/tabelas/entidades/utentes' },
          { label: 'Médicos', href: '/area-comum/tabelas/entidades/medicos' },
          { label: 'Médicos Externos', href: '/area-comum/tabelas/entidades/medicos-externos' },
          { label: 'Organismos', href: '/area-comum/tabelas/entidades/organismos' },
          { label: 'Centros de Saúde', href: '/area-comum/tabelas/entidades/centros-saude' },
          { label: 'Funcionarios', href: '/area-comum/tabelas/entidades/funcionarios' },
          { label: 'Fornecedores', href: '/area-comum/tabelas/entidades/fornecedores' },
          { label: 'Empresas', href: '/area-comum/tabelas/entidades/empresas' },
          { label: 'Técnicos', href: '/area-comum/tabelas/entidades/tecnicos' },
        ],
      },
      { 
        label: 'Tabelas', 
        href: '/area-comum/tabelas',
        items: [
          {
            label: 'Geográficas',
            href: '/area-comum/tabelas/tabelas/geograficas',
            items: [
              { label: 'Países', href: '/area-comum/tabelas/tabelas/geograficas/paises' },
              { label: 'Distritos', href: '/area-comum/tabelas/tabelas/geograficas/distritos' },
              { label: 'Concelhos', href: '/area-comum/tabelas/tabelas/geograficas/concelhos' },
              { label: 'Freguesias', href: '/area-comum/tabelas/tabelas/geograficas/freguesias' },
              { label: 'Códigos Postais', href: '/area-comum/tabelas/tabelas/geograficas/codigospostais' },
            ],
          },
         
          { label: 'Tipos de Entidades Financeiras', href: '/area-comum/tabelas/tabelas/tipos-entidades'},
          { label: 'Entidades Financeiras Responsaveis', href: '/area-comum/tabelas/tabelas/entidades-financeiras-responsaveis'},
          { label: 'Bancos', href: '/area-comum/tabelas/tabelas/bancos'},
          { label: 'Categorias das Especialidades', href : '/area-comum/tabelas/tabelas/categorias-das-especialidades'},
          { label: 'Especialidades', href: '/area-comum/tabelas/tabelas/especialidades' },
          { label: 'Estados Civis', href: '/area-comum/tabelas/tabelas/estados-civis'},
          { label: 'Feriados', href: '/area-comum/tabelas/tabelas/feriados'},
          { label: 'Grupos Sanguineos', href: '/area-comum/tabelas/tabelas/grupos-sanguineos'},
          { label: 'Habilitações', href: '/area-comum/tabelas/tabelas/habilitacoes'},
          { label: 'Moedas', href: '/area-comum/tabelas/tabelas/moedas'},
          { label: 'Profissões', href: '/area-comum/tabelas/tabelas/profissoes'},
          { label: 'Sexos', href: '/area-comum/tabelas/tabelas/sexos'},
          { label: 'Graus Parentesco', href: '/area-comum/tabelas/tabelas/graus-parentesco'},
          { label: 'Taxas IVA', href: '/area-comum/tabelas/tabelas/taxas-iva'},
          { label: 'Proveniências Utentes', href: '/area-comum/tabelas/tabelas/proveniencias-utentes'},    
        ]
      
      },
      {
        label: 'Stocks',
        href: '/area-comum/tabelas/stocks',
        items: [
          { label: 'Vias de Administração', href: '/area-comum/tabelas/stocks/vias-administracao' },
          { label: 'Grupo de Vias de Administração', href: '/area-comum/tabelas/stocks/grupo-vias-administracao' },
        ],
      },
      { 
        label: 'Consultas', 
        href: '/area-comum/tabelas/consultas',
        items: [
          { label: 'Margem de Médicos', href: '/area-comum/tabelas/consultas/margem-medicos', icon: 'user' },
          {
            label: 'Serviços',
            href: '/area-comum/tabelas/consultas/servicos/servicos',
            description: 'Tabelas de serviços de consulta',
            icon: 'list',
            dropdown: [
              {
                label: 'Serviços',
                href: '/area-comum/tabelas/consultas/servicos/servicos',
                description: 'Tabela de serviços',
                icon: 'list',
              },
              {
                label: 'Subsistemas de Serviços',
                href: '/area-comum/tabelas/consultas/servicos/subsistemas-servicos',
                description: 'Tabela de subsistemas de serviços',
                icon: 'list',
              },
              {
                label: 'Tipos de Serviço',
                href: '/area-comum/tabelas/consultas/servicos/tipos-servico',
                description: 'Tabela de tipos de serviço',
                icon: 'list',
              },
            ],
          },
          { label: 'Alergias', href: '/area-comum/tabelas/consultas/alergias', icon: 'warning' },
          { label: 'Graus de Alergia', href: '/area-comum/tabelas/consultas/graus-alergia', icon: 'warning' },
          { label: 'Doenças', href: '/area-comum/tabelas/consultas/doencas', icon: 'activity' },
          { label: 'Tipos de Consultas', href: '/area-comum/tabelas/consultas/tipos-consultas', icon: 'list' },
        ],
      },
      {
        label: 'Tratamentos',
        href: '/area-comum/tabelas/tratamentos',
        items: [
          { label: 'Locais de Tratamentos', href: '/area-comum/tabelas/tratamentos/locais-tratamento' },
          { label: 'Estados Lista Espera', href: '/area-comum/tabelas/tratamentos/estados-lista-espera' },
          { label: 'Prioridades', href: '/area-comum/tabelas/tratamentos/prioridades' },
          { label: 'Patologias', href: '/area-comum/tabelas/tratamentos/patologias' },
          { label: 'Regiões do Corpo', href: '/area-comum/tabelas/tratamentos/regioes-corpo' },
          { label: 'Goniometrias', href: '/area-comum/tabelas/tratamentos/goniometrias' },
          { label: 'Tipos de Dor', href: '/area-comum/tabelas/tratamentos/tipos-de-dor' },
          { label: 'Fraquezas Musculares', href: '/area-comum/tabelas/tratamentos/fraquezas-musculares' },
          { label: 'Motivos de Alta', href: '/area-comum/tabelas/tratamentos/motivos-alta' },
          { label: 'Motivos de Desmarcação', href: '/area-comum/tabelas/tratamentos/motivos-desmarcacao' },
          {
            label: 'Equipamentos',
            href: '/area-comum/tabelas/tratamentos',
            items: [
              { label: 'Aparelhos', href: '/area-comum/tabelas/tratamentos/aparelhos' },
              { label: 'Tipo de Aparelhos', href: '/area-comum/tabelas/tratamentos/tipos-aparelho' },
              { label: 'Marcas', href: '/area-comum/tabelas/tratamentos/marcas-aparelho' },
              { label: 'Modelos', href: '/area-comum/tabelas/tratamentos/modelos-aparelho' },
            ],
          },
        ],
      },
      {
        label: 'Exames',
        href: '/area-comum/tabelas/exames',
        items: [
          { label: 'Categorias de Procedimento', href: '/area-comum/tabelas/exames/categorias-procedimento' },
          { label: 'Análises', href: '/area-comum/tabelas/exames/analises' },
          { label: 'Tipos de Exame', href: '/area-comum/tabelas/exames/tipos-exame' },
          { label: 'Acordos', href: '/area-comum/tabelas/exames/acordos' },
        ],
      },
      {
        label: 'Configuração',
        href: '/area-comum/tabelas/configuracao/clinicas',
        items: [
          
          {
            label: 'Configuração da Clínica',
            href: '/area-comum/tabelas/configuracao/clinicas',
            description: 'Listagem, ver e editar clínicas',
          },
          {
            label: 'Configuração de SMS',
            href: '/area-comum/tabelas/configuracao/sms',
            description: 'Configurar fornecedor SMS (Arpoone)',
          },
          {
            label: 'Configuração de Voz',
            href: '/area-comum/tabelas/configuracao/voz',
            description: 'Configurar STT/TTS, idioma, voz e parâmetros de execução',
          },
          {
            label: 'Configuração de Teleconsulta',
            href: '/area-comum/tabelas/configuracao/teleconsulta',
            description: 'Configurar provider Jitsi, URL base, janela de entrada e parâmetros JWT',
          },
          {
            label: 'Configuração Atestados Carta Condução',
            href: '/area-comum/tabelas/configuracao/carta-conducao',
            description: 'Configurar URL online/offline, credenciais e autoridade de saúde pública',
          },
          {
            label: 'Configuração de Email',
            href: '/area-comum/tabelas/configuracao/email',
            description: 'Configurar servidor de email e templates automáticos',
          },
          {
            label: 'Configuração WebServices',
            href: '/area-comum/tabelas/configuracao/webservices',
            description: 'Configurar endpoints e credenciais SPMS (materializadas e desmaterializadas)',
          },
          {
            label: 'Configuração Exames Sem Papel',
            href: '/area-comum/tabelas/configuracao/exames-sem-papel',
            description: 'Configurar endpoints e credenciais para integração de Exames Sem Papel',
          },
          {
            label: 'Gestão de Separadores',
            href: '/area-comum/tabelas/configuracao/ficha-clinica-secoes',
            description: 'Gestão de separadores e formulários personalizados',
            items: [
              {
                label: 'Separadores',
                href: '/area-comum/tabelas/configuracao/separadores',
              },
              {
                label: 'Separadores Personalizados',
                href: '/area-comum/tabelas/configuracao/separadores-personalizados',
              },
              {
                label: 'Formulários Personalizados',
                href: '/area-comum/tabelas/configuracao/ficha-clinica-secoes',
              },
            ],
          },
          {
            label: 'Feriados',
            href: '/area-comum/tabelas/tabelas/feriados',
            description: 'Gestão de feriados',
          },
          {
            label: 'Documentos',
            href: '/area-comum/tabelas/configuracao/documentos',
            description: 'Modelos documentais e editor',
          },
          {
            label: 'Configuração Referências MB',
            href: '/area-comum/tabelas/configuracao/referencias-mb',
            description: 'Configurar integração IfThenPay e callback de liquidação',
          },
        ],
      },
      { label: 'Notificações', href: '/area-comum/tabelas/notificacoes' },
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
                funcionalidadeId: modules.utilitarios.permissions.paises.id,
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
                funcionalidadeId: modules.utilitarios.permissions.distritos.id,
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
                funcionalidadeId: modules.utilitarios.permissions.concelhos.id,
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
