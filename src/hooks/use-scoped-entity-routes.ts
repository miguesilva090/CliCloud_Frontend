import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getEntityRoutesForPathname,
  type EntityRoutesMap,
} from '@/config/entity-routes'

export function useScopedEntityRoutes(): EntityRoutesMap {
  const { pathname } = useLocation()
  return useMemo(() => getEntityRoutesForPathname(pathname), [pathname])
}
