import { useQuery } from '@tanstack/react-query'
import { ClinicaService } from '@/lib/services/core/clinica-service'

export const useGetClinicaCurrent = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['clinica', 'current'],
    queryFn: () => ClinicaService('tabelas').getClinicaCurrent(),
    enabled: options?.enabled ?? true,
  })

export const useGetClinica = (id: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['clinica', id],
    queryFn: () => ClinicaService('tabelas').getClinicaById(id),
    enabled: (options?.enabled ?? true) && !!id,
  })


export { useUpdateClinica, useCreateClinica, useUpdateClinicaCurrent } from './clinica-mutations'
