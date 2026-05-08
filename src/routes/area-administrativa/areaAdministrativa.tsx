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
const NovoSinistradoPage = lazy(() =>
  import(
    '@/pages/area-administrativa/consultas/sinistrados/pages/novo-sinistrado-page'
  ).then((m) => ({ default: m.NovoSinistradoPage })),
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tabelas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tabelas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tabelas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.sinistrados.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.sinistrados.id}
        actionType={actionTypes.AuthVer}
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
        requiredModule={modules.areaComum.id}
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
    path: 'area-administrativa/tabelas/servicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tabelaServicos.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.subsistemasServicos.id}
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
        requiredModule={modules.areaComum.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.doencas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.margemMedicos.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tiposConsultas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.prioridades.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tabelas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tabelas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.tabelas.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.medicos.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.fornecedores.id}
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
        requiredModule={modules.areaComum.id}
        requiredPermission={modules.areaComum.permissions.funcionarios.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemFuncionariosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Funcionários',
  },
]