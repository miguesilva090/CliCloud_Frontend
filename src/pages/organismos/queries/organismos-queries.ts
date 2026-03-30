import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateOrganismoRequest,
  UpdateOrganismoRequest,
} from '@/types/dtos/saude/organismos.dtos'
import { toast } from '@/utils/toast-utils'

export const useGetOrganismo = (id: string) =>
  useQuery({
    queryKey: ['organismo', id],
    queryFn: () => OrganismoService('organismos').getOrganismo(id),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  })

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/organismos'

export const useCreateOrganismo = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateOrganismoRequest) =>
      OrganismoService('organismos').createOrganismo(payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number; data?: string }
      if (info?.status === ResponseStatus.Success && info?.data) {
        toast.success('Organismo criado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['organismos-paginated'] })
        navigate(LISTAGEM_PATH)
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          'Falha ao criar organismo'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Create organismo failed:', error)
      toast.error('Falha ao criar organismo')
    },
  })
}

export const useUpdateOrganismo = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateOrganismoRequest) =>
      OrganismoService('organismos').updateOrganismo(id, payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Organismo atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['organismo', id] })
        await queryClient.invalidateQueries({ queryKey: ['organismos-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          'Falha ao atualizar organismo'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Update organismo failed:', error)
      toast.error('Falha ao atualizar organismo')
    },
  })
}
