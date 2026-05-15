import { useLocation } from 'react-router-dom'

export function useScopedFuncionalidadeId(
  areaComumPermissionId: string,
  areaAdministrativaPermissionId: string
) {
  const { pathname } = useLocation()

  if (pathname.startsWith('/area-administrativa')) {
    return areaAdministrativaPermissionId
  }

  return areaComumPermissionId
}
