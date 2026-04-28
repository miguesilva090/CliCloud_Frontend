import { lazy } from 'react'
import { Navigate} from 'react-router-dom'
import { LicenseGuard } from '@/components/auth/license-guard'
import { areaComum } from '@/config/modules/common/area-comum-module'
import { actionTypes } from '@/config/modules'

const AreaComumPage = lazy(() => 
    import('@/pages/area-comum').then((m) => ({
        default: m.AreaComumPage,
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

const ClinicaEditLicenseGate = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/configuracao/clinicas/pages/clinica-edit-license-guard'
  ).then((m) => ({
    default: m.ClinicaEditLicenseGate,
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

const FichaClinicaSecoesPage = lazy(() =>
    import('@/pages/area-clinica/processo-clinico/tabelas/ficha-clinica-secoes/pages/ficha-clinica-secoes-page').then((m) => ({
      default: m.FichaClinicaSecoesPage,
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
  
  const ListagemConcelhosPage = lazy(() =>
    import(
      '@/pages/area-comum/tabelas/tabelas/geograficas/pages/listagem-concelhos-page'
    ).then((m) => ({ default: m.ListagemConcelhosPage }))
  )

  const ConcelhosCreatePage = lazy(() =>
    import(
      '@/pages/base/concelhos/pages/concelhos-create-page'
    ).then((m) => ({ default: m.ConcelhosCreatePage }))
  )

  const ConcelhosUpdatePage = lazy(() =>
    import(
      '@/pages/base/concelhos/pages/concelhos-update-page'
    ).then((m) => ({ default: m.ConcelhosUpdatePage }))
  )
  
  const ListagemFreguesiasPage = lazy(() =>
    import(
      '@/pages/area-comum/tabelas/tabelas/geograficas/pages/listagem-freguesias-page'
    ).then((m) => ({ default: m.ListagemFreguesiasPage }))
  )

  const FreguesiasCreatePage = lazy(() =>
    import(
      '@/pages/base/freguesias/pages/freguesias-create-page'
    ).then((m) => ({ default: m.FreguesiasCreatePage }))
  )

  const FreguesiasUpdatePage = lazy(() =>
    import(
      '@/pages/base/freguesias/pages/freguesias-update-page'
    ).then((m) => ({ default: m.FreguesiasUpdatePage }))
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
  const ListagemNotificacaoTiposPage = lazy(() =>
    import(
      '@/pages/area-comum/tabelas/tabelas/notificacao-tipos/pages/listagem-notificacao-tipos-page'
    ).then((m) => ({ default: m.ListagemNotificacaoTiposPage }))
  )
  const ListagemNotificacoesPage = lazy(() =>
    import(
      '@/pages/area-comum/tabelas/tabelas/notificacoes/pages/listagem-notificacoes-page'
    ).then((m) => ({ default: m.ListagemNotificacoesPage }))
  )
  const NotificacoesEnviadasPage = lazy(() =>
    import(
      '@/pages/area-comum/tabelas/tabelas/notificacoes/pages/notificacoes-enviadas-page'
    ).then((m) => ({ default: m.NotificacoesEnviadasPage }))
  )
  const NotificacoesAtualizacoesPage = lazy(() =>
    import(
      '@/pages/area-comum/tabelas/tabelas/notificacoes/pages/notificacoes-atualizacoes-page'
    ).then((m) => ({ default: m.NotificacoesAtualizacoesPage }))
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

export const areaComumRoutes = [
            {
              path: 'area-comum',
              element: (
                <LicenseGuard requiredModule={areaComum.id}>
                  <AreaComumPage />
                </LicenseGuard>
              ),
              manageWindow: false,
              windowName: 'Área Comum',
            },
            {
              path: 'area-comum/tabelas',
              element: (
                <LicenseGuard requiredModule={areaComum.id}>
                  <div></div>
                </LicenseGuard>
              ),
              windowName: 'Tabelas',
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/paises',
              element: (
                <LicenseGuard 
                requiredModule={areaComum?.id}
                requiredPermission={areaComum?.permissions?.paises?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemPaisesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.paises?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/paises/create',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.paises?.id}
                actionType={actionTypes.AuthAdd}
                >
                  <PaisesCreatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Criar ${areaComum?.permissions?.paises?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/paises/update',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.paises?.id}
                actionType={actionTypes.AuthChg}
                >
                  <PaisesUpdatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Atualizar ${areaComum?.permissions?.paises?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/distritos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.distritos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemDistritosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.distritos?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/distritos/create',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.distritos?.id}
                actionType={actionTypes.AuthAdd}
                >
                  <DistritosCreatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Criar ${areaComum?.permissions?.distritos?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/distritos/update',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.distritos?.id}
                actionType={actionTypes.AuthChg}
                >
                  <DistritosUpdatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Atualizar ${areaComum?.permissions?.distritos?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/concelhos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.concelhos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemConcelhosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.concelhos?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/concelhos/create',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.concelhos?.id}
                actionType={actionTypes.AuthAdd}
                >
                  <ConcelhosCreatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Criar ${areaComum?.permissions?.concelhos?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/concelhos/update',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.concelhos?.id}
                actionType={actionTypes.AuthChg}
                >
                  <ConcelhosUpdatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Atualizar ${areaComum?.permissions?.concelhos?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/freguesias',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.freguesias?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemFreguesiasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.freguesias?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/freguesias/create',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.freguesias?.id}
                actionType={actionTypes.AuthAdd}
                >
                  <FreguesiasCreatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Criar ${areaComum?.permissions?.freguesias?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/freguesias/update',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.freguesias?.id}
                actionType={actionTypes.AuthChg}
                >
                  <FreguesiasUpdatePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: `Atualizar ${areaComum?.permissions?.freguesias?.name}`,
            },
            {
              path: 'area-comum/tabelas/tabelas/tipos-entidades',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tiposEntidade?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTiposEntidadePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tiposEntidade?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/entidades-financeiras-responsaveis',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.entidadesFinanceirasResponsaveis?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemEntidadesFinanceirasResponsaveisPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.entidadesFinanceirasResponsaveis?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/bancos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.bancos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemBancosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.bancos?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/categorias-das-especialidades',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.categoriasDasEspecialidades?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemCategoriasEspecialidadesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.categoriasDasEspecialidades?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/especialidades',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.especialidades?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemEspecialidadesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.especialidades?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/estados-civis',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.estadosCivis?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemEstadosCivisPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.estadosCivis?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/grupos-sanguineos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.gruposSanguineos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemGruposSanguineosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.gruposSanguineos?.name,
            },
            {
    
              path: 'area-comum/tabelas/tabelas/habilitacoes',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.habilitacoes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemHabilitacoesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.habilitacoes?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/notificacao-tipos',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacaoTipos?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <ListagemNotificacaoTiposPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.notificacaoTipos?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/notificacoes',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacoes?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <ListagemNotificacoesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.notificacoes?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/notificacoes/enviadas',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacoesEnviadas?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <NotificacoesEnviadasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: 'Notificações enviadas',
            },
            {
              path: 'area-comum/tabelas/tabelas/notificacoes/atualizacoes',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacoesAtualizacao?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <NotificacoesAtualizacoesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: 'Notificações de atualização',
            },
            {
              path: 'area-comum/tabelas/tabelas/moedas',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.moedas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemMoedasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.moedas?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/profissoes',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.profissoes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemProfissoesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.profissoes?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/sexos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.sexos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemSexosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.sexos?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/graus-parentesco',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.grausParentesco?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemGrausParentescoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.grausParentesco?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/taxas-iva',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.taxasIva?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTaxasIvaPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.taxasIva?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/proveniencias-utentes',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.provenienciasUtentes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemProvenienciasUtentesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.provenienciasUtentes?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/feriados',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.feriados?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemFeriadosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.feriados?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/documentos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.documentos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <DocumentosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.documentos?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/documentos/editor/:modeloId',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.documentos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <DocumentoEditorPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.documentos?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/documentos/gerados',
              element: <Navigate to='/area-comum/tabelas/configuracao/documentos' replace />,
            },
            {
              path: 'area-comum/tabelas/stocks',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.stocks?.id}
                actionType={actionTypes.AuthVer}
                >
                  <StocksSectionPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.stocks?.name,
            },
            {
              path: 'area-comum/tabelas/stocks/vias-administracao',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.viasAdministracao?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemViasAdministracaoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.viasAdministracao?.name,
            },
            {
              path: 'area-comum/tabelas/stocks/grupo-vias-administracao',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.grupoViasAdministracao?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemGrupoViasAdministracaoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.grupoViasAdministracao?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/servicos/servicos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.servicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemServicosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.servicos?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/servicos/subsistemas-servicos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.subsistemasServicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemSubsistemasServicosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.servicos?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/servicos/tipos-servico',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tiposServico?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTiposServicoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.servicos?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/margem-medicos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.margemMedicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemMargemMedicosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.margemMedicos?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/alergias',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.alergias?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemAlergiasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.margemMedicos?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/graus-alergia',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.grausAlergia?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemGrausAlergiaPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.margemMedicos?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/doencas',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.doencas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemDoencasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.margemMedicos?.name,
            },
            {
              path: 'area-comum/tabelas/consultas/tipos-consultas',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tiposConsultas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTiposConsultaPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.margemMedicos?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/locais-tratamento',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.locaisTratamento?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemLocaisTratamentoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.locaisTratamento?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/estados-lista-espera',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.estadosListaEspera?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemEstadosListaEsperaPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.estadosListaEspera?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/motivos-alta',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.motivosAlta?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemMotivosAltaPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.motivosAlta?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/motivos-desmarcacao',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.motivosDesmarcacao?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemMotivosDesmarcacaoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.motivosDesmarcacao?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/marcas-aparelho',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.marcasAparelho?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemMarcasAparelhoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.marcasAparelho?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/modelos-aparelho',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.modelosAparelho?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemModelosAparelhoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.modelosAparelho?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/tipos-aparelho',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tiposAparelho?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTiposAparelhoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tiposAparelho?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/aparelhos/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.aparelhos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <AparelhoFormPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.aparelhos?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/aparelhos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.aparelhos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemAparelhosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.aparelhos?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/fraquezas-musculares',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.fraquezasMusculares?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemFraquezasMuscularesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.fraquezasMusculares?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/prioridades',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.prioridades?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemPrioridadesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.prioridades?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/regioes-corpo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.regioesCorpo?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemRegioesCorpoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.regioesCorpo?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/goniometrias',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.goniometrias?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemGoniometriasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.goniometrias?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/tipos-de-dor',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tiposDeDor?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTiposDeDorPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tiposDeDor?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/patologias',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.patologias?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemPatologiasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.patologias?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/patologias/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.patologias?.id}
                actionType={actionTypes.AuthVer}
                >
                  <PatologiaEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.patologias?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/patologias/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.patologias?.id}
                actionType={actionTypes.AuthVer}
                >
                  <PatologiaEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.patologias?.name,
            },
            {
              path: 'area-comum/tabelas/tratamentos/patologias/:id/ver',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.patologias?.id}
                actionType={actionTypes.AuthVer}
                >
                  <PatologiaEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.patologias?.name,
            },
            {
              path: 'area-comum/tabelas/exames/analises',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.analises?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemAnalisesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.analises?.name,
            },
            {
              path: 'area-comum/tabelas/exames/categorias-procedimento',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.categoriaProcedimento?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemCategoriaProcedimentoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.categoriaProcedimento?.name,
            },
            {
              path: 'area-comum/tabelas/exames/tipos-exame',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tiposExame?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTiposExamePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.analises?.name,
            },
            {
              path: 'area-comum/tabelas/exames/acordos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.acordos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemAcordosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.acordos?.name,
            },
            {
              path: 'area-comum/tabelas/stocks/grupo-vias-administracao/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.grupoViasAdministracao?.id}
                actionType={actionTypes.AuthVer}
                >
                  <GrupoViasAdministracaoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.acordos?.name,
            },
            {
              path: 'area-comum/tabelas/stocks/grupo-vias-administracao/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.grupoViasAdministracao?.id}
                actionType={actionTypes.AuthVer}
                >
                  <GrupoViasAdministracaoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.acordos?.name,
            },
            {
              path: 'area-comum/tabelas/stocks/grupo-vias-administracao/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.grupoViasAdministracao?.id}
                actionType={actionTypes.AuthVer}
                >
                  <GrupoViasAdministracaoDetailsPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.acordos?.name,
            },
            {
              path: 'area-comum/tabelas/tabelas/geograficas/codigospostais',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.codigosPostais?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemCodigosPostaisPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.acordos?.name,
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
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesClinica?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemClinicasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesClinica?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/clinicas/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesClinica?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ClinicaEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesClinica?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/clinicas/:id/editar',
              element: <ClinicaEditLicenseGate />,
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesClinica?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/sms',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesSms?.id}
                actionType={actionTypes.AuthVer}
                >
                  <SmsConfigPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesSms?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/sms/historico',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesSms?.id}
                actionType={actionTypes.AuthVer}
                >
                  <SmsHistoryPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesSms?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/voz',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesVoz?.id}
                actionType={actionTypes.AuthVer}
                >
                  <VozConfigPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesVoz?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/teleconsulta',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesTeleconsulta?.id}
                actionType={actionTypes.AuthVer}
                >
                  <TeleconsultaConfigPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.teleconsulta?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/carta-conducao',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesCartaConducao?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ConfigCartaConducaoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesCartaConducao?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/email',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesEmail?.id}
                actionType={actionTypes.AuthVer}
                >
                  <EmailConfigPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesEmail?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/email/historico',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesEmail?.id}
                actionType={actionTypes.AuthVer}
                >
                  <EmailHistoryPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesEmail?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/webservices',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.configuracoesWebservices?.id}
                actionType={actionTypes.AuthVer}
                >
                  <WebserviceConfigPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesWebservices?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/referencias-mb',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.referenciasMb?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ReferenciasMbConfigPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.referenciasMb?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/referencias-mb/historico',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.referenciasMb?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ReferenciasMbHistoryPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.referenciasMb?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/exames-sem-papel',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.examesSemPapel?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ConfigExamesSemPapelPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.configuracoesExamesSemPapel?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/ficha-clinica-secoes',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.formulariosPersonalizados?.id}
                permissionFallbackIds={[
                  areaComum.permissions.gestaoSeparadores.id,
                ]}
                actionType={actionTypes.AuthVer}
                >
                  <FichaClinicaSecoesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.formulariosPersonalizados?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/separadores',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.separadores?.id}
                actionType={actionTypes.AuthVer}
                >
                  <SeparadoresPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.separadores?.name,
            },
            {
              path: 'area-comum/tabelas/configuracao/separadores-personalizados',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.separadoresPersonalizados?.id}
                actionType={actionTypes.AuthVer}
                >
                  <SeparadoresPersonalizadosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.separadoresPersonalizados?.name,
            },
            {
              path: 'area-comum/tabelas/notificacoes/enviadas',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacoesEnviadas?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <NotificacoesEnviadasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: 'Notificações enviadas',
            },
            {
              path: 'area-comum/tabelas/notificacoes/atualizacoes',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacoesAtualizacao?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <NotificacoesAtualizacoesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: 'Notificações de atualização',
            },
            {
              path: 'area-comum/tabelas/notificacoes',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacoes?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <ListagemNotificacoesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.notificacoes?.name,
            },
            {
              path: 'area-comum/tabelas/notificacao-tipos',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.notificacaoTipos?.id}
                  actionType={actionTypes.AuthVer}
                  requireExplicitPermission
                >
                  <ListagemNotificacaoTiposPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.notificacaoTipos?.name,
            },
            {
              path: 'area-comum/tabelas/:section',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tabelas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <TabelasSectionPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tabelas?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/utentes',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.utentes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemUtentesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.utentes?.name,
            },
            // Rotas mais específicas primeiro (medicos-externos antes de medicos) para o match ser correcto
            {
              path: 'area-comum/tabelas/entidades/medicos-externos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicosExternos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemMedicosExternosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicosExternos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/medicos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemMedicosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/organismos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.organismos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemOrganismosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.organismos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/centros-saude',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.centrosSaude?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemCentrosSaudePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.centrosSaude?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/funcionarios',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.funcionarios?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemFuncionariosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.funcionarios?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/fornecedores',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.fornecedores?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemFornecedoresPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.fornecedores?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/empresas',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.empresas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemEmpresasPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.empresas?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/tecnicos',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tecnicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTecnicosPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tecnicos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/empresas/nova',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.empresas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <EmpresaEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.empresas?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/empresas/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.empresas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <EmpresaEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.empresas?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/empresas/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.empresas?.id}
                actionType={actionTypes.AuthVer}
                >
                  <EmpresaEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.empresas?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/tecnicos/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tecnicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <TecnicoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tecnicos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/tecnicos/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tecnicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <TecnicoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tecnicos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/tecnicos/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tecnicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <TecnicoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tecnicos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/centros-saude/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.centrosSaude?.id}
                actionType={actionTypes.AuthVer}
                >
                  <CentroSaudeEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.centrosSaude?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/centros-saude/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.centrosSaude?.id}
                actionType={actionTypes.AuthVer}
                >
                  <CentroSaudeEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.centrosSaude?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/centros-saude/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.centrosSaude?.id}
                actionType={actionTypes.AuthVer}
                >
                  <CentroSaudeEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.centrosSaude?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/funcionarios/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.funcionarios?.id}
                actionType={actionTypes.AuthVer}
                >
                  <FuncionarioEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.funcionarios?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/funcionarios/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.funcionarios?.id}
                actionType={actionTypes.AuthVer}
                >
                  <FuncionarioEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.funcionarios?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/funcionarios/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.funcionarios?.id}
                actionType={actionTypes.AuthVer}
                >
                  <FuncionarioEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.funcionarios?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/medicos-externos/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicosExternos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <MedicoExternoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicosExternos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/medicos-externos/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicosExternos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <MedicoExternoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicosExternos?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/medicos-externos/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicosExternos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <MedicoExternoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicosExternos?.name,
            },
            {
              path: 'fornecedores/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.fornecedores?.id}
                actionType={actionTypes.AuthVer}
                >
                  <FornecedorEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.fornecedores?.name,
            },
            {
              path: 'fornecedores/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.fornecedores?.id}
                actionType={actionTypes.AuthVer}
                >
                  <FornecedorEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.fornecedores?.name,
            },
            {
              path: 'fornecedores/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.fornecedores?.id}
                actionType={actionTypes.AuthVer}
                >
                  <FornecedorEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.fornecedores?.name,
            },
            {
              path: 'area-comum/tabelas/entidades/:subSection',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.entidades?.id}
                actionType={actionTypes.AuthVer}
                >
                  <TabelasEntidadesSubPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.entidades?.name,
            },
            {
              path: 'area-comum/utilitarios',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.utilitariosLinhaMenu?.id}
                actionType={actionTypes.AuthVer}
                >
                  <AreaComumUtilitariosPage />
                </LicenseGuard>
              ),
              manageWindow: false,
              windowName: areaComum?.permissions?.utilitariosLinhaMenu?.name,
            },
            {
              path: 'area-comum/utilitarios/replicar-patologias',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.utilitariosLinhaMenu?.id}
                  actionType={actionTypes.AuthVer}
                >
                  <AreaComumUtilitariosPage />
                </LicenseGuard>
              ),
              manageWindow: false,
              windowName: 'Replicar Patologias',
            },
            {
              path: 'area-comum/utilitarios/replicar-subsistemas',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.utilitariosLinhaMenu?.id}
                  actionType={actionTypes.AuthVer}
                >
                  <AreaComumUtilitariosPage />
                </LicenseGuard>
              ),
              manageWindow: false,
              windowName: 'Replicar Subsistemas',
            },
            {
              path: 'area-comum/utilitarios/atualizar-subsistemas-entidade',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.utilitariosLinhaMenu?.id}
                  actionType={actionTypes.AuthVer}
                >
                  <AreaComumUtilitariosPage />
                </LicenseGuard>
              ),
              manageWindow: false,
              windowName: 'Atualizar Subsistemas Por Entidade',
            },
            {
              path: 'area-comum/utilitarios/replicar-margem-medicos',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.utilitariosLinhaMenu?.id}
                  actionType={actionTypes.AuthVer}
                >
                  <AreaComumUtilitariosPage />
                </LicenseGuard>
              ),
              manageWindow: false,
              windowName: 'Replicar Margem/Médicos Consultas',
            },
            {
              path: 'area-comum/utilitarios/fundir-utentes',
              element: (
                <LicenseGuard
                  requiredModule={areaComum.id}
                  requiredPermission={areaComum?.permissions?.utilitariosLinhaMenu?.id}
                  actionType={actionTypes.AuthVer}
                >
                  <AreaComumUtilitariosPage />
                </LicenseGuard>
              ),
              manageWindow: false,
              windowName: 'Fundir Utentes',
            },
            {
              path: 'area-comum/app-saude',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.appSaude?.id}
                actionType={actionTypes.AuthVer}
                >
                  <AppSaudePage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.utilitarios?.name,
            },
            {
              path: 'area-comum/ajuda',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.ajuda?.id}
                actionType={actionTypes.AuthVer}
                >
                  <AjudaPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.utilitarios?.name,
            },
            {
              path: 'utentes',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.utentes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <UtentesPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.utentes?.name,
            },
            {
              path: 'utentes/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.utentes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <UtenteEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.utentes?.name,
            },
            {
              path: 'utentes/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.utentes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <UtenteDetailsPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.utentes?.name,
            },
            {
              path: 'utentes/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.utentes?.id}
                actionType={actionTypes.AuthVer}
                >
                  <UtenteEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.utentes?.name,
            },
            {
              path: 'medicos/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <MedicoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicos?.name,
            },
            {
              path: 'medicos/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <MedicoDetailsPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicos?.name,
            },
            {
              path: 'medicos/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.medicos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <MedicoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.medicos?.name,
            },
            {
              path: 'organismos/novo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.organismos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <OrganismoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.organismos?.name,
            },
            {
              path: 'organismos/:id',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.organismos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <OrganismoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.organismos?.name,
            },
            {
              path: 'organismos/:id/editar',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.organismos?.id}
                actionType={actionTypes.AuthVer}
                >
                  <OrganismoEditPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.organismos?.name,
            },
            {
              path: '/area-comum/tabelas/tratamentos/regioes-corpo',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.regioesCorpo?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemRegioesCorpoPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.regioesCorpo?.name,
            },
            {
              path: '/area-comum/tabelas/tratamentos/tipos-de-dor',
              element: (
                <LicenseGuard 
                requiredModule={areaComum.id}
                requiredPermission={areaComum?.permissions?.tiposDeDor?.id}
                actionType={actionTypes.AuthVer}
                >
                  <ListagemTiposDeDorPage />
                </LicenseGuard>
              ),
              manageWindow: true,
              windowName: areaComum?.permissions?.tiposDeDor?.name,
            },
]
  
  
  
  

