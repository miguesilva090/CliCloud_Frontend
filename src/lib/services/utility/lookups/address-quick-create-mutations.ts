import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateQueriesGlobally } from '@/utils/query-sync'
import { AddressQuickCreateService } from '@/lib/services/utility/lookups/address-quick-create-client'
import type { CreatePaisDTO } from '@/types/dtos/base/paises.dtos'
import type { CreateDistritoDTO } from '@/types/dtos/base/distritos.dtos'
import type { CreateConcelhoDTO } from '@/types/dtos/base/concelhos.dtos'
import type { CreateFreguesiaDTO } from '@/types/dtos/base/freguesias.dtos'
import type { CreateCodigoPostalDTO } from '@/types/dtos/base/codigospostais.dtos'
import type { CreateRuaDTO } from '@/types/dtos/base/ruas.dtos'

const UTILITY_QUERY_KEY = 'utility'

function invalidateUtilityLookups(queryClient: ReturnType<typeof useQueryClient>, keys: string[]) {
  invalidateQueriesGlobally(
    queryClient,
    keys.map((k) => [UTILITY_QUERY_KEY, k, 'light'])
  )
}

function getErrorMessage(info: unknown): string {
  if (info == null) return 'Falha ao criar'
  if (typeof info === 'string' && info.trim()) return info.trim()
  if (typeof info === 'object' && info !== null) {
    const o = info as Record<string, unknown>
    if (o.messages && typeof o.messages === 'object') {
      const flat = Object.values(o.messages as Record<string, string[]>).flat()
      if (flat.length) return flat.join(', ')
    }
    if (typeof o.message === 'string' && o.message.trim()) return o.message.trim()
  }
  return 'Falha ao criar'
}

const service = () => AddressQuickCreateService('utility')

export function useCreatePaisQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreatePaisDTO) => {
      const res = await service().createPais(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      invalidateUtilityLookups(queryClient, ['pais'])
    },
  })
}

export function useCreateDistritoQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateDistritoDTO) => {
      const res = await service().createDistrito(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      invalidateUtilityLookups(queryClient, ['distrito'])
    },
  })
}

export function useCreateConcelhoQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateConcelhoDTO) => {
      const res = await service().createConcelho(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      invalidateUtilityLookups(queryClient, ['concelho'])
    },
  })
}

export function useCreateFreguesiaQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateFreguesiaDTO) => {
      const res = await service().createFreguesia(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      invalidateUtilityLookups(queryClient, ['freguesia'])
    },
  })
}

export function useCreateCodigoPostalQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCodigoPostalDTO) => {
      const res = await service().createCodigoPostal(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      invalidateUtilityLookups(queryClient, ['codigo-postal'])
    },
  })
}

export function useCreateRuaQuick() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateRuaDTO) => {
      const res = await service().createRua(data)
      if (res.info?.data == null) throw new Error(getErrorMessage(res.info))
      return res.info.data as string
    },
    onSuccess: () => {
      invalidateUtilityLookups(queryClient, ['rua'])
    },
  })
}
