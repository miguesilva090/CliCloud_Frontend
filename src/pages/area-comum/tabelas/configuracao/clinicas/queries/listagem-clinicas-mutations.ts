import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { ClinicaService } from '@/lib/services/core/clinica-service'

export const useSetDefaultClinica = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: string; porDefeito: boolean }) =>
      ClinicaService('tabelas').setClinicaDefault(payload.id, payload.porDefeito),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }

      if (info?.status === ResponseStatus.Success) {
        toast.success('Por defeito atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['clinicas-paginated'] })
        await queryClient.invalidateQueries({ queryKey: ['clinica', 'current'] })
        return
      }

      const msg =
        (response.info as { messages?: Record<string, string[]> })?.messages
          ?.['$']?.[0] ?? 'Falha ao atualizar por defeito da clínica'
      toast.error(msg)
    },
    onError: () => {
      toast.error('Falha ao atualizar por defeito da clínica')
    },
  })
}

