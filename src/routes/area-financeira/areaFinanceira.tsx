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
        <AreaFinanceiraPlaceholderPage title='Novo Documento' />
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
        <AreaFinanceiraPlaceholderPage title='Faturação' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação',
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
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.ficheirosEletronicos.id}
        actionType={actionTypes.AuthVer}
      >
        <AreaFinanceiraPlaceholderPage title='Ficheiros Eletrónicos' />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Ficheiros Eletrónicos',
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