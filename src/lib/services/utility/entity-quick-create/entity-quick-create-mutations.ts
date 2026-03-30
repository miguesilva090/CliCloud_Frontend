import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EntityQuickCreateService } from './entity-quick-create-client'
import type { CreateOrganismoRequest, CreateSeguradoraRequest } from '@/types/dtos/entity-quick-create.dtos'

function getErrorMessage(info: { messages?: Record<string, string[]> } | null): string {
  if (!info?.messages) return 'Falha ao criar'
  const flat = Object.values(info.messages).flat()
  return flat.length ? flat.join(', ') : 'Falha ao criar'
}

const service = () => EntityQuickCreateService('client')

export function useCreateOrganismoQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateOrganismoRequest) => {
      const res = await service().createOrganismo(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-quick-create', 'organismo', 'light'] })
    },
  })
}

export function useCreateSeguradoraQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSeguradoraRequest) => {
      const res = await service().createSeguradora(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-quick-create', 'seguradora', 'light'] })
    },
  })
}
