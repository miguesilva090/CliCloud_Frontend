import { useQuery } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'
import { CREDENCIAIS_SNS_PERM_ID } from './listagem-credenciais-sns-queries'

export function useCredenciaisSnsOrganismoDetail(organismoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['credenciais-sns', 'organismo', organismoId],
    queryFn: () => OrganismoService(CREDENCIAIS_SNS_PERM_ID).getOrganismo(organismoId),
    enabled: enabled && organismoId.length > 0,
    staleTime: 60_000,
  })
}

export function useCredenciaisSnsTiposServico(enabled: boolean) {
  return useQuery({
    queryKey: ['credenciais-sns', 'tipos-servico', 'light'],
    queryFn: async () => {
      const res = await TipoServicoService(CREDENCIAIS_SNS_PERM_ID).getTipoServicoLight('')
      if (res.info?.status !== ResponseStatus.Success) return []
      return res.info.data ?? []
    },
    enabled,
    staleTime: 5 * 60_000,
  })
}
