import { useQuery } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import type { CondicaoPagamentoLightDTO } from '@/types/dtos/pagamentos/condicao-pagamento.dtos'
import type { ModoPagamentoLightDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
import { CondicaoPagamentoService } from './condicao-pagamento-service'
import { ModoPagamentoService } from './modo-pagamento-service'

export function formatModoPagamentoOptionLabel(m: ModoPagamentoLightDTO): string {
  return m.autocompleteLabel?.trim()
    ? m.autocompleteLabel
    : m.abreviatura?.trim()
      ? `${m.descricao} (${m.abreviatura})`
      : m.descricao
}

export function useCondicoesPagamentoLight(
  idFuncionalidade = '',
  keyword = '',
) {
  return useQuery({
    queryKey: ['condicoes-pagamento-light', idFuncionalidade, keyword],
    queryFn: async () => {
      const res =
        await CondicaoPagamentoService(idFuncionalidade).getCondicoesPagamentoLight(
          keyword,
        )
      if (res.info?.status !== ResponseStatus.Success) return []
      return (res.info.data ?? []) as CondicaoPagamentoLightDTO[]
    },
    staleTime: 120_000,
  })
}

export function useModosPagamentoLight(
  idFuncionalidade = '',
  keyword = '',
  apenasAtivos = true,
) {
  return useQuery({
    queryKey: [
      'modos-pagamento-light',
      idFuncionalidade,
      keyword,
      apenasAtivos,
    ],
    queryFn: async () => {
      const res = await ModoPagamentoService(idFuncionalidade).getModosPagamentoLight(
        keyword,
        apenasAtivos,
      )
      if (res.info?.status !== ResponseStatus.Success) return []
      return (res.info.data ?? []) as ModoPagamentoLightDTO[]
    },
    staleTime: 120_000,
  })
}
