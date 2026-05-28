import { Suspense, lazy, useEffect } from 'react'
import { DashboardPage } from '@/pages/dashboard'
import { NotFound } from '@/pages/not-found'
import {
  Navigate,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
  useRoutes,
} from 'react-router-dom'
import { useBrowserPathSearch } from '@/hooks/use-browser-path-search'
import { getWindowShellResetFromState } from '@/utils/window-utils'
import { useNavigationStore } from '@/utils/navigation'
import { useNavigationTracking } from '@/hooks/use-navigation-tracking'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RoleRouter } from '@/components/auth/role-router'
import { utilitariosRoutes } from './base/utilitarios-routes'
import { areaComumRoutes } from './area-comum/areaComum'
import { areaClinicaRoutes } from './area-clinica/areaClinica'
import { reportsRoutes } from './reports/reports-routes'
import { areaAdministrativaRoutes } from './area-administrativa/areaAdministrativa'
import { areaFinanceiraRoutes } from './area-financeira/areaFinanceira'

const ReportDesignerPage = lazy(() =>
  import('@/pages/reports/report-designer/report-designer-page').then((m) => ({
    default: m.ReportDesignerPage,
  }))
)

const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
)

const SignInPage = lazy(() => import('@/pages/auth/signin'))

/**
 * Sem `key` estável no Suspense/Outlet, rotas `lazy()` podem manter a árvore da página anterior
 * (ex.: Subsistemas) visível após `navigate` para Nova admissão — URL correcta, ecrã preso.
 */
function KeyedLayoutOutlet() {
  const location = useLocation()
  const browserPathSearch = useBrowserPathSearch()
  const routerPathSearch = `${location.pathname}${location.search}`

  /** Browser (tab/history) à frente do Router — alinhar com SPA, sem reload. */
  if (browserPathSearch && browserPathSearch !== routerPathSearch) {
    return <Navigate to={browserPathSearch} replace />
  }

  const shellReset = getWindowShellResetFromState(location.state)
  const suspenseKey = `${routerPathSearch}-${location.key}${
    shellReset ? `-${shellReset}` : ''
  }`

  return (
    <Suspense
      key={suspenseKey}
      fallback={
        <div className='flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground'>
          A carregar…
        </div>
      }
    >
      <Outlet />
    </Suspense>
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
          <DashboardLayout>
            <KeyedLayoutOutlet />
          </DashboardLayout>
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
        ...utilitariosRoutes,
        ...areaComumRoutes,
        ...areaClinicaRoutes,
        ...areaFinanceiraRoutes,
        ...areaAdministrativaRoutes,
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
