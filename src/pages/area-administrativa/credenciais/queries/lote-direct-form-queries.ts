import { useQuery } from '@tanstack/react-query'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'
import { ProvenienciaUtenteService } from '@/lib/services/proveniencias-utente/proveniencia-utente-service'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'

export const useTiposServicoLight = (keyword = '', enabled = true) =>
  useQuery({
    queryKey: ['tipos-servico', 'light', keyword],
    queryFn: () => TipoServicoService().getTipoServicoLight(keyword),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useServicosLight = (keyword = '', enabled = true) => 
  useQuery({
    queryKey: ['servicos', 'light', keyword],
    queryFn: () => ServicoService().getServicoLight(keyword),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useSubsistemasServicoByOrganismo = (organismoId = '', enabled = true) =>
  useQuery({
    queryKey: ['subsistemas-servico', 'organismo', organismoId],
    queryFn: () =>
      SubsistemaServicoService().getSubsistemaServicoPaginated({
        pageNumber: 1,
        pageSize: 500,
        sorting: [],
        organismoId,
      }),
    enabled: enabled && organismoId.length > 0,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useProvenienciasUtenteLightForForm = (enabled = true) =>
  useQuery({
    queryKey: ['proveniencias-utentes', 'light', 'lote-direct-form'],
    queryFn: () => ProvenienciaUtenteService().getProvenienciasUtenteLight(),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useTiposLoteLight = (enabled = true) =>
  useQuery({
    queryKey: ['lote-direct', 'tipos-lote', 'light'],
    queryFn: () => LoteDirectService().getTiposLoteLight(),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })
