import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { LicenseGuard } from '@/components/auth/license-guard'
import { modules, actionTypes } from '@/config/modules'

const AreaFinanceiraHomePage = lazy(() =>
  import('@/pages/area-financeira/pages/area-financeira-home-page').then(
    (m) => ({ default: m.AreaFinanceiraHomePage }),
  ),
)
const AreaFinanceiraPlaceholderPage = lazy(() =>
  import('@/pages/area-financeira/pages/area-financeira-placeholder-page').then(
    (m) => ({ default: m.AreaFinanceiraPlaceholderPage }),
  ),
)
const ListagemNaturezaDocumentoPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/documentos/natureza-documento/pages/listagem-natureza-documento-page'
  ).then((m) => ({ default: m.ListagemNaturezaDocumentoPage })),
)
const ListagemSeriesDocumentoPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/documentos/series-documento/pages/listagem-series-documento-page'
  ).then((m) => ({ default: m.ListagemSeriesDocumentoPage })),
)
const ListagemFaturacaoPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/pages/listagem-faturacao-page').then(
    (m) => ({ default: m.ListagemFaturacaoPage }),
  ),
)
const ListagemCredenciaisSnsModuloPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/credenciais-sns/pages/listagem-credenciais-sns-modulo-page'
  ).then((m) => ({ default: m.ListagemCredenciaisSnsModuloPage })),
)
const ListagemCredenciaisSnsFicheiroEletronicoPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/credenciais-sns/pages/listagem-credenciais-sns-ficheiro-eletronico-page'
  ).then((m) => ({ default: m.ListagemCredenciaisSnsFicheiroEletronicoPage })),
)
const ConfigAdsePage = lazy(() =>
  import('@/pages/area-financeira/faturacao/adse/pages/config-adse-page').then(
    (m) => ({ default: m.ConfigAdsePage }),
  ),
)
const ComunicacaoAdseTratamentosPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-tratamentos-page').then(
    (m) => ({ default: m.ComunicacaoAdseTratamentosPage }),
  ),
)
const ComunicacaoAdseConsultasPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-consultas-page').then(
    (m) => ({ default: m.ComunicacaoAdseConsultasPage }),
  ),
)
const ComunicacaoAdseExamesPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-exames-page').then(
    (m) => ({ default: m.ComunicacaoAdseExamesPage }),
  ),
)
const NovoDocumentoPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/pages/novo-documento-page').then(
    (m) => ({ default: m.NovoDocumentoPage }),
  ),
)
const DocumentoEdicaoPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/pages/documento-edicao-page').then(
    (m) => ({ default: m.DocumentoEdicaoPage }),
  ),
)
const LiquidacaoUtentePage = lazy(() =>
  import('@/pages/area-financeira/faturacao/pages/liquidacao-utente-page').then(
    (m) => ({ default: m.LiquidacaoUtentePage }),
  ),
)
const LiquidacaoOrganismoPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/pages/liquidacao-organismo-page').then(
    (m) => ({ default: m.LiquidacaoOrganismoPage }),
  ),
)

const FicheiroEletronicoListagemPage = lazy(() =>
  import('@/pages/area-financeira/ficheiros-eletronicos/pages/ficheiro-eletronico-listagem-page').then(
    (m) => ({ default: m.FicheiroEletronicoListagemPage }),
  ),
)

/** Rotas alias — mesmas páginas da área comum, prefixo financeiro para navegação correcta. */
const ListagemContasBancariasPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/contas-bancarias/pages/listagem-contas-bancarias-page'
  ).then((m) => ({ default: m.ListagemContasBancariasPage })),
)
const ListagemBancosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tabelas/bancos/pages/listagem-bancos-page').then(
    (m) => ({ default: m.ListagemBancosPage }),
  ),
)
const ListagemCodigosPostaisPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/codigospostais/pages/listagem-codigospostais-page'
  ).then((m) => ({ default: m.ListagemCodigosPostaisPage })),
)
const ListagemConcelhosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/concelhos/pages/listagem-concelhos-page'
  ).then((m) => ({ default: m.ListagemConcelhosPage })),
)
const ListagemDistritosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/geograficas/distritos/pages/listagem-distritos-page'
  ).then((m) => ({ default: m.ListagemDistritosPage })),
)
const ListagemPaisesPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tabelas/geograficas/paises/pages/listagem-paises-page').then(
    (m) => ({ default: m.ListagemPaisesPage }),
  ),
)
const ListagemMotivosIsencaoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/motivo-isencao/pages/listagem-motivos-isencao-page'
  ).then((m) => ({ default: m.ListagemMotivosIsencaoPage })),
)
const ListagemMotivosRetencaoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/motivo-retencao/pages/listagem-motivos-retencao-page'
  ).then((m) => ({ default: m.ListagemMotivosRetencaoPage })),
)
const ListagemTaxasIvaPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tabelas/taxas-iva/pages/listagem-taxas-iva-page').then(
    (m) => ({ default: m.ListagemTaxasIvaPage }),
  ),
)
const ListagemMoedasPage = lazy(() =>
  import('@/pages/area-comum/tabelas/tabelas/moedas/pages/listagem-moedas-page').then(
    (m) => ({ default: m.ListagemMoedasPage }),
  ),
)
const ListagemCondicoesPagamentoPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/pagamentos/condicao-pagamento/pages/listagem-condicoes-pagamento-page'
  ).then((m) => ({ default: m.ListagemCondicoesPagamentoPage })),
)
const ListagemModosPagamentoPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/pagamentos/modo-pagamento/pages/listagem-modos-pagamento-page'
  ).then((m) => ({ default: m.ListagemModosPagamentoPage })),
)
const ListagemServicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/servicos/pages/listagem-servicos-page'
  ).then((m) => ({ default: m.ListagemServicosPage })),
)
const ListagemSubsistemasServicosPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/pages/listagem-subsistemas-servicos-page'
  ).then((m) => ({ default: m.ListagemSubsistemasServicosPage })),
)
const ListagemTiposServicoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/consultas/servicos/tipos-servico/pages/listagem-tipos-servico-page'
  ).then((m) => ({ default: m.ListagemTiposServicoPage })),
)
const ListagemZonasPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/zonas/zonas/pages/listagem-zonas-page'
  ).then((m) => ({ default: m.ListagemZonasPage })),
)
const ListagemZonasFiscaisPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/zonas/zonas-fiscais/pages/listagem-zonas-fiscais-page'
  ).then((m) => ({ default: m.ListagemZonasFiscaisPage })),
)

const ListagemArmazensPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/tabelas/artigos/armazens/pages/listagem-armazens-page').then(
    (m) => ({ default: m.ListagemArmazensPage }),
  ),
)

const ListagemArtigosPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/tabelas/artigos/artigos/pages/listagem-artigos-page').then(
    (m) => ({ default: m.ListagemArtigosPage }),
  ),
)

const ArtigoEditPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/tabelas/artigos/artigos/pages/artigo-edit-page').then(
    (m) => ({ default: m.ArtigoEditPage }),
  ),
)

const ListagemUnidadesPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/tabelas/artigos/unidades/pages/listagem-unidades-page').then(
    (m) => ({ default: m.ListagemUnidadesPage }),
  ),
)

const ListagemFamiliasArtigoPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/familias-artigo/pages/listagem-familias-artigo-page'
  ).then((m) => ({ default: m.ListagemFamiliasArtigoPage })),
)

const ListagemSubsistemasArtigosPage = lazy(() =>
  import(
    '@/pages/area-financeira/subsistemas-artigos/pages/listagem-subsistemas-artigos-page'
  ).then((m) => ({ default: m.ListagemSubsistemasArtigosPage })),
)

/** Entidades — mesmas páginas da área comum, prefixo faturação. */
const ListagemUtentesPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/utentes/pages/listagem-utentes-page').then(
    (m) => ({ default: m.ListagemUtentesPage }),
  ),
)
const UtenteEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/utentes/pages/utente-edit-page').then(
    (m) => ({ default: m.UtenteEditPage }),
  ),
)
const UtenteDetailsPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/utentes/pages/utente-details-page').then(
    (m) => ({ default: m.UtenteDetailsPage }),
  ),
)
const ListagemMedicosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/medicos/pages/listagem-medicos-page').then(
    (m) => ({ default: m.ListagemMedicosPage }),
  ),
)
const MedicoEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/medicos/pages/medico-edit-page').then(
    (m) => ({ default: m.MedicoEditPage }),
  ),
)
const MedicoDetailsPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/medicos/pages/medico-details-page').then(
    (m) => ({ default: m.MedicoDetailsPage }),
  ),
)
const ListagemOrganismosPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/organismos/pages/listagem-organismos-page').then(
    (m) => ({ default: m.ListagemOrganismosPage }),
  ),
)
const OrganismoEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/organismos/pages/organismo-edit-page').then(
    (m) => ({ default: m.OrganismoEditPage }),
  ),
)
const ListagemFornecedoresPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/entidades/fornecedores/pages/listagem-fornecedores-page'
  ).then((m) => ({ default: m.ListagemFornecedoresPage })),
)
const FornecedorEditPage = lazy(() =>
  import('@/pages/area-comum/tabelas/entidades/fornecedores/pages/fornecedor-edit-page').then(
    (m) => ({ default: m.FornecedorEditPage }),
  ),
)

const entidadesPermissionFallback = [modules.areaFinanceira.permissions.entidades.id]

export const areaFinanceiraRoutes = [
  {
    path: 'area-financeira',
    element: <Navigate to='/area-financeira/faturacao' replace />,
    manageWindow: false,
  },
  {
    path: 'area-financeira/recibos',
    element: <Navigate to='/area-financeira/faturacao' replace />,
    manageWindow: false,
  },
  {
    path: 'area-financeira/faturacao',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.faturacao.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraHomePage />
      </LicenseGuard>
    ),
    manageWindow: false,
    windowName: 'Faturação',
  },
  {
    path: 'area-financeira/faturacao/novo-documento',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.faturacao.id}
        actionType={actionTypes.AuthVer}
      >
        <NovoDocumentoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Novo Documento',
  },
  {
    path: 'area-financeira/faturacao/faturacao',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.faturacao.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemFaturacaoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação',
  },
  {
    path: 'area-financeira/faturacao/documento/:id',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.faturacao.id}
        actionType={actionTypes.AuthVer}
      >
        <DocumentoEdicaoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Documento',
  },
  {
    path: 'area-financeira/faturacao/liquidacao-utente',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.faturacao.id}
        actionType={actionTypes.AuthVer}
      >
        <LiquidacaoUtentePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Liquidação de Utente',
  },
  {
    path: 'area-financeira/faturacao/liquidacao-organismo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.faturacao.id}
        actionType={actionTypes.AuthVer}
      >
        <LiquidacaoOrganismoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Liquidação de Organismo',
  },
  {
    path: 'area-financeira/contas-correntes',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.contasCorrentes.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Contas Correntes' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Contas Correntes',
  },
  {
    path: 'area-financeira/tesouraria',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tesouraria.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Tesouraria' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Tesouraria',
  },
  {
    path: 'area-financeira/configuracoes',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.configuracoes.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Configurações' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Configurações',
  },
  {
    path: 'area-financeira/faturacao/ficheiros-eletronicos',
    element: (
      <Navigate to='/area-financeira/faturacao/ficheiros-eletronicos/sad-gnr' replace />
    ),
    manageWindow: false,
  },
  {
    path: 'area-financeira/faturacao/ficheiros-eletronicos/:siglaSlug',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.ficheirosEletronicos.id}
        actionType={actionTypes.AuthVer}
      >
        <FicheiroEletronicoListagemPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Ficheiro Eletrónico',
  },
  {
    path: 'area-financeira/faturacao/ficheiro-saft',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.ficheirosEletronicos.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Geração de Ficheiro SAFT PT' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Geração de Ficheiro SAFT PT',
  },
  {
    path: 'area-financeira/faturacao/exportar-contabilidade',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.ficheirosEletronicos.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Exportar Ficheiro Contabilidade' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Exportar Ficheiro Contabilidade',
  },
  {
    path: 'area-financeira/faturacao/credenciais-sns',
    element: (
      <Navigate
        to='/area-financeira/faturacao/credenciais-sns/especialidades'
        replace
      />
    ),
  },
  {
    path: 'area-financeira/faturacao/credenciais-sns/fisioterapia',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.credenciaisSns.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemCredenciaisSnsModuloPage modulo='fisioterapia' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Credenciais S.N.S. — Fisioterapia',
  },
  {
    path: 'area-financeira/faturacao/credenciais-sns/especialidades',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.credenciaisSns.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemCredenciaisSnsModuloPage modulo='especialidades' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Credenciais S.N.S. — Especialidades',
  },
  {
    path: 'area-financeira/faturacao/credenciais-sns/exames',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.credenciaisSns.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemCredenciaisSnsModuloPage modulo='exames' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Credenciais S.N.S. — Exames',
  },
  {
    path: 'area-financeira/faturacao/credenciais-sns/ficheiro-eletronico',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.credenciaisSns.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemCredenciaisSnsFicheiroEletronicoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Credenciais S.N.S. — Ficheiro Eletrónico',
  },
  {
    path: 'area-financeira/faturacao/adse',
    element: (
      <Navigate to='/area-financeira/faturacao/adse/tratamentos' replace />
    ),
  },
  {
    path: 'area-financeira/faturacao/adse/configuracoes',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <ConfigAdsePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'ADSE — Configurações',
  },
  {
    path: 'area-financeira/faturacao/adse/tratamentos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <ComunicacaoAdseTratamentosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação ADSE - Tratamentos',
  },
  {
    path: 'area-financeira/faturacao/adse/consultas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <ComunicacaoAdseConsultasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação ADSE - Consultas',
  },
  {
    path: 'area-financeira/faturacao/adse/exames',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <ComunicacaoAdseExamesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação ADSE - Exames',
  },
  {
    path: 'area-financeira/faturacao/mapas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.mapas.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Mapas' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Mapas',
  },
  {
    path: 'area-financeira/faturacao/entidades',
    element: (
      <Navigate to='/area-financeira/faturacao/entidades/fornecedores' replace />
    ),
  },
  {
    path: 'area-financeira/faturacao/entidades/fornecedores',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.fornecedores.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <ListagemFornecedoresPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Fornecedores',
  },
  {
    path: 'area-financeira/faturacao/entidades/fornecedores/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.fornecedores.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <FornecedorEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Fornecedores',
  },
  {
    path: 'area-financeira/faturacao/entidades/fornecedores/:id',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.fornecedores.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <FornecedorEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Fornecedores',
  },
  {
    path: 'area-financeira/faturacao/entidades/fornecedores/:id/editar',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.fornecedores.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <FornecedorEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Fornecedores',
  },
  {
    path: 'area-financeira/faturacao/entidades/medicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.medicos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <ListagemMedicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Médicos',
  },
  {
    path: 'area-financeira/faturacao/entidades/medicos/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.medicos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <MedicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Médicos',
  },
  {
    path: 'area-financeira/faturacao/entidades/medicos/:id',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.medicos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <MedicoDetailsPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Médicos',
  },
  {
    path: 'area-financeira/faturacao/entidades/medicos/:id/editar',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.medicos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <MedicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Médicos',
  },
  {
    path: 'area-financeira/faturacao/entidades/organismos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.organismos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <ListagemOrganismosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Organismos',
  },
  {
    path: 'area-financeira/faturacao/entidades/organismos/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.organismos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <OrganismoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Organismos',
  },
  {
    path: 'area-financeira/faturacao/entidades/organismos/:id',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.organismos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <OrganismoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Organismos',
  },
  {
    path: 'area-financeira/faturacao/entidades/organismos/:id/editar',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.organismos.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <OrganismoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Organismos',
  },
  {
    path: 'area-financeira/faturacao/entidades/utentes',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.utentes.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <ListagemUtentesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Utentes',
  },
  {
    path: 'area-financeira/faturacao/entidades/utentes/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.utentes.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <UtenteEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Utentes',
  },
  {
    path: 'area-financeira/faturacao/entidades/utentes/:id',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.utentes.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <UtenteDetailsPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Utentes',
  },
  {
    path: 'area-financeira/faturacao/entidades/utentes/:id/editar',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaComum.permissions.utentes.id}
        permissionFallbackIds={entidadesPermissionFallback}
        actionType={actionTypes.AuthVer}
      >
        <UtenteEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Utentes',
  },
  {
    path: 'area-financeira/faturacao/tabelas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Tabelas' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Tabelas',
  },
  {
    path: 'area-financeira/faturacao/tabelas/documentos/natureza-documento',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemNaturezaDocumentoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Natureza dos Documentos',
  },
  {
    path: 'area-financeira/faturacao/tabelas/documentos/series-documento',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemSeriesDocumentoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Séries dos Documentos',
  },
  {
    path: 'area-financeira/faturacao/tabelas/contas-bancarias',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemContasBancariasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Contas Bancárias',
  },
  {
    path: 'area-financeira/faturacao/tabelas/bancos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemBancosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Instituições Financeiras',
  },
  {
    path: 'area-financeira/faturacao/tabelas/geograficas/codigospostais',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemCodigosPostaisPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Código Postal',
  },
  {
    path: 'area-financeira/faturacao/tabelas/geograficas/concelhos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemConcelhosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Concelhos',
  },
  {
    path: 'area-financeira/faturacao/tabelas/geograficas/distritos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemDistritosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Distritos',
  },
  {
    path: 'area-financeira/faturacao/tabelas/geograficas/paises',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemPaisesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Países',
  },
  {
    path: 'area-financeira/faturacao/tabelas/impostos/motivos-isencao',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemMotivosIsencaoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Motivos de Isenção',
  },
  {
    path: 'area-financeira/faturacao/tabelas/impostos/taxas-iva',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemTaxasIvaPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Taxa de Imposto',
  },
  {
    path: 'area-financeira/faturacao/tabelas/impostos/motivos-retencao',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemMotivosRetencaoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Motivos de Retenção',
  },
  {
    path: 'area-financeira/faturacao/tabelas/moedas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemMoedasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Moedas',
  },
  {
    path: 'area-financeira/faturacao/tabelas/pagamentos/condicoes-pagamento',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemCondicoesPagamentoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Condições de Pagamento',
  },
  {
    path: 'area-financeira/faturacao/tabelas/pagamentos/modos-pagamento',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemModosPagamentoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Modos de Pagamento',
  },
  {
    path: 'area-financeira/faturacao/tabelas/servicos/servicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemServicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Serviços',
  },
  {
    path: 'area-financeira/faturacao/tabelas/servicos/subsistemas-servicos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemSubsistemasServicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Subsistemas de Serviços',
  },
  {
    path: 'area-financeira/faturacao/tabelas/servicos/tipos-servico',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemTiposServicoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Tipos de Serviço',
  },
  {
    path: 'area-financeira/faturacao/tabelas/zonas/zonas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemZonasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Zonas',
  },
  {
    path: 'area-financeira/faturacao/tabelas/zonas/zonas-fiscais',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemZonasFiscaisPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Zonas Fiscais',
  },
  {
    path: 'area-financeira/faturacao/emails',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.emails.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Emails' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Emails',
  },
  {
    path: 'area-financeira/faturacao/referencias-multibanco',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.referenciasMultibanco.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Referências Multibanco' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Referências Multibanco',
  },
  {
    path: 'area-financeira/faturacao/tabelas/artigos/artigos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemArtigosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Artigos',
  },
  {
    path: 'area-financeira/faturacao/tabelas/artigos/artigos/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ArtigoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Novo artigo',
  },
  {
    path: 'area-financeira/faturacao/tabelas/artigos/artigos/:id/editar',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ArtigoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Editar artigo',
  },
  {
    path: 'area-financeira/faturacao/tabelas/artigos/artigos/:id/ver',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ArtigoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Artigo',
  },
  {
    path: 'area-financeira/faturacao/tabelas/artigos/armazens',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemArmazensPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Armazéns',
  },
  {
    path: 'area-financeira/faturacao/tabelas/artigos/unidades',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemUnidadesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Unidades',
  },
  {
    path: 'area-financeira/faturacao/tabelas/artigos/subsistemas-artigos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemSubsistemasArtigosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Subsistemas de Artigos',
  },
  {
    path: 'area-financeira/faturacao/tabelas/familias-artigo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemFamiliasArtigoPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Famílias de Artigos',
  },
]