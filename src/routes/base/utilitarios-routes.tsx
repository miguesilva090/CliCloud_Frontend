import { lazy } from 'react'
import { actionTypes } from '@/config/modules'
import { utilitarios } from '@/config/modules/base/utilitarios-module'
import { LicenseGuard } from '@/components/auth/license-guard'

// Lazy load all page components
const UtilitariosDashboardPage = lazy(() =>
  import('@/pages/base/utilitarios-dashboard').then((m) => ({
    default: m.UtilitariosDashboardPage,
  }))
)

const PaisesPage = lazy(() =>
  import('@/pages/base/paises/pages/paises-page').then((m) => ({
    default: m.PaisesPage,
  }))
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

const DistritosPage = lazy(() =>
  import('@/pages/base/distritos/pages/distritos-page').then((m) => ({
    default: m.DistritosPage,
  }))
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

const ConcelhosPage = lazy(() =>
  import('@/pages/base/concelhos/pages/concelhos-page').then((m) => ({
    default: m.ConcelhosPage,
  }))
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

const FreguesiasPage = lazy(() =>
  import('@/pages/base/freguesias/pages/freguesias-page').then((m) => ({
    default: m.FreguesiasPage,
  }))
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

const RuasPage = lazy(() =>
  import('@/pages/base/ruas/pages/ruas-page').then((m) => ({ default: m.RuasPage }))
)
const RuasCreatePage = lazy(() =>
  import('@/pages/base/ruas/pages/ruas-create-page').then(
    (m) => ({ default: m.RuasCreatePage })
  )
)
const RuasUpdatePage = lazy(() =>
  import('@/pages/base/ruas/pages/ruas-update-page').then(
    (m) => ({ default: m.RuasUpdatePage })
  )
)

const CodigosPostaisPage = lazy(() =>
  import('@/pages/base/codigospostais/pages/codigospostais-page').then((m) => ({
    default: m.CodigosPostaisPage,
  }))
)
const CodigosPostaisCreatePage = lazy(() =>
  import(
    '@/pages/base/codigospostais/pages/codigospostais-create-page'
  ).then((m) => ({ default: m.CodigosPostaisCreatePage }))
)
const CodigosPostaisUpdatePage = lazy(() =>
  import(
    '@/pages/base/codigospostais/pages/codigospostais-update-page'
  ).then((m) => ({ default: m.CodigosPostaisUpdatePage }))
)


export const utilitariosRoutes = [
  {
    path: 'utilitarios',
    element: (
      <LicenseGuard requiredModule={utilitarios.id}>
        <UtilitariosDashboardPage />
      </LicenseGuard>
    ),
    manageWindow: false,
    windowName: utilitarios.name,
  },
  {
    path: 'utilitarios/tabelas',
    element: (
      <LicenseGuard requiredModule={utilitarios.id}>
        <div></div>
      </LicenseGuard>
    ),
    windowName: 'Tabelas',
  },
  {
    path: 'utilitarios/tabelas/geograficas',
    element: (
      <LicenseGuard requiredModule={utilitarios.id}>
        <div></div>
      </LicenseGuard>
    ),
    windowName: 'Geográficas',
  },
  {
    path: 'utilitarios/tabelas/geograficas/paises',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.paises.id}
        actionType={actionTypes.AuthVer}
      >
        <PaisesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: utilitarios.permissions.paises.name,
  },
  {
    path: 'utilitarios/tabelas/geograficas/paises/create',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.paises.id}
        actionType={actionTypes.AuthAdd}
      >
        <PaisesCreatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Criar ${utilitarios.permissions.paises.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/paises/update',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.paises.id}
        actionType={actionTypes.AuthChg}
      >
        <PaisesUpdatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Atualizar ${utilitarios.permissions.paises.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/distritos',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.distritos.id}
        actionType={actionTypes.AuthVer}
      >
        <DistritosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: utilitarios.permissions.distritos.name,
  },
  {
    path: 'utilitarios/tabelas/geograficas/distritos/create',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.distritos.id}
        actionType={actionTypes.AuthAdd}
      >
        <DistritosCreatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Criar ${utilitarios.permissions.distritos.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/distritos/update',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.distritos.id}
        actionType={actionTypes.AuthChg}
      >
        <DistritosUpdatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Atualizar ${utilitarios.permissions.distritos.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/concelhos',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.concelhos.id}
        actionType={actionTypes.AuthVer}
      >
        <ConcelhosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: utilitarios.permissions.concelhos.name,
  },
  {
    path: 'utilitarios/tabelas/geograficas/concelhos/create',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.concelhos.id}
        actionType={actionTypes.AuthAdd}
      >
        <ConcelhosCreatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Criar ${utilitarios.permissions.concelhos.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/concelhos/update',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.concelhos.id}
        actionType={actionTypes.AuthChg}
      >
        <ConcelhosUpdatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Atualizar ${utilitarios.permissions.concelhos.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/freguesias',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.freguesias.id}
        actionType={actionTypes.AuthVer}
      >
        <FreguesiasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: utilitarios.permissions.freguesias.name,
  },
  {
    path: 'utilitarios/tabelas/geograficas/freguesias/create',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.freguesias.id}
        actionType={actionTypes.AuthAdd}
      >
        <FreguesiasCreatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Criar ${utilitarios.permissions.freguesias.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/freguesias/update',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.freguesias.id}
        actionType={actionTypes.AuthChg}
      >
        <FreguesiasUpdatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Atualizar ${utilitarios.permissions.freguesias.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/ruas',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.ruas.id}
        actionType={actionTypes.AuthVer}
      >
        <RuasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: utilitarios.permissions.ruas.name,
  },
  {
    path: 'utilitarios/tabelas/geograficas/ruas/create',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.ruas.id}
        actionType={actionTypes.AuthAdd}
      >
        <RuasCreatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Criar ${utilitarios.permissions.ruas.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/ruas/update',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.ruas.id}
        actionType={actionTypes.AuthChg}
      >
        <RuasUpdatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Atualizar ${utilitarios.permissions.ruas.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/codigospostais',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.codigospostais.id}
        actionType={actionTypes.AuthVer}
      >
        <CodigosPostaisPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: utilitarios.permissions.codigospostais.name,
  },
  {
    path: 'utilitarios/tabelas/geograficas/codigospostais/create',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.codigospostais.id}
        actionType={actionTypes.AuthAdd}
      >
        <CodigosPostaisCreatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Criar ${utilitarios.permissions.codigospostais.name}`,
  },
  {
    path: 'utilitarios/tabelas/geograficas/codigospostais/update',
    element: (
      <LicenseGuard
        requiredModule={utilitarios.id}
        requiredPermission={utilitarios.permissions.codigospostais.id}
        actionType={actionTypes.AuthChg}
      >
        <CodigosPostaisUpdatePage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: `Atualizar ${utilitarios.permissions.codigospostais.name}`,
  },
 
]
