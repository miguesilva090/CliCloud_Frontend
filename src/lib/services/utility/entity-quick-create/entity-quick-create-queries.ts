import { useQuery } from '@tanstack/react-query'
import { EntityQuickCreateService } from './entity-quick-create-client'

const service = () => EntityQuickCreateService('client')

export const useOrganismosLight = (keyword: string) =>
  useQuery({
    queryKey: ['entity-quick-create', 'organismo', 'light', keyword],
    queryFn: () => service().getOrganismosLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useSeguradorasLight = (keyword: string) =>
  useQuery({
    queryKey: ['entity-quick-create', 'seguradora', 'light', keyword],
    queryFn: () => service().getSeguradorasLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })
