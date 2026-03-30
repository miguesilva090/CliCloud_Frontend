import { Navigate, useParams, useSearchParams } from 'react-router-dom'

export function MedicoDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ?? ''
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')

  if (!id) return null

  const suffix = from ? `?mode=view&from=${encodeURIComponent(from)}` : '?mode=view'
  return <Navigate to={`/medicos/${id}/editar${suffix}`} replace />
}
