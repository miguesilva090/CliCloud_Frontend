import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { actionTypes, modules } from '@/config/modules'
import { LicenseGuard } from '@/components/auth/license-guard'
import { AreaAdministrativaTablePlaceholderPage } from '@/pages/area-administrativa/pages/area-administrativa-table-placeholder'
import { ListagemSalasPage } from '@/pages/area-administrativa/tabelas/salas/pages/listagem-salas-page'
import { ListagemMotivosConsultaPage } from '@/pages/area-administrativa/tabelas/motivos-consulta/pages/listagem-motivos-consulta-page'
import { ListagemTiposCartaPage } from '@/pages/area-administrativa/tabelas/tipos-carta/pages/listagem-tipos-carta-page'

const AreaAdministrativaHomePage = lazy(() =>
  import('@/pages/area-administrativa/pages/area-administrativa-home').then((m) => ({
    default: m.AreaAdministrativaHomePage,
  })),
)
const ServicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/servicos/pages/listagem-servicos-page'
  ).then((m) => ({ default: m.ListagemServicosPage })),
)
const SubsistemasServicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/pages/listagem-subsistemas-servicos-page'
  ).then((m) => ({ default: m.ListagemSubsistemasServicosPage })),
)
const TiposServicoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/tipos-servico/pages/listagem-tipos-servico-page'
  ).then((m) => ({ default: m.ListagemTiposServicoPage })),
)
const DoencasPage = lazy(() =>
  import('@/pages/area-comum/tabelas/consultas/doencas/pages/listagem-doencas-page').then((m) => ({
    default: m.ListagemDoencasPage,
  })),
)
const MargemMedicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/margem-medicos/pages/listagem-margem-medicos-page'
  ).then((m) => ({ default: m.default })),
)
const TiposConsultasPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/tipos-consultas/pages/listagem-tipos-consulta-page'
  ).then((m) => ({ default: m.ListagemTiposConsultaPage })),
)
const PrioridadesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tratamentos/prioridades/pages/listagem-prioridades-page'
  ).then((m) => ({ default: m.ListagemPrioridadesPage })),
)
const ListagemMedicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/entidades/medicos/pages/listagem-medicos-page'
  ).then((m) => ({ default: m.ListagemMedicosPage })),
)
const ListagemFornecedoresPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/entidades/fornecedores/pages/listagem-fornecedores-page'
  ).then((m) => ({ default: m.ListagemFornecedoresPage })),
)
const ListagemFuncionariosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/entidades/funcionarios/pages/listagem-funcionarios-page'
  ).then((m) => ({ default: m.ListagemFuncionariosPage })),
)
const ListagemSinistradosPage = lazy(() =>
  import(
    '@/pages/area-administrativa/consultas/sinistrados/pages/listagem-sinistrados-page'
  ).then((m) => ({ default: m.ListagemSinistradosPage })),
)
const ListagemHistoricoSinistradosPage = lazy(() =>
  import(
    '@/pages/area-administrativa/consultas/sinistrados/pages/listagem-historico-sinistrados-page'
  ).then((m) => ({ default: m.ListagemHistoricoSinistradosPage })),
)
const ListagemHistoricoConsultasAdministrativoPage = lazy(() =>
  import(
    '@/pages/area-administrativa/consultas/historico/pages/listagem-historico-consultas-administrativo-page'
  ).then((m) => ({ default: m.ListagemHistoricoConsultasAdministrativoPage })),
)
const ListagemAdmissoesDiaPage = lazy(() =>
  import('@/pages/area-administrativa/consultas/admissoes/pages/listagem-admissoes-page').then(
    (m) => ({ default: m.ListagemAdmissoesDiaPage })
  )
)
const ListagemAdmissoesPendentesPage = lazy(() =>
  import('@/pages/area-administrativa/consultas/admissoes/pages/listagem-admissoes-page').then(
    (m) => ({ default: m.ListagemAdmissoesPendentesPage })
  )
)
const NovaAdmissaoPage = lazy(() =>
  import(
    '@/pages/area-administrativa/consultas/admissoes/pages/nova-admissao-page'
  ).then((m) => ({ default: m.NovaAdmissaoPage }))
)
const FechoDiarioPage = lazy(() =>
  import('@/pages/area-administrativa/consultas/fecho-diario/pages/fecho-diario-page').then(
    (m) => ({ default: m.FechoDiarioPage })
  )
)
const NovoSinistradoPage = lazy(() =>
  import(
    '@/pages/area-administrativa/consultas/sinistrados/pages/novo-sinistrado-page'
  ).then((m) => ({ default: m.NovoSinistradoPage })),
)
const ListagemLoteDirectPage = lazy(() =>
  import(
    '@/pages/area-administrativa/credenciais/pages/listagem-lote-direct-page'
  ).then((m) => ({ default: m.ListagemLoteDirectPage })),
)
const NovoLoteDirectPage = lazy(() =>
  import(
    '@/pages/area-administrativa/credenciais/pages/novo-lote-direct-page'
  ).then((m) => ({ default: m.NovoLoteDirectPage })),
)
const ExamesSemPapelPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/exames/pages/exames-sem-papel-page'
  ).then((m) => ({ default: m.ExamesSemPapelPage })),
)

export const areaAdministrativaRoutes = [
  {
    path: 'area-administrativa',
    element: <Navigate to='/area-administrativa/consultas' replace />,
    manageWindow: false,
  },
  {
    path: 'area-administrativa/consultas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaAdministrativaHomePage />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-administrativa/tratamentos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaAdministrativaTablePlaceholderPage title='Tratamentos' />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-administrativa/modalidades',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaAdministrativaTablePlaceholderPage title='Modalidades' />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-administrativa/consultas/sinistrados',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.sinistrados.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemSinistradosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Sinistrados',
  },
  {
    path: 'area-administrativa/consultas/sinistrados/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.registoSinistrados.id}
        actionType={actionTypes.AuthAdd}
      >
        <NovoSinistradoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Novo sinistrado',
  },
  {
    path: 'area-administrativa/consultas/historico-sinistrados',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaComum.permissions.historicoSinistrados.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemHistoricoSinistradosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Histórico de Sinistrados',
  },
  {
    path: 'area-administrativa/consultas/historico/:vista',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemHistoricoConsultasAdministrativoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Histórico de consultas',
  },
  {
    path: 'area-administrativa/consultas/admissoes',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.admissoes.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemAdmissoesDiaPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Admissões',
  },
  {
    path: 'area-administrativa/consultas/admissoes/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.admissoes.id}
        actionType={actionTypes.AuthAdd}
      >
        <NovaAdmissaoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Nova admissão',
  },
  {
    path: 'area-administrativa/consultas/admissoes/pendentes',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.admissoes.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemAdmissoesPendentesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Admissões Pendentes',
  },
  {
    path: 'area-administrativa/consultas/fecho-diario',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.fechoDiario.id}
        actionType={actionTypes.AuthVer}
      >
        <FechoDiarioPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Fecho Diário',
  },
  {
    path: 'area-administrativa/credenciais',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaComum.permissions.credenciaisLancamentoConsultas.id}
        permissionFallbackIds={[
          modules.areaComum.permissions.historicoCredenciaisLancamento.id,
          modules.areaAdministrativa.permissions.consultas.id,
        ]}
        actionType={actionTypes.AuthVer}
      >
        <ListagemLoteDirectPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Lançamento de Credenciais',
  },
  {
    path: 'area-administrativa/credenciais/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaComum.permissions.credenciaisLancamentoConsultas.id}
        permissionFallbackIds={[
          modules.areaComum.permissions.historicoCredenciaisLancamento.id,
          modules.areaAdministrativa.permissions.consultas.id,
        ]}
        actionType={actionTypes.AuthAdd}
      >
        <NovoLoteDirectPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Lançamento de Credenciais',
  },
  {
    path: 'area-administrativa/credenciais/exames-sem-papel',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaClinica.permissions.examesSemPapel.id}
        permissionFallbackIds={[
          modules.areaClinica.permissions.examesSemPapelSubmenu.id,
        ]}
        actionType={actionTypes.AuthVer}
      >
        <ExamesSemPapelPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Exames Sem Papel',
  },
  {
    path: 'area-administrativa/credenciais/exames-sem-papel-historico',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaClinica.permissions.examesSemPapel.id}
        permissionFallbackIds={[
          modules.areaClinica.permissions.examesSemPapelSubmenu.id,
        ]}
        actionType={actionTypes.AuthVer}
      >
        <ExamesSemPapelPage historico />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Exames Sem Papel - Histórico',
  },
  {
    path: 'area-administrativa/tabelas/servicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.servicos.id}
        actionType={actionTypes.AuthVer}
      >
        <ServicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Serviços',
  },
  {
    path: 'area-administrativa/tabelas/subsistemas-servicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.subsistemaServicos.id}
        actionType={actionTypes.AuthVer}
      >
        <SubsistemasServicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Subsistemas de Serviços',
  },
  {
    path: 'area-administrativa/tabelas/tipos-servico',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaComum.permissions.tiposServico.id}
        actionType={actionTypes.AuthVer}
      >
        <TiposServicoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Tipos de Serviço',
  },
  {
    path: 'area-administrativa/tabelas/doencas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.doencas.id}
        actionType={actionTypes.AuthVer}
      >
        <DoencasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Doenças',
  },
  {
    path: 'area-administrativa/tabelas/margem-medicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.margemMedicos.id}
        actionType={actionTypes.AuthVer}
      >
        <MargemMedicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Margem de Médicos',
  },
  {
    path: 'area-administrativa/tabelas/tipos-consultas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.tiposConsulta.id}
        actionType={actionTypes.AuthVer}
      >
        <TiposConsultasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Tipos de Consultas',
  },
  {
    path: 'area-administrativa/tabelas/prioridades',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.prioridades.id}
        actionType={actionTypes.AuthVer}
      >
        <PrioridadesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Prioridades',
  },
  {
    path: 'area-administrativa/tabelas/salas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.salas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemSalasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Salas',
  },
  {
    path: 'area-administrativa/tabelas/tipos-carta',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.tiposCarta.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemTiposCartaPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Tipos de Carta',
  },
  {
    path: 'area-administrativa/tabelas/motivos-consulta',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.motivosConsulta.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemMotivosConsultaPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Motivos de Consulta',
  },
  {
    path: 'area-administrativa/entidades/medicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.medicos.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemMedicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Médicos',
  },
  {
    path: 'area-administrativa/entidades/fornecedores',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.fornecedores.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemFornecedoresPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Fornecedores',
  },
  {
    path: 'area-administrativa/entidades/funcionarios',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.funcionarios.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemFuncionariosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Funcionários',
  },
]