import { useQuery } from '@tanstack/react-query'
import { EmpresaService } from '@/lib/services/saude/empresa-service'

export const useGetEmpresa = (id: string) =>
  useQuery({
    queryKey: ['empresa', id],
    queryFn: () => EmpresaService('empresas').getEmpresa(id),
    enabled: !!id,
  })

export { useCreateEmpresa, useUpdateEmpresa } from './empresa-mutations'
