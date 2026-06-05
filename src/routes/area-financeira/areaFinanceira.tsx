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
const ListagemFaturacaoPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/pages/listagem-faturacao-page').then(
    (m) => ({ default: m.ListagemFaturacaoPage }),
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

export const areaFinanceiraRoutes = [
  {
    path: 'area-financeira',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.faturacao.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraHomePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Área Financeira',
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
    manageWindow: true,
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
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.credenciaisSns.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Credenciais S.N.S.' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Credenciais S.N.S.',
  },
  {
    path: 'area-financeira/faturacao/adse',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='ADSE' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'ADSE',
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
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.entidades.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Entidades' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Entidades',
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
]