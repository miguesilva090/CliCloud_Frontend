import { lazy } from 'react'
import { actionTypes } from '@/config/modules'
import { reports } from '@/config/modules/reports/reports-module'
import { LicenseGuard } from '@/components/auth/license-guard'

// Lazy load report page components
const ReportDesignerPage = lazy(() =>
  import('@/pages/reports/report-designer/report-designer-page').then((m) => ({
    default: m.ReportDesignerPage,
  }))
)

const ReportViewerPage = lazy(() =>
  import('@/pages/reports/report-viewer/report-viewer-page').then((m) => ({
    default: m.ReportViewerPage,
  }))
)

const ReportsListPage = lazy(() =>
  import('@/pages/reports/reports-list/reports-list-page').then((m) => ({
    default: m.ReportsListPage,
  }))
)

export const reportsRoutes = [
  {
    path: 'reports',
    element: (
      <LicenseGuard
        requiredModule={reports.id}
        requiredPermission={reports.permissions.reportsList.id}
        actionType={actionTypes.AuthVer}
      >
        <ReportsListPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Relatórios',
  },
  {
    path: 'reports/designer',
    element: (
      <LicenseGuard
        requiredModule={reports.id}
        requiredPermission={reports.permissions.reportDesigner.id}
        actionType={actionTypes.AuthVer}
      >
        <ReportDesignerPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Report Designer',
  },
  {
    path: 'reports/viewer',
    element: (
      <LicenseGuard
        requiredModule={reports.id}
        requiredPermission={reports.permissions.reportViewer.id}
        actionType={actionTypes.AuthVer}
      >
        <ReportViewerPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Report Viewer',
  },
]
