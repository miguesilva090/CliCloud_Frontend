import { Suspense, lazy, useEffect } from 'react'
import { DashboardPage } from '@/pages/dashboard'
import { NotFound } from '@/pages/not-found'
import { Navigate, Outlet, useNavigate, useRoutes } from 'react-router-dom'
import { useNavigationStore } from '@/utils/navigation'
import { useNavigationTracking } from '@/hooks/use-navigation-tracking'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RoleRouter } from '@/components/auth/role-router'
import { utilitariosRoutes } from './base/utilitarios-routes'
import { areaComumRoutes } from './area-comum/areaComum'
import { areaClinicaRoutes } from './area-clinica/areaClinica'
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
            <Suspense>
              <Outlet />
            </Suspense>
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
