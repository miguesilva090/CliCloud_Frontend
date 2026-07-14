import { useQuery } from '@tanstack/react-query'
import { MedicoExternoService } from '@/lib/services/saude/medico-externo-service'

export const useGetMedicoExterno = (id: string) =>
  useQuery({
    queryKey: ['medico-externo', id],
    queryFn: () =>
      MedicoExternoService('medicos-externos').getMedicoExterno(id),
    enabled: !!id,
  })


export { useCreateMedicoExterno, useUpdateMedicoExterno } from './medico-externo-mutations'
