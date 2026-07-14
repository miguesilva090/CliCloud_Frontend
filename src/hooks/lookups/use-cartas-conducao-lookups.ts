import { useQuery } from '@tanstack/react-query'
import { CartasConducaoService } from '@/lib/services/saude/cartas-conducao-service'

export const useCartasConducaoLight = (keyword = '') =>
  useQuery({
    queryKey: ['cartas-conducao', 'light', keyword],
    queryFn: () => CartasConducaoService('saude').getCartaConducaoLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useCartaConducaoRestricoesLight = (keyword = '') =>
  useQuery({
    queryKey: ['carta-conducao-restricoes', 'light', keyword],
    queryFn: () =>
      CartasConducaoService('saude').getCartaConducaoRestricoesLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })
