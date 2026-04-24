import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LicenseGuard } from '@/components/auth/license-guard'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { actionTypes, modules } from '@/config/modules'

const areaClinicaModule = modules.areaClinica
const processoClinico = areaClinicaModule.permissions.processoClinico
const prescricaoEletronica = areaClinicaModule.permissions.prescricaoEletronica
const prescricaoMcdts = areaClinicaModule.permissions.prescricaoMcdts
const enfermagem = areaClinicaModule.permissions.enfermagem
const processoAtendimento = areaClinicaModule.permissions.processoAtendimento
const processoAgenda = areaClinicaModule.permissions.processoAgenda
const processoExames = areaClinicaModule.permissions.processoExames
const processoAtestados = areaClinicaModule.permissions.processoAtestados
const processoHistorico = areaClinicaModule.permissions.processoHistorico
const processoTabelas = areaClinicaModule.permissions.processoTabelas

function procesoClinicoSectionGuardProps(permissionId: string) {
  return {
    requiredModule: areaClinicaModule.id,
    requiredPermission: permissionId,
    requireExplicitPermission: true,
    permissionFallbackIds: [processoClinico.id],
    actionType: actionTypes.AuthVer,
  }
}

function AreaClinicaPlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <p className='text-muted-foreground'>{title} — em breve.</p>
      </DashboardPageContainer>
    </>
  )
}

const ProcessoClinicoPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/pages').then((m) => ({
    default: m.ProcessoClinicoPage,
  }))
)

const AtendimentoUtentePage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/atendimento').then((m) => ({
    default: m.AtendimentoUtentePage,
  }))
)

const ConsultasDoDiaPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atendimento/pages/consultas-do-dia-page'
  ).then((m) => ({
    default: m.ConsultasDoDiaPage,
  }))
)

const FichaClinicaPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atendimento/pages/ficha-clinica-page'
  ).then((m) => ({
    default: m.FichaClinicaPage,
  }))
)

const ConsultasMarcadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/agenda/pages/consultas-marcadas-page'
  ).then((m) => ({
    default: m.ConsultasMarcadasPage,
  }))
)

const ListagemConsultasMarcadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/agenda/pages/listagem-consultas-marcadas-page'
  ).then((m) => ({
    default: m.ListagemConsultasMarcadasPage,
  }))
)

const MapaConsultasMarcadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/agenda/pages/mapa-consultas-marcadas-page'
  ).then((m) => ({
    default: m.MapaConsultasMarcadasPage,
  }))
)

const ExamesSemPapelPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/exames/pages/exames-sem-papel-page'
  ).then((m) => ({
    default: m.ExamesSemPapelPage,
  }))
)

const NovoAtestadoPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atestados/pages/novo-atestado-page'
  ).then((m) => ({
    default: m.NovoAtestadoPage,
  }))
)

const ListagemAtestadosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atestados/pages/listagem-atestados-page'
  ).then((m) => ({
    default: m.ListagemAtestadosPage,
  }))
)

const ConsultasEfetuadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/historico/pages/consultas-efetuadas-page'
  ).then((m) => ({
    default: m.ConsultasEfetuadasPage,
  }))
)

const ListagemConsultasEfetuadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/historico/pages/listagem-consultas-efetuadas-page'
  ).then((m) => ({
    default: m.ListagemConsultasEfetuadasPage,
  }))
)

const MapaConsultasEfetuadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/historico/pages/mapa-consultas-efetuadas-page'
  ).then((m) => ({
    default: m.MapaConsultasEfetuadasPage,
  }))
)

const MedicamentosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/medicamentos/pages/medicamentos-page'
  ).then((m) => ({
    default: m.MedicamentosPage,
  }))
)

const OutrosMedicamentosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/outros-medicamentos/pages/outros-medicamentos-page'
  ).then((m) => ({
    default: m.OutrosMedicamentosPage,
  }))
)

const MedicosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/medicos/pages/medicos-page'
  ).then((m) => ({
    default: m.MedicosPage,
  }))
)

const PatologiasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/patologias/pages/patologias-page'
  ).then((m) => ({
    default: m.PatologiasPage,
  }))
)

const HistoriaClinicaPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/historia-clinica/pages/historia-clinica-page'
  ).then((m) => ({
    default: m.HistoriaClinicaPage,
  }))
)

const MapasBodyChartPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/mapas-body-chart/pages/mapas-body-chart-page'
  ).then((m) => ({
    default: m.MapasBodyChartPage,
  }))
)

const AlergiasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/alergias/pages/alergias-page'
  ).then((m) => ({
    default: m.AlergiasPage,
  }))
)

const EstadosDentariosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/estados-dentarios/pages/estados-dentarios-page'
  ).then((m) => ({
    default: m.EstadosDentariosPage,
  }))
)

const FichaClinicaSecoesPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/ficha-clinica-secoes/pages/ficha-clinica-secoes-page'
  ).then((m) => ({
    default: m.FichaClinicaSecoesPage,
  }))
)

const ListagemFeriadosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/feriados/pages/listagem-feriados-page'
  ).then((m) => ({
    default: m.ListagemFeriadosPage,
  }))
)

const EvolucaoTratamentoPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atendimento/pages/evolucao-tratamento-page'
  ).then((m) => ({
    default: m.EvolucaoTratamentoPage,
  }))
)

const suspense = (node: ReactNode) => (
  <Suspense fallback={null}>{node}</Suspense>
)

export const areaClinicaRoutes = [
  {
    path: 'area-clinica',
    element: <Navigate to='/area-clinica/processo-clinico' replace />,
    manageWindow: false,
  },
  {
    path: 'area-clinica/processo-clinico',
    element: (
      <LicenseGuard requiredModule={areaClinicaModule.id}>
        {suspense(<ProcessoClinicoPage />)}
      </LicenseGuard>
    ),
    manageWindow: false,
    windowName: 'Processo Clínico',
  },
  // Rotas “pai” só usadas no menu (href do grupo); sem isto o React Router cai no * → /404
  {
    path: 'area-clinica/processo-clinico/agenda',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAgenda.id)}>
        <Navigate
          to='/area-clinica/processo-clinico/agenda/consultas-marcadas'
          replace
        />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-clinica/processo-clinico/exames',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoExames.id)}>
        <Navigate
          to='/area-clinica/processo-clinico/exames/exames-sem-papel'
          replace
        />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-clinica/processo-clinico/atestados',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAtestados.id)}>
        <Navigate
          to='/area-clinica/processo-clinico/atestados/listagem-atestados'
          replace
        />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-clinica/processo-clinico/historico',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoHistorico.id)}>
        <Navigate
          to='/area-clinica/processo-clinico/historico/consultas-efetuadas'
          replace
        />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-clinica/processo-clinico/tabelas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        <Navigate
          to='/area-clinica/processo-clinico/tabelas/medicamentos'
          replace
        />
      </LicenseGuard>
    ),
    manageWindow: false,
  },
  {
    path: 'area-clinica/prescricao-eletronica',
    element: (
      <LicenseGuard
        requiredModule={areaClinicaModule.id}
        requiredPermission={prescricaoEletronica.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaClinicaPlaceholderPage title='Prescrição eletrónica' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Prescrição Eletrónica',
  },
  {
    path: 'area-clinica/prescricao-mcdts',
    element: (
      <LicenseGuard
        requiredModule={areaClinicaModule.id}
        requiredPermission={prescricaoMcdts.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaClinicaPlaceholderPage title='Prescrição MCDTs' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Prescrição MCDTs',
  },
  {
    path: 'area-clinica/enfermagem',
    element: (
      <LicenseGuard
        requiredModule={areaClinicaModule.id}
        requiredPermission={enfermagem.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaClinicaPlaceholderPage title='Enfermagem' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Enfermagem',
  },
  {
    path: 'area-clinica/processo-clinico/atendimento',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAtendimento.id)}>
        {suspense(<AtendimentoUtentePage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Atendimento ao Utente',
  },
  {
    path: 'area-clinica/processo-clinico/atendimento/consultas-do-dia',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAtendimento.id)}>
        {suspense(<ConsultasDoDiaPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Consultas do Dia',
  },
  {
    path: 'area-clinica/processo-clinico/atendimento/ficha-clinica',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAtendimento.id)}>
        {suspense(<FichaClinicaPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Ficha Clínica',
  },
  {
    path: 'area-clinica/processo-clinico/atendimento/evolucao-tratamento',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAtendimento.id)}>
        {suspense(<EvolucaoTratamentoPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Evolução Tratamento',
  },
  {
    path: 'area-clinica/processo-clinico/agenda/consultas-marcadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAgenda.id)}>
        {suspense(<ConsultasMarcadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Consultas Marcadas',
  },
  {
    path: 'area-clinica/processo-clinico/agenda/listagem-consultas-marcadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAgenda.id)}>
        {suspense(<ListagemConsultasMarcadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Listagem Consultas Marcadas',
  },
  {
    path: 'area-clinica/processo-clinico/agenda/mapa-consultas-marcadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAgenda.id)}>
        {suspense(<MapaConsultasMarcadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Mapa Consultas Marcadas',
  },
  {
    path: 'area-clinica/processo-clinico/exames/exames-sem-papel',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoExames.id)}>
        {suspense(<ExamesSemPapelPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Exames Sem Papel',
  },
  {
    path: 'area-clinica/processo-clinico/atestados/novo-atestado',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAtestados.id)}>
        {suspense(<NovoAtestadoPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Novo Atestado',
  },
  {
    path: 'area-clinica/processo-clinico/atestados/listagem-atestados',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoAtestados.id)}>
        {suspense(<ListagemAtestadosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Listagem Atestados',
  },
  {
    path: 'area-clinica/processo-clinico/historico/consultas-efetuadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoHistorico.id)}>
        {suspense(<ConsultasEfetuadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Consultas Efetuadas',
  },
  {
    path: 'area-clinica/processo-clinico/historico/listagem-consultas-efetuadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoHistorico.id)}>
        {suspense(<ListagemConsultasEfetuadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Listagem Consultas Efetuadas',
  },
  {
    path: 'area-clinica/processo-clinico/historico/mapa-consultas-efetuadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoHistorico.id)}>
        {suspense(<MapaConsultasEfetuadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Mapa Consultas Efetuadas',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/medicamentos',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<MedicamentosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Medicamentos',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/outros-medicamentos',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<OutrosMedicamentosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Outros Medicamentos',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/medicos',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<MedicosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Médicos',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/patologias',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<PatologiasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Patologias',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/historia-clinica',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<HistoriaClinicaPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'História Clínica',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/mapas-body-chart',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<MapasBodyChartPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Mapas Body Chart',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/alergias',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<AlergiasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Alergias',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/estados-dentarios',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<EstadosDentariosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Estados Dentários',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/feriados',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<ListagemFeriadosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Feriados',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/ficha-clinica-secoes',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(processoTabelas.id)}>
        {suspense(<FichaClinicaSecoesPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Ficha Clínica Secções',
  },
]
