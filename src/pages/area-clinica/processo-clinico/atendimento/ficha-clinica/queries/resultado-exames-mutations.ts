import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExameService } from '@/lib/services/exames/exame-service'

export function useUpsertResultadoExame(exameId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { linhaId: string; valor?: string | null; referencia?: string | null; obs?: string | null }) =>
      ExameService().upsertResultadoLinha(exameId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['resultados-exame-by-exame', exameId],
      })
    },
  })
}
