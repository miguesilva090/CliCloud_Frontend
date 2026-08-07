import { modules } from './modules'

const perm = modules.areaAdministrativa.permissions.consultas.id
const permListaEspera = modules.areaAdministrativa.permissions.listaEsperaTratamentos.id
const permAdmissoes = modules.areaAdministrativa.permissions.admissoes.id
const permSinistrados = modules.areaAdministrativa.permissions.sinistrados.id
const permEntidades = modules.areaAdministrativa.permissions.entidades.id
const permMedicos = modules.areaAdministrativa.permissions.medicos.id
const permFisioterapeutas =
  modules.areaAdministrativa.permissions.fisioterapeutas.id
const permTabelas = modules.areaAdministrativa.permissions.tabelas.id
const permServicos = modules.areaAdministrativa.permissions.servicos.id
const permSubsistemas = modules.areaAdministrativa.permissions.subsistemaServicos.id
const permPrioridades = modules.areaAdministrativa.permissions.prioridades.id
const permExamesSemPapel = modules.areaClinica.permissions.examesSemPapel.id
const permExamesSemPapelFallback = [
  modules.areaClinica.permissions.examesSemPapelSubmenu.id,
]

/** Header Área Administrativa → Tratamentos (paridade WSMenus.asmx case "Tratamentos"). */
export const administrativaTratamentosHeaderMenu = [
  {
    label: 'Planning',
    href: '/area-administrativa/tratamentos/planning',
    funcionalidadeId: perm,
    items: [
      {
        label: 'Planning Geral',
        href: '/area-administrativa/tratamentos/planning',
        funcionalidadeId: perm,
      },
      {
        label: 'Pesquisa de Vaga',
        href: '/area-administrativa/tratamentos/planning/pesquisa',
        funcionalidadeId: perm,
      },
    ],
  },
  {
    label: 'Tratamentos',
    href: '/area-administrativa/tratamentos/lista-espera',
    funcionalidadeId: perm,
    items: [
      {
        label: 'Lista de Espera (Prescrições)',
        href: '/area-administrativa/tratamentos/lista-espera',
        funcionalidadeId: permListaEspera,
      },
      {
        label: 'Marcações Automáticas',
        href: '/area-administrativa/tratamentos/marcacoes-automaticas',
        funcionalidadeId: perm,
      },
      {
        label: 'Marcações Manuais',
        href: '/area-administrativa/tratamentos/marcacoes-manuais',
        funcionalidadeId: perm,
      },
      {
        label: 'Marcados/Iniciados',
        href: '/area-administrativa/tratamentos/tratamentos-marcados',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Local Tratamento',
        href: '/area-administrativa/tratamentos/tratamentos-por-local',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Utente',
        href: '/area-administrativa/tratamentos/tratamentos-por-utente',
        funcionalidadeId: perm,
      },
    ],
  },
  {
    label: 'Tratamentos Diários',
    href: '/area-administrativa/tratamentos/admissoes',
    funcionalidadeId: permAdmissoes,
    items: [
      {
        label: 'Utentes/Hora',
        href: '/area-administrativa/tratamentos/admissoes',
        funcionalidadeId: permAdmissoes,
      },
      {
        label: 'Utentes Presentes',
        href: '/area-administrativa/tratamentos/admissoes/presentes',
        funcionalidadeId: permAdmissoes,
      },
      {
        label: 'Local de Tratamento',
        href: '/area-administrativa/tratamentos/admissoes/local-tratamento',
        funcionalidadeId: permAdmissoes,
      },
      {
        label: 'Fecho Diário',
        href: '/area-administrativa/tratamentos/fecho-diario',
        funcionalidadeId: permAdmissoes,
      },
    ],
  },
  {
    label: 'Credenciais S.N.S.',
    href: '/area-administrativa/credenciais',
    items: [
      {
        label: 'Lançamento de Credenciais',
        href: '/area-administrativa/credenciais',
        funcionalidadeId: perm,
      },
      {
        label: 'Exames Sem Papel',
        href: '/area-administrativa/credenciais/exames-sem-papel',
        funcionalidadeId: permExamesSemPapel,
        funcionalidadeFallbackIds: permExamesSemPapelFallback,
      },
      {
        label: 'Exames Sem Papel - Histórico',
        href: '/area-administrativa/credenciais/exames-sem-papel-historico',
        funcionalidadeId: permExamesSemPapel,
        funcionalidadeFallbackIds: permExamesSemPapelFallback,
      },
    ],
  },
  {
    label: 'Sinistrados',
    href: '/area-administrativa/consultas/sinistrados',
    funcionalidadeId: permSinistrados,
    items: [
      {
        label: 'Registos',
        href: '/area-administrativa/consultas/sinistrados',
        funcionalidadeId: permSinistrados,
      },
    ],
  },
  {
    label: 'Histórico',
    href: '/area-administrativa/tratamentos/historico/datas',
    funcionalidadeId: perm,
    items: [
      {
        label: 'Por Datas',
        href: '/area-administrativa/tratamentos/historico/datas',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Utente',
        href: '/area-administrativa/tratamentos/historico/utentes',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Fisioterapeuta',
        href: '/area-administrativa/tratamentos/historico/fisioterapeuta',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Auxiliar',
        href: '/area-administrativa/tratamentos/historico/auxiliar',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Terap. Ocupacional',
        href: '/area-administrativa/tratamentos/historico/outro',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Organimo',
        href: '/area-administrativa/tratamentos/historico/organismo',
        funcionalidadeId: perm,
      },
      {
        label: 'Por Credencial',
        href: '/area-administrativa/tratamentos/historico/credencial',
        funcionalidadeId: perm,
      },
    ],
  },
  {
    label: 'Mapas',
    href: '/area-administrativa/tratamentos/mapas/livro-caixa/geral',
    funcionalidadeId: perm,
    items: [
      {
        label: 'Livro Caixa',
        href: '/area-administrativa/tratamentos/mapas/livro-caixa/geral',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Geral',
            href: '/area-administrativa/tratamentos/mapas/livro-caixa/geral',
            funcionalidadeId: perm,
          },
          {
            label: 'Por Utilizador',
            href: '/area-administrativa/tratamentos/mapas/livro-caixa/por-utilizador',
            funcionalidadeId: perm,
          },
          {
            label: 'Local de Tratamento',
            href: '/area-administrativa/tratamentos/mapas/livro-caixa/local-tratamento',
            funcionalidadeId: perm,
          },
          {
            label: 'Médico',
            href: '/area-administrativa/tratamentos/mapas/livro-caixa/medico',
            funcionalidadeId: perm,
          },
          {
            label: 'Organismo',
            href: '/area-administrativa/tratamentos/mapas/livro-caixa/organismo',
            funcionalidadeId: perm,
          },
        ],
      },
      {
        label: 'Organismo',
        href: '/area-administrativa/tratamentos/mapas/organismo/entre-datas',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Entre Datas',
            href: '/area-administrativa/tratamentos/mapas/organismo/entre-datas',
            funcionalidadeId: perm,
          },
          {
            label: 'Quantidade/Utente',
            href: '/area-administrativa/tratamentos/mapas/organismo/quantidade-utente',
            funcionalidadeId: perm,
          },
          {
            label: 'Geral',
            href: '/area-administrativa/tratamentos/mapas/organismo/geral',
            funcionalidadeId: perm,
          },
          {
            label: 'A.D.M.',
            href: '/area-administrativa/tratamentos/mapas/organismo/adm',
            funcionalidadeId: perm,
          },
          {
            label: 'SAD/GNR - SAD/PSP',
            href: '/area-administrativa/tratamentos/mapas/organismo/sad-gnr',
            funcionalidadeId: perm,
          },
        ],
      },
      {
        label: 'Técnicos',
        href: '/area-administrativa/tratamentos/mapas/tecnicos/fisioterapeuta',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Fisioterapeuta',
            href: '/area-administrativa/tratamentos/mapas/tecnicos/fisioterapeuta',
            funcionalidadeId: perm,
          },
          {
            label: 'Auxiliar',
            href: '/area-administrativa/tratamentos/mapas/tecnicos/auxiliar',
            funcionalidadeId: perm,
          },
          {
            label: 'Terapeuta Ocup./Fala',
            href: '/area-administrativa/tratamentos/mapas/tecnicos/terapeuta-ocupacional',
            funcionalidadeId: perm,
          },
        ],
      },
      {
        label: 'Taxa Moderadora',
        href: '/area-administrativa/tratamentos/mapas/taxa-moderadora',
        funcionalidadeId: perm,
      },
      {
        label: 'Médico',
        href: '/area-administrativa/tratamentos/mapas/medico',
        funcionalidadeId: perm,
      },
      {
        label: 'Utente',
        href: '/area-administrativa/tratamentos/mapas/utente',
        funcionalidadeId: perm,
      },
      {
        label: 'Local Tratamento',
        href: '/area-administrativa/tratamentos/mapas/local-tratamento',
        funcionalidadeId: perm,
      },
      {
        label: 'Tipo Serviço',
        href: '/area-administrativa/tratamentos/mapas/tipo-servico',
        funcionalidadeId: perm,
      },
      {
        label: 'Serviço',
        href: '/area-administrativa/tratamentos/mapas/servico',
        funcionalidadeId: perm,
      },
    ],
  },
  {
    label: 'Entidades',
    href: '/area-comum/tabelas/entidades/utentes',
    funcionalidadeId: permEntidades,
    items: [
      {
        label: 'Utentes',
        href: '/area-comum/tabelas/entidades/utentes',
        funcionalidadeId: perm,
      },
      {
        label: 'Organismos',
        href: '/area-comum/tabelas/entidades/organismos',
        funcionalidadeId: perm,
      },
      {
        label: 'Médicos',
        href: '/area-administrativa/entidades/medicos',
        funcionalidadeId: permMedicos,
      },
      {
        label: 'Médicos Externos',
        href: '/area-comum/tabelas/entidades/medicos-externos',
        funcionalidadeId: perm,
      },
      {
        label: 'Fisioterapeutas',
        href: '/area-administrativa/tratamentos/entidades/fisioterapeutas',
        funcionalidadeId: permFisioterapeutas,
      },
      {
        label: 'Técnicos Auxiliares',
        href: '/area-administrativa/tratamentos/entidades/tecnicos-auxiliares',
        funcionalidadeId: permFisioterapeutas,
      },
      {
        label: 'Terapeutas Fala/Ocupacionais',
        href: '/area-administrativa/tratamentos/entidades/terapeutas-ocupacionais',
        funcionalidadeId: permFisioterapeutas,
      },
    ],
  },
  {
    label: 'Estatísticas',
    href: '/area-administrativa/tratamentos/estatisticas/marcacoes/dia-hora',
    funcionalidadeId: perm,
    items: [
      {
        label: 'Marcações',
        href: '/area-administrativa/tratamentos/estatisticas/marcacoes/dia-hora',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Dia/Hora',
            href: '/area-administrativa/tratamentos/estatisticas/marcacoes/dia-hora',
            funcionalidadeId: perm,
          },
          {
            label: 'Técnico',
            href: '/area-administrativa/tratamentos/estatisticas/marcacoes/tecnico',
            funcionalidadeId: perm,
          },
          {
            label: 'Mensal',
            href: '/area-administrativa/tratamentos/estatisticas/marcacoes/mensal',
            funcionalidadeId: perm,
          },
        ],
      },
      {
        label: 'Tratamentos Realizados',
        href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/organismos-datas',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Organismos/Datas',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/organismos-datas',
            funcionalidadeId: perm,
          },
          {
            label: 'Técnico Com Controlo',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/tecnico-controlo',
            funcionalidadeId: perm,
          },
          {
            label: 'Técnico Completo',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/tecnico-completo',
            funcionalidadeId: perm,
          },
          {
            label: 'Utentes/Técnico',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/utentes-tecnico',
            funcionalidadeId: perm,
          },
          {
            label: 'Mensal',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/mensal',
            funcionalidadeId: perm,
          },
          {
            label: 'Marcados/Realizados',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/marcados-realizados',
            funcionalidadeId: perm,
          },
          {
            label: 'Serviços/Mês',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/servicos-mes',
            funcionalidadeId: perm,
          },
          {
            label: 'Nº Utentes/Ano',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/utentes-ano',
            funcionalidadeId: perm,
          },
          {
            label: 'Nº Utentes/Mês',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/utentes-mes',
            funcionalidadeId: perm,
          },
          {
            label: 'Patologias',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/patologias',
            funcionalidadeId: perm,
          },
          {
            label: 'Tratamentos Por Grupo Etário',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/grupo-etario',
            funcionalidadeId: perm,
          },
          {
            label: 'Utentes/Hora',
            href: '/area-administrativa/tratamentos/estatisticas/tratamentos-realizados/utentes-hora',
            funcionalidadeId: perm,
          },
        ],
      },
      {
        label: 'Médias',
        href: '/area-administrativa/tratamentos/estatisticas/medias/por-utente',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Por Utente',
            href: '/area-administrativa/tratamentos/estatisticas/medias/por-utente',
            funcionalidadeId: perm,
          },
          {
            label: 'Por Organismo',
            href: '/area-administrativa/tratamentos/estatisticas/medias/por-organismo',
            funcionalidadeId: perm,
          },
          {
            label: 'Por local de Tratamento',
            href: '/area-administrativa/tratamentos/estatisticas/medias/por-local-tratamento',
            funcionalidadeId: perm,
          },
        ],
      },
      {
        label: 'Utente Por Organismo',
        href: '/area-administrativa/tratamentos/estatisticas/utente-organismo/tratamentos',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Tratamentos',
            href: '/area-administrativa/tratamentos/estatisticas/utente-organismo/tratamentos',
            funcionalidadeId: perm,
          },
          {
            label: 'Lista de Espera',
            href: '/area-administrativa/tratamentos/estatisticas/utente-organismo/lista-espera',
            funcionalidadeId: perm,
          },
        ],
      },
      {
        label: 'Mapa Produção',
        href: '/area-administrativa/tratamentos/estatisticas/mapa-producao',
        funcionalidadeId: perm,
      },
      {
        label: 'Mapa Taxa de Ocupação',
        href: '/area-administrativa/tratamentos/estatisticas/taxa-ocupacao',
        funcionalidadeId: perm,
      },
      {
        label: 'Mapa Produção Resumo',
        href: '/area-administrativa/tratamentos/estatisticas/mapa-producao-resumo',
        funcionalidadeId: perm,
      },
    ],
  },
  {
    label: 'Tabelas',
    href: '/area-administrativa/tratamentos/tabelas/margem-fisioterapeutas',
    funcionalidadeId: permTabelas,
    items: [
      {
        label: 'Margem Fisioterapeutas',
        href: '/area-administrativa/tratamentos/tabelas/margem-fisioterapeutas',
        funcionalidadeId: perm,
      },
      {
        label: 'Locais de Tratamentos',
        href: '/area-comum/tabelas/tratamentos/locais-tratamento',
        funcionalidadeId: perm,
      },
      {
        label: 'Serviços',
        href: '/area-administrativa/tabelas/servicos',
        funcionalidadeId: permServicos,
      },
      {
        label: 'Subsistemas de Serviços',
        href: '/area-administrativa/tabelas/subsistemas-servicos',
        funcionalidadeId: permSubsistemas,
      },
      {
        label: 'Patologias',
        href: '/area-comum/tabelas/tratamentos/patologias',
        funcionalidadeId: perm,
      },
      {
        label: 'Estados Lista Espera',
        href: '/area-comum/tabelas/tratamentos/estados-lista-espera',
        funcionalidadeId: perm,
      },
      {
        label: 'Prioridades',
        href: '/area-comum/tabelas/tratamentos/prioridades',
        funcionalidadeId: permPrioridades,
      },
      {
        label: 'Periodicidade',
        href: '/area-administrativa/tratamentos/tabelas/periodicidade',
        funcionalidadeId: perm,
      },
      {
        label: 'Tipo de Tratamentos',
        href: '/area-administrativa/tratamentos/tabelas/tipos-tratamento',
        funcionalidadeId: perm,
      },
      {
        label: 'Equipamentos',
        href: '/area-comum/tabelas/tratamentos/aparelhos',
        funcionalidadeId: perm,
        dropdown: [
          {
            label: 'Aparelhos',
            href: '/area-comum/tabelas/tratamentos/aparelhos',
            funcionalidadeId: perm,
          },
          {
            label: 'Tipo de Aparelhos',
            href: '/area-comum/tabelas/tratamentos/tipos-aparelho',
            funcionalidadeId: perm,
          },
          {
            label: 'Marcas',
            href: '/area-comum/tabelas/tratamentos/marcas-aparelho',
            funcionalidadeId: perm,
          },
          {
            label: 'Modelos',
            href: '/area-comum/tabelas/tratamentos/modelos-aparelho',
            funcionalidadeId: perm,
          },
        ],
      },
    ],
  },
] as const
