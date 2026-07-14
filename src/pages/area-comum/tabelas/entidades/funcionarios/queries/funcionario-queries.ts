import { useQuery } from '@tanstack/react-query'
import { FuncionarioService } from '@/lib/services/saude/funcionario-service'

export const useGetFuncionario = (id: string) =>
  useQuery({
    queryKey: ['funcionario', id],
    queryFn: () => FuncionarioService('funcionarios').getFuncionario(id),
    enabled: !!id,
  })

export { useCreateFuncionario, useUpdateFuncionario } from './funcionario-mutations'
