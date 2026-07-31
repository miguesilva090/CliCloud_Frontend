import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { TratamentoService } from '@/lib/services/tratamentos/tratamento-service'
import { SessaoTratamentoService } from '@/lib/services/tratamentos/sessao-tratamento-service'

const permId = modules.areaAdministrativa.permissions.consultas.id

export const TRATAMENTO_FICHA_QUERY_KEY = ['tratamento-marcado-ficha'] as const
export const TRATAMENTO_FICHA_SESSOES_QUERY_KEY = [
  'tratamento-marcado-ficha-sessoes',
] as const

export function useGetTratamentoFicha(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: [...TRATAMENTO_FICHA_QUERY_KEY, id],
    queryFn: () => TratamentoService(permId).getById(id!),
    enabled: !!id && enabled,
  })
}

export function useGetTratamentoFichaSessoes(
  tratamentoId: string | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: [...TRATAMENTO_FICHA_SESSOES_QUERY_KEY, tratamentoId],
    queryFn: () =>
      SessaoTratamentoService(permId).getAllByTratamentoId(tratamentoId!),
    enabled: !!tratamentoId && enabled,
  })
}

export function invalidateTratamentoFichaQueries(
  queryClient: QueryClient,
  id?: string
) {
  void queryClient.invalidateQueries({
    queryKey: id
      ? [...TRATAMENTO_FICHA_QUERY_KEY, id]
      : TRATAMENTO_FICHA_QUERY_KEY,
  })
  void queryClient.invalidateQueries({
    queryKey: id
      ? [...TRATAMENTO_FICHA_SESSOES_QUERY_KEY, id]
      : TRATAMENTO_FICHA_SESSOES_QUERY_KEY,
  })
}

export function useInvalidateTratamentoFicha() {
  const queryClient = useQueryClient()
  return (id?: string) => invalidateTratamentoFichaQueries(queryClient, id)
}
