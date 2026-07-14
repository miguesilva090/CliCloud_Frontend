import { useQuery } from '@tanstack/react-query'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'

export const useListaEsperaSubsistemasPorOrganismo = (organismoId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['let-form', 'subsistemas', organismoId],
    queryFn: () =>
      SubsistemaServicoService().getSubsistemaServicoPaginated({
        pageNumber: 1,
        pageSize: 500,
        sorting: [],
        organismoId,
      }),
    enabled: enabled && organismoId.length > 0,
    staleTime: 60_000,
  })

export const useListaEsperaServicosLight = (enabled: boolean) =>
  useQuery({
    queryKey: ['let-form', 'servicos-light'],
    queryFn: () => ServicoService().getServicoLight(''),
    enabled,
    staleTime: 5 * 60_000,
  })

export const useListaEsperaProximoIdentificador = (listPermId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['let-form', 'proximo-identificador'],
    queryFn: async () => {
      const { ListaEsperaTratamentoAdministrativoService } = await import(
        '@/lib/services/tratamentos/lista-espera-tratamento-administrativo-service'
      )
      const res = await ListaEsperaTratamentoAdministrativoService(listPermId).getProximoIdentificador()
      return res.info?.data ?? null
    },
    enabled,
    staleTime: 0,
  })
