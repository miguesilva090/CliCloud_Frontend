import { useQuery } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'

import {
  ModelosRelatorioAtestadoService,
  type ModeloRelatorioAtestadoDTO,
  type CreateModeloRelatorioAtestadoRequest,
  type UpdateModeloRelatorioAtestadoRequest,
} from '@/lib/services/processo-clinico/modelos-relatorio-atestado-service'

const client = () => ModelosRelatorioAtestadoService()

export function useGetModelosRelatorioAtestado() {
  return useQuery({
    queryKey: ['modelos-relatorio-atestado'],
    queryFn: async () => {
      const res = await client().getAll()
      const info = res.info as GSResponse<ModeloRelatorioAtestadoDTO[]> | null
      return info?.data ?? []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export { useCreateModeloRelatorioAtestado, useUpdateModeloRelatorioAtestado, useDeleteModeloRelatorioAtestado } from './modelos-relatorio-atestado-mutations'
