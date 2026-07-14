import { useQuery } from '@tanstack/react-query'
import { CentroSaudeService } from '@/lib/services/saude/centro-saude-service'

export const useGetCentroSaude = (id: string) =>
  useQuery({
    queryKey: ['centro-saude', id],
    queryFn: () => CentroSaudeService('tabelas').getCentroSaude(id),
    enabled: !!id,
  })

export { useCreateCentroSaude, useUpdateCentroSaude } from './centro-saude-mutations'
