import { useQuery } from '@tanstack/react-query'
import { OrganismoService } from '@/lib/services/saude/organismo-service'

export const useGetOrganismo = (id: string) =>
  useQuery({
    queryKey: ['organismo', id],
    queryFn: () => OrganismoService('organismos').getOrganismo(id),
    enabled: !!id,
  })

export { useCreateOrganismo, useUpdateOrganismo } from './organismos-mutations'
