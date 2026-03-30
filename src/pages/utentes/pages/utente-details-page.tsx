import { Navigate, useParams, useSearchParams } from 'react-router-dom'

export function UtenteDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ?? ''
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')

  if (!id) return null

  // Quando se faz "ver utente", redireciona para o formulário de edição em modo só de leitura
  const suffix = from ? `?mode=view&from=${encodeURIComponent(from)}` : '?mode=view'
  return <Navigate to={`/utentes/${id}/editar${suffix}`} replace />
}

