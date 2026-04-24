import { Navigate, useParams, useSearchParams } from 'react-router-dom'

export function MedicoDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ?? ''
  const [searchParams] = useSearchParams()

  if (!id) return null

  // Mesmo fluxo que utentes: "ver" → /editar em modo leitura, preservando instanceId (e outros)
  // para o WindowManager não criar uma segunda tab ao mudar de /medicos/:id para .../editar.
  const next = new URLSearchParams(searchParams)
  next.set('mode', 'view')

  return <Navigate to={`/medicos/${id}/editar?${next.toString()}`} replace />
}
