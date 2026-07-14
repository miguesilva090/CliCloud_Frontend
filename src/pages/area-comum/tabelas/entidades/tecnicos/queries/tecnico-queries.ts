import { useQuery } from '@tanstack/react-query'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'

export const useGetTecnico = (id: string) =>
  useQuery({
    queryKey: ['tecnico', id],
    queryFn: () => TecnicoService('tecnicos').getTecnico(id),
    enabled: !!id,
  })

export { useCreateTecnico, useUpdateTecnico } from './tecnico-mutations'
