import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  useNavigationHistoryStore,
  getPageTitleFromPath,
  getModuleFromPath,
} from '@/stores/use-navigation-history-store'
import { shouldManageWindow } from '@/utils/window-utils'

/**
 * Hook to automatically track navigation history
 * Should be used in the main app component or router
 */
export function useNavigationTracking() {
  const location = useLocation()
  const { addVisitedPage } = useNavigationHistoryStore()

  useEffect(() => {
    // Skip tracking for certain paths
    const skipPaths = ['/login', '/404', '/dashboard', '/']
    if (skipPaths.includes(location.pathname)) {
      return
    }

    // Only track pages that should manage windows
    if (!shouldManageWindow(location.pathname)) {
      return
    }

    // Extract search parameters
    const searchParams = new URLSearchParams(location.search)
    const searchParamsObj: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      searchParamsObj[key] = value
    })

    // Get instanceId if present
    const instanceId = searchParams.get('instanceId') || undefined

    // Generate page title and module
    const title = getPageTitleFromPath(location.pathname)
    const module = getModuleFromPath(location.pathname)

    // Add to navigation history
    addVisitedPage({
      path: location.pathname,
      title,
      module,
      searchParams:
        Object.keys(searchParamsObj).length > 0 ? searchParamsObj : undefined,
      instanceId,
    })
  }, [location.pathname, location.search, addVisitedPage])

  return null
}

/**
 * Hook to manually track a page visit with custom title
 * Useful for pages that need custom titles
 */
export function useTrackPageVisit(
  path: string,
  title: string,
  module?: string,
  searchParams?: Record<string, string>,
  instanceId?: string
) {
  const { addVisitedPage } = useNavigationHistoryStore()

  useEffect(() => {
    addVisitedPage({
      path,
      title,
      module: module || getModuleFromPath(path),
      searchParams,
      instanceId,
    })
  }, [path, title, module, searchParams, instanceId, addVisitedPage])
}

/**
 * Hook to update page title in navigation history
 * Useful when page title changes dynamically
 */
export function useUpdatePageTitle(path: string, title: string) {
  const { updatePageTitle } = useNavigationHistoryStore()

  useEffect(() => {
    updatePageTitle(path, title)
  }, [path, title, updatePageTitle])
}
