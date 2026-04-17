import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { DashboardPage } from '@/pages/dashboard'
import { NotFound } from '@/pages/not-found'
import { Navigate, Outlet, useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { useNavigationStore } from '@/utils/navigation'
import { useNavigationTracking } from '@/hooks/use-navigation-tracking'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RoleRouter } from '@/components/auth/role-router'
import { utilitariosRoutes } from './base/utilitarios-routes'
import { reportsRoutes } from './reports/reports-routes'

const ReportDesignerPage = lazy(() =>
  import('@/pages/reports/report-designer/report-designer-page').then((m) => ({
    default: m.ReportDesignerPage,
  }))
)

const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
)

const SignInPage = lazy(() => import('@/pages/auth/signin'))

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
  import('@/pages/area-clinica/processo-clinico/atendimento/pages/consultas-do-dia-page').then((m) => ({
    default: m.ConsultasDoDiaPage,
  }))
)

const FichaClinicaPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/atendimento/pages/ficha-clinica-page').then((m) => ({
    default: m.FichaClinicaPage,
  }))
)

const ConsultasMarcadasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/agenda/pages/consultas-marcadas-page').then((m) => ({
    default: m.ConsultasMarcadasPage,
  }))
)

const ListagemConsultasMarcadasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/agenda/pages/listagem-consultas-marcadas-page').then((m) => ({
    default: m.ListagemConsultasMarcadasPage,
  }))
)

const MapaConsultasMarcadasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/agenda/pages/mapa-consultas-marcadas-page').then((m) => ({
    default: m.MapaConsultasMarcadasPage,
  }))
)

const ExamesSemPapelPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/exames/pages/exames-sem-papel-page').then((m) => ({
    default: m.ExamesSemPapelPage,
  }))
)

const NovoAtestadoPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/atestados/pages/novo-atestado-page').then((m) => ({
    default: m.NovoAtestadoPage,
  }))
)

const ListagemAtestadosPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/atestados/pages/listagem-atestados-page').then((m) => ({
    default: m.ListagemAtestadosPage,
  }))
)

const ConsultasEfetuadasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/historico/pages/consultas-efetuadas-page').then((m) => ({
    default: m.ConsultasEfetuadasPage,
  }))
)

const ListagemConsultasEfetuadasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/historico/pages/listagem-consultas-efetuadas-page').then((m) => ({
    default: m.ListagemConsultasEfetuadasPage,
  }))
)

const MapaConsultasEfetuadasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/historico/pages/mapa-consultas-efetuadas-page').then((m) => ({
    default: m.MapaConsultasEfetuadasPage,
  }))
)

const MedicamentosPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/medicamentos/pages/medicamentos-page').then((m) => ({
    default: m.MedicamentosPage,
  }))
)

const OutrosMedicamentosPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/outros-medicamentos/pages/outros-medicamentos-page').then((m) => ({
    default: m.OutrosMedicamentosPage,
  }))
)

const MedicosPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/medicos/pages/medicos-page').then((m) => ({
    default: m.MedicosPage,
  }))
)

const PatologiasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/patologias/pages/patologias-page').then((m) => ({
    default: m.PatologiasPage,
  }))
)

const HistoriaClinicaPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/historia-clinica/pages/historia-clinica-page').then((m) => ({
    default: m.HistoriaClinicaPage,
  }))
)

const MapasBodyChartPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/mapas-body-chart/pages/mapas-body-chart-page').then(
    (m) => ({
    default: m.MapasBodyChartPage,
  }))
)

const AlergiasPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/alergias/pages/alergias-page').then((m) => ({
    default: m.AlergiasPage,
  }))
)

const EstadosDentariosPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/estados-dentarios/pages/estados-dentarios-page').then((m) => ({
    default: m.EstadosDentariosPage,
  }))
)

const FichaClinicaSecoesPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/tabelas/ficha-clinica-secoes/pages/ficha-clinica-secoes-page').then((m) => ({
    default: m.FichaClinicaSecoesPage,
  }))
)

const AreaComumPage = lazy(() =>
  import('@/pages/area-comum').then((m) => ({
    default: m.AreaComumPage,
  }))
)

const TabelasPage = lazy(() =>
  import('@/pages/area-comum/tabelas').then((m) => ({
    default: m.TabelasPage,
  }))
)

const TabelasSectionPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tabelas-section-page').then((m) => ({
    default: m.TabelasSectionPage,
  }))
)

const TabelasEntidadesSubPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tabelas-entidades-sub-page').then((m) => ({
    default: m.TabelasEntidadesSubPage,
  }))
)

const ListagemUtentesPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/utentes/pages/listagem-utentes-page').then((m) => ({
    default: m.ListagemUtentesPage,
  }))
)

const ListagemMedicosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/medicos/pages/listagem-medicos-page').then((m) => ({
    default: m.ListagemMedicosPage,
  }))
)

const ListagemMedicosExternosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/medicos-externos/pages/listagem-medicos-externos-page').then((m) => ({
    default: m.ListagemMedicosExternosPage,
  }))
)

const ListagemOrganismosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/organismos/pages/listagem-organismos-page').then((m) => ({
    default: m.ListagemOrganismosPage,
  }))
)

const OrganismoEditPage = lazy(() =>
  import('@/pages/organismos/pages/organismo-edit-page').then((m) => ({
    default: m.OrganismoEditPage,
  }))
)

const ListagemCentrosSaudePage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/centros-saude/pages/listagem-centros-saude-page').then((m) => ({
    default: m.ListagemCentrosSaudePage,
  }))
)

const ListagemFuncionariosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/funcionarios/pages/listagem-funcionarios-page').then((m) => ({
    default: m.ListagemFuncionariosPage,
  }))
)

const ListagemFornecedoresPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/fornecedores/pages/listagem-fornecedores-page').then((m) => ({
    default: m.ListagemFornecedoresPage,
  }))
)

const ListagemEmpresasPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/empresas/pages/listagem-empresas-page').then(
    (m) => ({
      default: m.ListagemEmpresasPage,
    })
  )
)

const EmpresaEditPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/entidades/empresas/pages/empresa-edit-page'
  ).then((m) => ({
    default: m.EmpresaEditPage,
  }))
)

const ListagemTecnicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/entidades/tecnicos/pages/listagem-tecnicos-page'
  ).then((m) => ({
    default: m.ListagemTecnicosPage,
  }))
)

const TecnicoEditPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/entidades/tecnicos/pages/tecnico-edit-page'
  ).then((m) => ({
    default: m.TecnicoEditPage,
  }))
)

const ListagemClinicasPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/clinicas/pages/listagem-clinicas-page'
  ).then((m) => ({
    default: m.ListagemClinicasPage,
  }))
)

const ClinicaEditPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/clinicas/pages/clinica-edit-page'
  ).then((m) => ({
    default: m.ClinicaEditPage,
  }))
)

const SmsConfigPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/sms/pages/sms-config-page'
  ).then((m) => ({
    default: m.SmsConfigPage,
  }))
)

const SmsHistoryPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/sms/pages/sms-history-page'
  ).then((m) => ({
    default: m.SmsHistoryPage,
  }))
)

const VozConfigPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/voz/pages/voz-config-page'
  ).then((m) => ({
    default: m.VozConfigPage,
  }))
)

const TeleconsultaConfigPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/teleconsulta/pages/teleconsulta-config-page'
  ).then((m) => ({
    default: m.TeleconsultaConfigPage,
  }))
)

const ConfigCartaConducaoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/carta-conducao/pages/config-carta-conducao-page'
  ).then((m) => ({
    default: m.ConfigCartaConducaoPage,
  }))
)

const EmailConfigPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/email/pages/email-config-page'
  ).then((m) => ({
    default: m.EmailConfigPage,
  }))
)

const EmailHistoryPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/email/pages/email-history-page'
  ).then((m) => ({
    default: m.EmailHistoryPage,
  }))
)

const WebserviceConfigPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/webservices/pages/webservice-config-page'
  ).then((m) => ({
    default: m.WebserviceConfigPage,
  }))
)

const ReferenciasMbConfigPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/referencias-mb/pages/referencias-mb-config-page'
  ).then((m) => ({
    default: m.ReferenciasMbConfigPage,
  }))
)

const ReferenciasMbHistoryPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/referencias-mb/pages/referencias-mb-history-page'
  ).then((m) => ({
    default: m.ReferenciasMbHistoryPage,
  }))
)

const FornecedorEditPage = lazy(() =>
  import('@/pages/fornecedores/pages/fornecedor-edit-page').then((m) => ({
    default: m.FornecedorEditPage,
  }))
)

const CentroSaudeEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/centros-saude/pages/centro-saude-edit-page').then((m) => ({
    default: m.CentroSaudeEditPage,
  }))
)

const FuncionarioEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/funcionarios/pages/funcionario-edit-page').then((m) => ({
    default: m.FuncionarioEditPage,
  }))
)

const MedicoExternoEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/medicos-externos/pages/medico-externo-edit-page').then((m) => ({
    default: m.MedicoExternoEditPage,
  }))
)

const MedicoEditPage = lazy(() =>
  import('@/pages/medicos/pages/medico-edit-page').then((m) => ({
    default: m.MedicoEditPage,
  }))
)

const MedicoDetailsPage = lazy(() =>
  import('@/pages/medicos/pages/medico-details-page').then((m) => ({
    default: m.MedicoDetailsPage,
  }))
)

const ListagemPaisesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/pages/listagem-paises-page'
  ).then((m) => ({ default: m.ListagemPaisesPage }))
)
const PaisesCreatePage = lazy(() =>
  import(
    '@/pages/base/paises/pages/paises-create-page'
  ).then((m) => ({ default: m.PaisesCreatePage }))
)
const PaisesUpdatePage = lazy(() =>
  import(
    '@/pages/base/paises/pages/paises-update-page'
  ).then((m) => ({ default: m.PaisesUpdatePage }))
)

const ListagemDistritosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/pages/listagem-distritos-page'
  ).then((m) => ({ default: m.ListagemDistritosPage }))
)

const ListagemConcelhosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/pages/listagem-concelhos-page'
  ).then((m) => ({ default: m.ListagemConcelhosPage }))
)

const ListagemFreguesiasPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/pages/listagem-freguesias-page'
  ).then((m) => ({ default: m.ListagemFreguesiasPage }))
)
const ListagemTiposEntidadePage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/tipos-entidade/pages/listagem-tipos-entidade-page'
  ).then((m) => ({ default: m.ListagemTiposEntidadePage }))
)
const ListagemEntidadesFinanceirasResponsaveisPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/entidades-financeiras-responsaveis/pages/listagem-entidades-financeiras-responsaveis-page'
  ).then((m) => ({ default: m.ListagemEntidadesFinanceirasResponsaveisPage }))
)
const ListagemCodigosPostaisPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/pages/listagem-codigospostais-page'
  ).then((m) => ({ default: m.ListagemCodigosPostaisPage }))
)
const ListagemBancosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/bancos/pages/listagem-bancos-page'
  ).then((m) => ({ default: m.ListagemBancosPage }))
)
const ListagemCategoriasEspecialidadesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/categorias-das-especialidades/pages/listagem-categorias-especialidades-page'
  ).then((m) => ({ default: m.ListagemCategoriasEspecialidadesPage }))
)
const ListagemEspecialidadesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/especialidades/pages/listagem-especialidades-page'
  ).then((m) => ({ default: m.ListagemEspecialidadesPage }))
)
const ListagemEstadosCivisPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/estados-civis/pages/listagem-estados-civis-page'
  ).then((m) => ({ default: m.ListagemEstadosCivisPage }))
)
const ListagemGruposSanguineosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/grupos-sanguineos/pages/listagem-grupos-sanguineos-page'
  ).then((m) => ({ default: m.ListagemGruposSanguineosPage }))
)
const ListagemHabilitacoesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/habilitacoes/pages/listagem-habilitacoes-page'
  ).then((m) => ({ default: m.ListagemHabilitacoesPage }))
)
const ListagemMoedasPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/moedas/pages/listagem-moedas-page'
  ).then((m) => ({ default: m.ListagemMoedasPage }))
)
const ListagemProfissoesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/profissoes/pages/listagem-profissoes-page'
  ).then((m) => ({ default: m.ListagemProfissoesPage }))
)
const ListagemSexosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/sexos/pages/listagem-sexos-page'
  ).then((m) => ({ default: m.ListagemSexosPage }))
)
const ListagemGrausParentescoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/graus-parentesco/pages/listagem-graus-parentesco-page'
  ).then((m) => ({ default: m.ListagemGrausParentescoPage }))
)
const ListagemTaxasIvaPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/taxas-iva/pages/listagem-taxas-iva-page'
  ).then((m) => ({ default: m.ListagemTaxasIvaPage }))
)
const ListagemProvenienciasUtentesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/proveniencias-utentes/pages/listagem-proveniencias-utentes-page'
  ).then((m) => ({ default: m.ListagemProvenienciasUtentesPage }))
)
const StocksSectionPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/stocks/pages/stocks-section-page'
  ).then((m) => ({ default: m.StocksSectionPage }))
)
const ListagemViasAdministracaoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/stocks/vias-administracao/pages/listagem-vias-administracao-page'
  ).then((m) => ({ default: m.ListagemViasAdministracaoPage }))
)
const ListagemGrupoViasAdministracaoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/stocks/grupo-vias-administracao/pages/listagem-grupo-vias-administracao-page'
  ).then((m) => ({ default: m.ListagemGrupoViasAdministracaoPage }))
)
const ListagemServicosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/consultas/servicos/servicos/pages/listagem-servicos-page').then(
    (m) => ({
      default: m.ListagemServicosPage,
    })
  )
)
const ListagemSubsistemasServicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/pages/listagem-subsistemas-servicos-page'
  ).then((m) => ({
    default: m.ListagemSubsistemasServicosPage,
  }))
)
const ListagemTiposServicoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/tipos-servico/pages/listagem-tipos-servico-page'
  ).then((m) => ({
    default: m.ListagemTiposServicoPage,
  }))
)
const ListagemMargemMedicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/margem-medicos/pages/listagem-margem-medicos-page'
  )
)
const ListagemAlergiasPage = lazy(() =>
  import('@/pages/area-comum/tabelas/consultas/alergias/pages/listagem-alergias-page').then((m) => ({
    default: m.ListagemAlergiasPage,
  }))
)
const ListagemGrausAlergiaPage = lazy(() =>
  import('@/pages/area-comum/tabelas/consultas/graus-alergia/pages/listagem-graus-alergia-page').then(
    (m) => ({
      default: m.ListagemGrausAlergiaPage,
    })
  )
)
const ListagemDoencasPage = lazy(() =>
  import('@/pages/area-comum/tabelas/consultas/doencas/pages/listagem-doencas-page').then(
    (m) => ({
      default: m.ListagemDoencasPage,
    })
  )
)
const ListagemTiposConsultaPage = lazy(() =>
  import('@/pages/area-comum/tabelas/consultas/tipos-consultas/pages/listagem-tipos-consulta-page').then(
    (m) => ({
      default: m.ListagemTiposConsultaPage,
    })
  )
)
const ListagemLocaisTratamentoPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/locais-tratamento/pages/listagem-locais-tratamento-page').then(
    (m) => ({
      default: m.ListagemLocaisTratamentoPage,
    })
  )
)
const ListagemEstadosListaEsperaPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/estados-lista-espera/pages/listagem-estados-lista-espera-page').then(
    (m) => ({
      default: m.ListagemEstadosListaEsperaPage,
    })
  )
)
const ListagemFraquezasMuscularesPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/fraquezas-musculares/pages/listagem-fraquezas-musculares-page').then(
    (m) => ({
      default: m.ListagemFraquezasMuscularesPage,
    })
  )
)
const ListagemMotivosAltaPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/motivos-alta/pages/listagem-motivos-alta-page').then(
    (m) => ({
      default: m.ListagemMotivosAltaPage,
    })
  )
)
const ListagemMotivosDesmarcacaoPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/motivos-desmarcacao/pages/listagem-motivos-desmarcacao-page').then(
    (m) => ({
      default: m.ListagemMotivosDesmarcacaoPage,
    })
  )
)

const ListagemMarcasAparelhoPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/marcas-aparelho/pages/listagem-marcas-aparelho-page').then(
    (m) => ({ default: m.ListagemMarcasAparelhoPage })
  )
)
const ListagemModelosAparelhoPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/modelos-aparelho/pages/listagem-modelos-aparelho-page').then(
    (m) => ({ default: m.ListagemModelosAparelhoPage })
  )
)
const ListagemTiposAparelhoPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/tipos-aparelho/pages/listagem-tipos-aparelho-page').then(
    (m) => ({ default: m.ListagemTiposAparelhoPage })
  )
)
const ListagemAparelhosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/aparelhos/pages/listagem-aparelhos-page').then(
    (m) => ({ default: m.ListagemAparelhosPage })
  )
)
const AparelhoFormPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/aparelhos/pages/aparelho-form-page').then(
    (m) => ({ default: m.AparelhoFormPage })
  )
)

const EvolucaoTratamentoPage = lazy(() =>
  import('@/pages/area-clinica/processo-clinico/atendimento/pages/evolucao-tratamento-page').then(
    (m) => ({ default: m.EvolucaoTratamentoPage })
  )
)

const ListagemRegioesCorpoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tratamentos/regioes-corpo/pages/listagem-regioes-corpo-page'
  ).then((m) => ({ default: m.ListagemRegioesCorpoPage }))
)

const ListagemGoniometriasPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tratamentos/goniometrias/pages/listagem-goniometrias-page'
  ).then((m) => ({ default: m.ListagemGoniometriasPage }))
)

const ListagemTiposDeDorPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tratamentos/tipos-de-dor/pages/listagem-tipos-de-dor-page'
  ).then((m) => ({ default: m.ListagemTiposDeDorPage }))
)

const ListagemPrioridadesPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/prioridades/pages/listagem-prioridades-page').then(
    (m) => ({ default: m.ListagemPrioridadesPage })
  )
)
const ListagemAnalisesPage = lazy(() =>
  import('@/pages/area-comum/tabelas/exames/analises/pages/listagem-analises-page').then(
    (m) => ({ default: m.ListagemAnalisesPage })
  )
)
const ListagemCategoriaProcedimentoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/exames/categoria-procedimento/pages/listagem-categoria-procedimento-page'
  ).then((m) => ({ default: m.ListagemCategoriaProcedimentoPage }))
)
const ListagemTiposExamePage = lazy(() =>
  import('@/pages/area-comum/tabelas/exames/tipos-exame/pages/listagem-tipos-exame-page').then(
    (m) => ({ default: m.ListagemTiposExamePage })
  )
)
const ListagemAcordosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/exames/acordos/pages/listagem-acordos-page').then(
    (m) => ({ default: m.ListagemAcordosPage })
  )
)
const ListagemPatologiasPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/patologias/pages/listagem-patologias-page').then(
    (m) => ({ default: m.ListagemPatologiasPage })
  )
)
const PatologiaEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tratamentos/patologias/pages/patologia-edit-page').then(
    (m) => ({ default: m.PatologiaEditPage })
  )
)
const GrupoViasAdministracaoEditPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/stocks/grupo-vias-administracao/pages/grupo-vias-administracao-edit-page'
  ).then((m) => ({ default: m.GrupoViasAdministracaoEditPage }))
)
const GrupoViasAdministracaoDetailsPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/stocks/grupo-vias-administracao/pages/grupo-vias-administracao-details-page'
  ).then((m) => ({ default: m.GrupoViasAdministracaoDetailsPage }))
)
const DistritosCreatePage = lazy(() =>
  import(
    '@/pages/base/distritos/pages/distritos-create-page'
  ).then((m) => ({ default: m.DistritosCreatePage }))
)
const DistritosUpdatePage = lazy(() =>
  import(
    '@/pages/base/distritos/pages/distritos-update-page'
  ).then((m) => ({ default: m.DistritosUpdatePage }))
)

const AreaComumUtilitariosPage = lazy(() =>
  import('@/pages/area-comum/utilitarios').then((m) => ({
    default: m.UtilitariosPage,
  }))
)

const AppSaudePage = lazy(() =>
  import('@/pages/area-comum/app-saude').then((m) => ({
    default: m.AppSaudePage,
  }))
)

const AjudaPage = lazy(() =>
  import('@/pages/area-comum/ajuda').then((m) => ({
    default: m.AjudaPage,
  }))
)

const UtentesPage = lazy(() =>
  import('@/pages/utentes/pages/utentes-page').then((m) => ({
    default: m.UtentesPage,
  }))
)

const UtenteDetailsPage = lazy(() =>
  import('@/pages/utentes/pages/utente-details-page').then((m) => ({
    default: m.UtenteDetailsPage,
  }))
)

const UtenteEditPage = lazy(() =>
  import('@/pages/utentes/pages/utente-edit-page').then((m) => ({
    default: m.UtenteEditPage,
  }))
)

const ConfigExamesSemPapelPage = lazy(() => 
  import('@/pages/area-comum/tabelas/configuracao/exames-sem-papel/pages/config-exames-sem-papel-page')
    .then((m) => ({
      default: m.ConfigExamesSemPapelPage,
    }))
)

const SeparadoresPage = lazy(() =>
  import('@/pages/area-comum/tabelas/configuracao/separadores/pages/separadores-page').then((m) => ({
    default: m.SeparadoresPage,
  }))
)

const SeparadoresPersonalizadosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/separadores-personalizados/pages/separadores-personalizados-page'
  ).then((m) => ({
    default: m.SeparadoresPersonalizadosPage,
  }))
)

const ListagemFeriadosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tabelas/feriados/pages/listagem-feriados-page').then((m) => ({
    default: m.ListagemFeriadosPage,
  }))
)

const DocumentosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/configuracao/documentos/pages/documentos-page').then((m) => ({
    default: m.DocumentosPage,
  }))
)

const DocumentoEditorPage = lazy(() =>
  import('@/pages/area-comum/tabelas/configuracao/documentos/pages/documento-editor-page').then((m) => ({
    default: m.DocumentoEditorPage,
  }))
)

const DocumentosGeradosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/configuracao/documentos/pages/documentos-gerados-page').then((m) => ({
    default: m.DocumentosGeradosPage,
  }))
)



// Layout: sync browser → router quando o URL muda (ex.: menu). Com debounce para não conflituar com navegação das tabs.
function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const [browserPath, setBrowserPath] = useState(() => window.location.pathname)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detectar quando o URL do browser muda (ex.: clique no menu)
  useEffect(() => {
    const id = setInterval(() => {
      const w = window.location.pathname
      if (w !== browserPath) setBrowserPath(w)
    }, 250)
    return () => clearInterval(id)
  }, [browserPath])

  // Só forçar navigate se router e browser diferirem de forma estável (evita tira branca / bugs ao trocar tabs)
  useEffect(() => {
    if (browserPath === pathname) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
      return
    }
    if (syncTimeoutRef.current) return
    syncTimeoutRef.current = setTimeout(() => {
      syncTimeoutRef.current = null
      const w = window.location
      navigate(w.pathname + w.search + w.hash, { replace: true })
    }, 200)
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
    }
  }, [browserPath, pathname, navigate])

  // key com pathname + location.key para forçar remount ao navegar (ex.: fechar listagem → home tabelas)
  const outletKey = `${pathname}-${location.key}`

  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <div key={outletKey} className="h-full">
          <Outlet />
        </div>
      </Suspense>
    </DashboardLayout>
  )
}

// ----------------------------------------------------------------------

export default function AppRouter() {
  const navigate = useNavigate()

  // Track navigation history
  useNavigationTracking()

  useEffect(() => {
    useNavigationStore.getState().setNavigate(navigate)
  }, [navigate])

  const routes = useRoutes([
    {
      path: '/login',
      element: <SignInPage />,
      index: true,
    },
    // Standalone report designer route (no layout)
    {
      path: '/reports/designer',
      element: (
        <ProtectedRoute>
          <Suspense>
            <ReportDesignerPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <RoleRouter
              routes={{
                client: <DashboardPage />,
              }}
            />
          ),
        },
        {
          path: 'dashboard',
          element: <DashboardPage />,
        },
        {
          path: '404',
          element: <NotFound />,
        },
        {
          path: 'area-clinica',
          element: <Navigate to="/area-clinica/processo-clinico" replace />,
        },
        {
          path: 'area-clinica/processo-clinico',
          element: (
            <Suspense>
              <ProcessoClinicoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/atendimento',
          element: (
            <Suspense>
              <AtendimentoUtentePage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/atendimento/consultas-do-dia',
          element: (
            <Suspense>
              <ConsultasDoDiaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/atendimento/ficha-clinica',
          element: (
            <Suspense>
              <FichaClinicaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/atendimento/evolucao-tratamento',
          element: (
            <Suspense>
              <EvolucaoTratamentoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/atendimento/pedidos-assinatura',
          element: <Navigate to='/area-comum/posto-assinaturas' replace />,
        },
        {
          path: 'area-clinica/processo-clinico/agenda/consultas-marcadas',
          element: (
            <Suspense>
              <ConsultasMarcadasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/agenda/listagem-consultas-marcadas',
          element: (
            <Suspense>
              <ListagemConsultasMarcadasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/agenda/mapa-consultas-marcadas',
          element: (
            <Suspense>
              <MapaConsultasMarcadasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/exames/exames-sem-papel',
          element: (
            <Suspense>
              <ExamesSemPapelPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/atestados/novo-atestado',
          element: (
            <Suspense>
              <NovoAtestadoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/atestados/listagem-atestados',
          element: (
            <Suspense>
              <ListagemAtestadosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/historico/consultas-efetuadas',
          element: (
            <Suspense>
              <ConsultasEfetuadasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/historico/listagem-consultas-efetuadas',
          element: (
            <Suspense>
              <ListagemConsultasEfetuadasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/historico/mapa-consultas-efetuadas',
          element: (
            <Suspense>
              <MapaConsultasEfetuadasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/medicamentos',
          element: (
            <Suspense>
              <MedicamentosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/outros-medicamentos',
          element: (
            <Suspense>
              <OutrosMedicamentosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/medicos',
          element: (
            <Suspense>
              <MedicosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/patologias',
          element: (
            <Suspense>
              <PatologiasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/historia-clinica',
          element: (
            <Suspense>
              <HistoriaClinicaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/mapas-body-chart',
          element: (
            <Suspense>
              <MapasBodyChartPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/alergias',
          element: (
            <Suspense>
              <AlergiasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/estados-dentarios',
          element: (
            <Suspense>
              <EstadosDentariosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-clinica/processo-clinico/tabelas/ficha-clinica-secoes',
          element: <Navigate to='/area-comum/tabelas/configuracao/ficha-clinica-secoes' replace />,
        },
        {
          path: 'area-comum',
          element: (
            <Suspense>
              <AreaComumPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas',
          element: (
            <Suspense>
              <TabelasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/paises',
          element: (
            <Suspense>
              <ListagemPaisesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/paises/create',
          element: (
            <Suspense>
              <PaisesCreatePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/paises/update',
          element: (
            <Suspense>
              <PaisesUpdatePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/distritos',
          element: (
            <Suspense>
              <ListagemDistritosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/distritos/create',
          element: (
            <Suspense>
              <DistritosCreatePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/distritos/update',
          element: (
            <Suspense>
              <DistritosUpdatePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/concelhos',
          element: (
            <Suspense>
              <ListagemConcelhosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/freguesias',
          element: (
            <Suspense>
              <ListagemFreguesiasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/tipos-entidades',
          element: (
            <Suspense>
              <ListagemTiposEntidadePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/entidades-financeiras-responsaveis',
          element: (
            <Suspense>
              <ListagemEntidadesFinanceirasResponsaveisPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/bancos',
          element: (
            <Suspense>
              <ListagemBancosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/categorias-das-especialidades',
          element: (
            <Suspense>
              <ListagemCategoriasEspecialidadesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/especialidades',
          element: (
            <Suspense>
              <ListagemEspecialidadesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/estados-civis',
          element: (
            <Suspense>
              <ListagemEstadosCivisPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/grupos-sanguineos',
          element: (
            <Suspense>
              <ListagemGruposSanguineosPage />
            </Suspense>
          ),
        },
        {

          path: 'area-comum/tabelas/tabelas/habilitacoes',
          element: (
            <Suspense>
              <ListagemHabilitacoesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/moedas',
          element: (
            <Suspense>
              <ListagemMoedasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/profissoes',
          element: (
            <Suspense>
              <ListagemProfissoesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/sexos',
          element: (
            <Suspense>
              <ListagemSexosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/graus-parentesco',
          element: (
            <Suspense>
              <ListagemGrausParentescoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/taxas-iva',
          element: (
            <Suspense>
              <ListagemTaxasIvaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/proveniencias-utentes',
          element: (
            <Suspense>
              <ListagemProvenienciasUtentesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/feriados',
          element: (
            <Suspense>
              <ListagemFeriadosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/documentos',
          element: (
            <Suspense>
              <DocumentosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/documentos/editor/:modeloId',
          element: (
            <Suspense>
              <DocumentoEditorPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/documentos/gerados',
          element: <Navigate to='/area-comum/posto-assinaturas' replace />,
        },
        {
          path: 'area-comum/posto-assinaturas',
          element: (
            <Suspense>
              <DocumentosGeradosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/stocks',
          element: (
            <Suspense>
              <StocksSectionPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/stocks/vias-administracao',
          element: (
            <Suspense>
              <ListagemViasAdministracaoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/stocks/grupo-vias-administracao',
          element: (
            <Suspense>
              <ListagemGrupoViasAdministracaoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/servicos/servicos',
          element: (
            <Suspense>
              <ListagemServicosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/servicos/subsistemas-servicos',
          element: (
            <Suspense>
              <ListagemSubsistemasServicosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/servicos/tipos-servico',
          element: (
            <Suspense>
              <ListagemTiposServicoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/margem-medicos',
          element: (
            <Suspense>
              <ListagemMargemMedicosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/alergias',
          element: (
            <Suspense>
              <ListagemAlergiasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/graus-alergia',
          element: (
            <Suspense>
              <ListagemGrausAlergiaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/doencas',
          element: (
            <Suspense>
              <ListagemDoencasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/consultas/tipos-consultas',
          element: (
            <Suspense>
              <ListagemTiposConsultaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/locais-tratamento',
          element: (
            <Suspense>
              <ListagemLocaisTratamentoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/estados-lista-espera',
          element: (
            <Suspense>
              <ListagemEstadosListaEsperaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/motivos-alta',
          element: (
            <Suspense>
              <ListagemMotivosAltaPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/motivos-desmarcacao',
          element: (
            <Suspense>
              <ListagemMotivosDesmarcacaoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/marcas-aparelho',
          element: (
            <Suspense>
              <ListagemMarcasAparelhoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/modelos-aparelho',
          element: (
            <Suspense>
              <ListagemModelosAparelhoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/tipos-aparelho',
          element: (
            <Suspense>
              <ListagemTiposAparelhoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/aparelhos/novo',
          element: (
            <Suspense>
              <AparelhoFormPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/aparelhos',
          element: (
            <Suspense>
              <ListagemAparelhosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/fraquezas-musculares',
          element: (
            <Suspense>
              <ListagemFraquezasMuscularesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/prioridades',
          element: (
            <Suspense>
              <ListagemPrioridadesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/regioes-corpo',
          element: (
            <Suspense>
              <ListagemRegioesCorpoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/goniometrias',
          element: (
            <Suspense>
              <ListagemGoniometriasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/tipos-de-dor',
          element: (
            <Suspense>
              <ListagemTiposDeDorPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/patologias',
          element: (
            <Suspense>
              <ListagemPatologiasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/patologias/novo',
          element: (
            <Suspense>
              <PatologiaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/patologias/:id/editar',
          element: (
            <Suspense>
              <PatologiaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tratamentos/patologias/:id/ver',
          element: (
            <Suspense>
              <PatologiaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/exames/analises',
          element: (
            <Suspense>
              <ListagemAnalisesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/exames/categorias-procedimento',
          element: (
            <Suspense>
              <ListagemCategoriaProcedimentoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/exames/tipos-exame',
          element: (
            <Suspense>
              <ListagemTiposExamePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/exames/acordos',
          element: (
            <Suspense>
              <ListagemAcordosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/stocks/grupo-vias-administracao/novo',
          element: (
            <Suspense>
              <GrupoViasAdministracaoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/stocks/grupo-vias-administracao/:id/editar',
          element: (
            <Suspense>
              <GrupoViasAdministracaoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/stocks/grupo-vias-administracao/:id',
          element: (
            <Suspense>
              <GrupoViasAdministracaoDetailsPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/tabelas/geograficas/codigospostais',
          element: (
            <Suspense>
              <ListagemCodigosPostaisPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/clinica-atual/editar',
          element: <Navigate to='/area-comum/tabelas/configuracao/clinicas' replace />,
        },
        {
          path: 'area-comum/tabelas/configuracao/tratamentos',
          element: <Navigate to='/area-comum/tabelas/configuracao/clinicas' replace />,
        },
        {
          path: 'area-comum/tabelas/configuracao/clinicas',
          element: (
            <Suspense>
              <ListagemClinicasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/clinicas/:id',
          element: (
            <Suspense>
              <ClinicaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/clinicas/:id/editar',
          element: (
            <Suspense>
              <ClinicaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/sms',
          element: (
            <Suspense>
              <SmsConfigPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/sms/historico',
          element: (
            <Suspense>
              <SmsHistoryPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/voz',
          element: (
            <Suspense>
              <VozConfigPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/teleconsulta',
          element: (
            <Suspense>
              <TeleconsultaConfigPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/carta-conducao',
          element: (
            <Suspense>
              <ConfigCartaConducaoPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/email',
          element: (
            <Suspense>
              <EmailConfigPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/email/historico',
          element: (
            <Suspense>
              <EmailHistoryPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/webservices',
          element: (
            <Suspense>
              <WebserviceConfigPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/referencias-mb',
          element: (
            <Suspense>
              <ReferenciasMbConfigPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/referencias-mb/historico',
          element: (
            <Suspense>
              <ReferenciasMbHistoryPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/exames-sem-papel',
          element: (
            <Suspense>
              <ConfigExamesSemPapelPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/ficha-clinica-secoes',
          element: (
            <Suspense>
              <FichaClinicaSecoesPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/separadores',
          element: (
            <Suspense>
              <SeparadoresPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/configuracao/separadores-personalizados',
          element: (
            <Suspense>
              <SeparadoresPersonalizadosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/:section',
          element: (
            <Suspense>
              <TabelasSectionPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/utentes',
          element: (
            <Suspense>
              <ListagemUtentesPage />
            </Suspense>
          ),
        },
        // Rotas mais específicas primeiro (medicos-externos antes de medicos) para o match ser correcto
        {
          path: 'area-comum/tabelas/entidades/medicos-externos',
          element: (
            <Suspense>
              <ListagemMedicosExternosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/medicos',
          element: (
            <Suspense>
              <ListagemMedicosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/organismos',
          element: (
            <Suspense>
              <ListagemOrganismosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/centros-saude',
          element: (
            <Suspense>
              <ListagemCentrosSaudePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/funcionarios',
          element: (
            <Suspense>
              <ListagemFuncionariosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/fornecedores',
          element: (
            <Suspense>
              <ListagemFornecedoresPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/empresas',
          element: (
            <Suspense>
              <ListagemEmpresasPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/tecnicos',
          element: (
            <Suspense>
              <ListagemTecnicosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/empresas/nova',
          element: (
            <Suspense>
              <EmpresaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/empresas/:id',
          element: (
            <Suspense>
              <EmpresaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/empresas/:id/editar',
          element: (
            <Suspense>
              <EmpresaEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/tecnicos/novo',
          element: (
            <Suspense>
              <TecnicoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/tecnicos/:id',
          element: (
            <Suspense>
              <TecnicoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/tecnicos/:id/editar',
          element: (
            <Suspense>
              <TecnicoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/centros-saude/novo',
          element: (
            <Suspense>
              <CentroSaudeEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/centros-saude/:id',
          element: (
            <Suspense>
              <CentroSaudeEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/centros-saude/:id/editar',
          element: (
            <Suspense>
              <CentroSaudeEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/funcionarios/novo',
          element: (
            <Suspense>
              <FuncionarioEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/funcionarios/:id',
          element: (
            <Suspense>
              <FuncionarioEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/funcionarios/:id/editar',
          element: (
            <Suspense>
              <FuncionarioEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/medicos-externos/novo',
          element: (
            <Suspense>
              <MedicoExternoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/medicos-externos/:id',
          element: (
            <Suspense>
              <MedicoExternoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/medicos-externos/:id/editar',
          element: (
            <Suspense>
              <MedicoExternoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'fornecedores/novo',
          element: (
            <Suspense>
              <FornecedorEditPage />
            </Suspense>
          ),
        },
        {
          path: 'fornecedores/:id',
          element: (
            <Suspense>
              <FornecedorEditPage />
            </Suspense>
          ),
        },
        {
          path: 'fornecedores/:id/editar',
          element: (
            <Suspense>
              <FornecedorEditPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/tabelas/entidades/:subSection',
          element: (
            <Suspense>
              <TabelasEntidadesSubPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/utilitarios',
          element: (
            <Suspense>
              <AreaComumUtilitariosPage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/app-saude',
          element: (
            <Suspense>
              <AppSaudePage />
            </Suspense>
          ),
        },
        {
          path: 'area-comum/ajuda',
          element: (
            <Suspense>
              <AjudaPage />
            </Suspense>
          ),
        },
        {
          path: 'utentes',
          element: (
            <Suspense>
              <UtentesPage />
            </Suspense>
          ),
        },
        {
          path: 'utentes/novo',
          element: (
            <Suspense>
              <UtenteEditPage />
            </Suspense>
          ),
        },
        {
          path: 'utentes/:id',
          element: (
            <Suspense>
              <UtenteDetailsPage />
            </Suspense>
          ),
        },
        {
          path: 'utentes/:id/editar',
          element: (
            <Suspense>
              <UtenteEditPage />
            </Suspense>
          ),
        },
        {
          path: 'medicos/novo',
          element: (
            <Suspense>
              <MedicoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'medicos/:id',
          element: (
            <Suspense>
              <MedicoDetailsPage />
            </Suspense>
          ),
        },
        {
          path: 'medicos/:id/editar',
          element: (
            <Suspense>
              <MedicoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'organismos/novo',
          element: (
            <Suspense>
              <OrganismoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'organismos/:id',
          element: (
            <Suspense>
              <OrganismoEditPage />
            </Suspense>
          ),
        },
        {
          path: 'organismos/:id/editar',
          element: (
            <Suspense>
              <OrganismoEditPage />
            </Suspense>
          ),
        },
        {
          path: '/area-comum/tabelas/tratamentos/regioes-corpo',
          element: (
            <Suspense>
              <ListagemRegioesCorpoPage />
            </Suspense>
          ),
        },
        {
          path: '/area-comum/tabelas/tratamentos/tipos-de-dor',
          element: (
            <Suspense>
              <ListagemTiposDeDorPage />
            </Suspense>
          ),
        },
        ...utilitariosRoutes,
        ...reportsRoutes.filter((route) => route.path !== 'reports/designer'),
      ],
    },
    {
      path: '*',
      element: <Navigate to='/404' replace />,
    },
  ])

  return routes
}
