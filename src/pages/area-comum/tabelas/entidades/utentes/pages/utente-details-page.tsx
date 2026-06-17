import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { entityRoutes } from '@/config/entity-routes'

export function UtenteDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ?? ''
  const [searchParams] = useSearchParams()

  if (!id) return null

  // Mesmo fluxo de "ver" → formulário em modo leitura, mas preservando instanceId (e outros)
  // para o WindowManager não criar uma segunda tab ao mudar de /utentes/:id para .../editar.
  const next = new URLSearchParams(searchParams)
  next.set('mode', 'view')

  return (
    <Navigate
      to={`${entityRoutes.utentes.editar(id)}?${next.toString()}`}
      replace
    />
  )
}
