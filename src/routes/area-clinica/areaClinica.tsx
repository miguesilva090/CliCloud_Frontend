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
const atendimentoAoUtente = areaClinicaModule.permissions.atendimentoAoUtente
const consultasDoDia = areaClinicaModule.permissions.consultasDoDia
const fichaClinica = areaClinicaModule.permissions.fichaClinica
const agenda = areaClinicaModule.permissions.agenda
const consultasMarcadas = areaClinicaModule.permissions.consultasMarcadas
const listagemConsultasMarcadas = areaClinicaModule.permissions.listagemConsultasMarcadas
const mapaConsultasMarcadas = areaClinicaModule.permissions.mapaConsultasMarcadas
const examesSemPapel = areaClinicaModule.permissions.examesSemPapel
const examesSemPapelSubmenu = areaClinicaModule.permissions.examesSemPapelSubmenu
const atestadosCartaConducao = areaClinicaModule.permissions.atestadosCartaConducao
const listagemAtestadosCartaConducao = areaClinicaModule.permissions.listagemAtestadosCartaConducao
const novoAtestado = areaClinicaModule.permissions.novoAtestado
const historico = areaClinicaModule.permissions.historico
const consultasEfetuadas = areaClinicaModule.permissions.consultasEfetuadas
const listagemConsultasEfetuadas = areaClinicaModule.permissions.listagemConsultasEfetuadas
const mapaConsultasEfetuadas = areaClinicaModule.permissions.mapaConsultasEfetuadas
const tabelas = areaClinicaModule.permissions.tabelas
const medicamentos = areaClinicaModule.permissions.medicamentos
const outrosMedicamentos = areaClinicaModule.permissions.outrosMedicamentos
const alergias = areaClinicaModule.permissions.alergias
const medicos = areaClinicaModule.permissions.medicos
const patologias = areaClinicaModule.permissions.patologias
const historiaClinica = areaClinicaModule.permissions.historiaClinica
const mapasBodyChart = areaClinicaModule.permissions.mapasBodyChart
const estadosDentarios = areaClinicaModule.permissions.estadosDentarios
const feriados = areaClinicaModule.permissions.feriados

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
    requiredPermission: processoClinico.id,
  }))
)

const AtendimentoUtentePage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/atendimento').then((m) => ({
    default: m.AtendimentoUtentePage,
    requiredPermission: atendimentoAoUtente.id,
  }))
)

const ConsultasDoDiaPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atendimento/pages/consultas-do-dia-page'
  ).then((m) => ({
    default: m.ConsultasDoDiaPage,
    requiredPermission: consultasDoDia.id,
  }))
)

const FichaClinicaPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atendimento/pages/ficha-clinica-page'
  ).then((m) => ({
    default: m.FichaClinicaPage,
    requiredPermission: fichaClinica.id,
  }))
)

const ConsultasMarcadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/agenda/pages/consultas-marcadas-page'
  ).then((m) => ({
    default: m.ConsultasMarcadasPage,
    requiredPermission: consultasMarcadas.id,
  }))
)

const ListagemConsultasMarcadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/agenda/pages/listagem-consultas-marcadas-page'
  ).then((m) => ({
    default: m.ListagemConsultasMarcadasPage,
    requiredPermission: listagemConsultasMarcadas.id,
  }))
)

const MapaConsultasMarcadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/agenda/pages/mapa-consultas-marcadas-page'
  ).then((m) => ({
    default: m.MapaConsultasMarcadasPage,
    requiredPermission: mapaConsultasMarcadas.id,
  }))
)

const ExamesSemPapelPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/exames/pages/exames-sem-papel-page'
  ).then((m) => ({
    default: m.ExamesSemPapelPage,
    requiredPermission: examesSemPapel.id,
  }))
)

const NovoAtestadoPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atestados/pages/novo-atestado-page'
  ).then((m) => ({
    default: m.NovoAtestadoPage,
    requiredPermission: novoAtestado.id,
  }))
)

const ListagemAtestadosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atestados/pages/listagem-atestados-page'
  ).then((m) => ({
    default: m.ListagemAtestadosPage,
    requiredPermission: listagemAtestadosCartaConducao.id,
  }))
)

const ConsultasEfetuadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/historico/pages/consultas-efetuadas-page'
  ).then((m) => ({
    default: m.ConsultasEfetuadasPage,
    requiredPermission: consultasEfetuadas.id,
  }))
)

const ListagemConsultasEfetuadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/historico/pages/listagem-consultas-efetuadas-page'
  ).then((m) => ({
    default: m.ListagemConsultasEfetuadasPage,
    requiredPermission: listagemConsultasEfetuadas.id,
  }))
)

const MapaConsultasEfetuadasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/historico/pages/mapa-consultas-efetuadas-page'
  ).then((m) => ({
    default: m.MapaConsultasEfetuadasPage,
    requiredPermission: mapaConsultasEfetuadas.id,
  }))
)

const MedicamentosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/medicamentos/pages/medicamentos-page'
  ).then((m) => ({
    default: m.MedicamentosPage,
    requiredPermission: medicamentos.id,
  }))
)

const OutrosMedicamentosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/outros-medicamentos/pages/outros-medicamentos-page'
  ).then((m) => ({
    default: m.OutrosMedicamentosPage,
    requiredPermission: outrosMedicamentos.id,
  }))
)

const MedicosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/medicos/pages/medicos-page'
  ).then((m) => ({
    default: m.MedicosPage,
    requiredPermission: medicos.id,
  }))
)

const PatologiasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/patologias/pages/patologias-page'
  ).then((m) => ({
    default: m.PatologiasPage,
    requiredPermission: patologias.id,
  }))
)

const HistoriaClinicaPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/historia-clinica/pages/historia-clinica-page'
  ).then((m) => ({
    default: m.HistoriaClinicaPage,
    requiredPermission: historiaClinica.id,
  }))
)

const MapasBodyChartPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/mapas-body-chart/pages/mapas-body-chart-page'
  ).then((m) => ({
    default: m.MapasBodyChartPage,
    requiredPermission: mapasBodyChart.id,
  }))
)

const AlergiasPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/alergias/pages/alergias-page'
  ).then((m) => ({
    default: m.AlergiasPage,
    requiredPermission: alergias.id,
  }))
)

const EstadosDentariosPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/estados-dentarios/pages/estados-dentarios-page'
  ).then((m) => ({
    default: m.EstadosDentariosPage,
    requiredPermission: estadosDentarios.id,
  }))
)

const FichaClinicaSecoesPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/tabelas/ficha-clinica-secoes/pages/ficha-clinica-secoes-page'
  ).then((m) => ({
    default: m.FichaClinicaSecoesPage,
    requiredPermission: fichaClinica.id,
  }))
)

const ListagemFeriadosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/feriados/pages/listagem-feriados-page'
  ).then((m) => ({
    default: m.ListagemFeriadosPage,
    requiredPermission: feriados.id,
  }))
)

const EvolucaoTratamentoPage = lazy(() =>
  import(
    '@/pages/area-clinica/processo-clinico/atendimento/pages/evolucao-tratamento-page'
  ).then((m) => ({
    default: m.EvolucaoTratamentoPage,
    requiredPermission: fichaClinica.id,
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
      <LicenseGuard {...procesoClinicoSectionGuardProps(agenda.id)}>
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
      <LicenseGuard {...procesoClinicoSectionGuardProps(examesSemPapel.id)}>
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
      <LicenseGuard {...procesoClinicoSectionGuardProps(atestadosCartaConducao.id)}>
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
      <LicenseGuard {...procesoClinicoSectionGuardProps(historico.id)}>
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
      <LicenseGuard {...procesoClinicoSectionGuardProps(tabelas.id)}>
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
      <LicenseGuard {...procesoClinicoSectionGuardProps(atendimentoAoUtente.id)}>
        {suspense(<AtendimentoUtentePage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Atendimento ao Utente',
  },
  {
    path: 'area-clinica/processo-clinico/atendimento/consultas-do-dia',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(consultasDoDia.id)}>
        {suspense(<ConsultasDoDiaPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Consultas do Dia',
  },
  {
    path: 'area-clinica/processo-clinico/atendimento/ficha-clinica',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(fichaClinica.id)}>
        {suspense(<FichaClinicaPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Ficha Clínica',
  },
  {
    path: 'area-clinica/processo-clinico/atendimento/evolucao-tratamento',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(fichaClinica.id)}>
        {suspense(<EvolucaoTratamentoPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Evolução Tratamento',
  },
  {
    path: 'area-clinica/processo-clinico/agenda/consultas-marcadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(consultasMarcadas.id)}>
        {suspense(<ConsultasMarcadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Consultas Marcadas',
  },
  {
    path: 'area-clinica/processo-clinico/agenda/listagem-consultas-marcadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(listagemConsultasMarcadas.id)}>
        {suspense(<ListagemConsultasMarcadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Listagem de Consultas Marcadas',
  },
  {
    path: 'area-clinica/processo-clinico/agenda/mapa-consultas-marcadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(mapaConsultasMarcadas.id)}>
        {suspense(<MapaConsultasMarcadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Mapa Consultas Marcadas',
  },
  {
    path: 'area-clinica/processo-clinico/exames/exames-sem-papel',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(examesSemPapelSubmenu.id)}>
        {suspense(<ExamesSemPapelPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Exames Sem Papel',
  },
  {
    path: 'area-clinica/processo-clinico/atestados/novo-atestado',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(novoAtestado.id)}>
        {suspense(<NovoAtestadoPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Novo Atestado',
  },
  {
    path: 'area-clinica/processo-clinico/atestados/listagem-atestados',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(listagemAtestadosCartaConducao.id)}>
        {suspense(<ListagemAtestadosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Listagem Atestados',
  },
  {
    path: 'area-clinica/processo-clinico/historico/consultas-efetuadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(consultasEfetuadas.id)}>
        {suspense(<ConsultasEfetuadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Consultas Efetuadas',
  },
  {
    path: 'area-clinica/processo-clinico/historico/listagem-consultas-efetuadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(listagemConsultasEfetuadas.id)}>
        {suspense(<ListagemConsultasEfetuadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Listagem Consultas Efetuadas',
  },
  {
    path: 'area-clinica/processo-clinico/historico/mapa-consultas-efetuadas',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(mapaConsultasEfetuadas.id)}>
        {suspense(<MapaConsultasEfetuadasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Mapa Consultas Efetuadas',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/medicamentos',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(medicamentos.id)}>
        {suspense(<MedicamentosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Medicamentos',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/outros-medicamentos',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(outrosMedicamentos.id)}>
        {suspense(<OutrosMedicamentosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Outros Medicamentos',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/medicos',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(medicos.id)}>
        {suspense(<MedicosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Médicos',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/patologias',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(patologias.id)}>
        {suspense(<PatologiasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Patologias',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/historia-clinica',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(historiaClinica.id)}>
        {suspense(<HistoriaClinicaPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'História Clínica',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/mapas-body-chart',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(mapasBodyChart.id)}>
        {suspense(<MapasBodyChartPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Mapas Body Chart',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/alergias',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(alergias.id)}>
        {suspense(<AlergiasPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Alergias',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/estados-dentarios',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(estadosDentarios.id)}>
        {suspense(<EstadosDentariosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Estados Dentários',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/feriados',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(feriados.id)}>
        {suspense(<ListagemFeriadosPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Feriados',
  },
  {
    path: 'area-clinica/processo-clinico/tabelas/ficha-clinica-secoes',
    element: (
      <LicenseGuard {...procesoClinicoSectionGuardProps(fichaClinica.id)}>
        {suspense(<FichaClinicaSecoesPage />)}
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Ficha Clínica Secções',
  },
]
