import { useQuery } from '@tanstack/react-query'
import { FornecedorService } from '@/lib/services/saude/fornecedor-service'

export const useGetFornecedor = (id: string) =>
  useQuery({
    queryKey: ['fornecedor', id],
    queryFn: () => FornecedorService('fornecedores').getFornecedor(id),
    enabled: !!id,
  })

export {
  useCreateFornecedor,
  useUpdateFornecedor,
  useDeleteFornecedor,
} from './fornecedor-mutations'
