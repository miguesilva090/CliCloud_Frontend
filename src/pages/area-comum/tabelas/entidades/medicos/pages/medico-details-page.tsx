import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { getEntityRoutesForPathname } from '@/config/entity-routes'

export function MedicoDetailsPage() {
  const params = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const id = params.id ?? ''
  const [searchParams] = useSearchParams()

  if (!id) return null

  // Mesmo fluxo que utentes: "ver" → /editar em modo leitura, preservando instanceId (e outros)
  // para o WindowManager não criar uma segunda tab ao mudar de /medicos/:id para .../editar.
  const next = new URLSearchParams(searchParams)
  next.set('mode', 'view')

  return (
    <Navigate
      to={`${getEntityRoutesForPathname(pathname).medicos.editar(id)}?${next.toString()}`}
      replace
    />
  )
}
