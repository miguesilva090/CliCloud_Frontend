import { useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MedicamentosInfarmedService } from '@/lib/services/prescricao/medicamentos-infarmed-service'
import type { MedicamentosListagemParams } from '@/types/dtos/prescricao/medicamentos-infarmed.dtos'

const PRESCRICAO_STALE_TIME = 5 * 60 * 1000

export const medicamentosPrescricaoQueryKey = (
  embId: string,
  patologias?: string
) => ['medicamentos-infarmed-prescricao', embId, patologias] as const

export async function fetchMedicamentoPrescricaoByEmbId(
  embId: string,
  patologias?: string
) {
  return MedicamentosInfarmedService().getPrescricaoByEmbId(embId, patologias)
}

export function useMedicamentosPrescricaoByEmbId(
  embId: string | null | undefined,
  patologias?: string
) {
  const id = embId ?? ''

  return useQuery({
    queryKey: medicamentosPrescricaoQueryKey(id, patologias),
    queryFn: () => fetchMedicamentoPrescricaoByEmbId(id, patologias),
    enabled: !!embId,
    staleTime: PRESCRICAO_STALE_TIME,
  })
}

export function usePrefetchMedicamentoPrescricao(patologias?: string) {
  const queryClient = useQueryClient()

  return useCallback(
    (embId: string) => {
      const state = queryClient.getQueryState(
        medicamentosPrescricaoQueryKey(embId, patologias)
      )

      if (state?.status === 'success' || state?.fetchStatus === 'fetching') {
        return
      }

      void queryClient.prefetchQuery({
        queryKey: medicamentosPrescricaoQueryKey(embId, patologias),
        queryFn: () => fetchMedicamentoPrescricaoByEmbId(embId, patologias),
        staleTime: PRESCRICAO_STALE_TIME,
      })
    },
    [queryClient, patologias]
  )
}

/** Prefetch das primeiras N linhas quando a listagem chega. */
export function usePrefetchPrimeirasLinhasPrescricao(
  embIds: string[],
  enabled: boolean,
  patologias?: string,
  maxItems = 2
) {
  const prefetch = usePrefetchMedicamentoPrescricao(patologias)

  useEffect(() => {
    if (!enabled || embIds.length === 0) return

    let cancelled = false

    async function run() {
      for (const embId of embIds.slice(0, maxItems)) {
        if (cancelled) break
        prefetch(embId)
        await new Promise((r) => setTimeout(r, 300))
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [embIds, enabled, maxItems, prefetch])
}

export function useMedicamentosAutocomplete(
  q: string,
  tipoReceita?: number,
  prescritivel?: boolean
) {
  const termo = q.trim()

  return useQuery({
    queryKey: ['medicamentos-infarmed-autocomplete', termo, tipoReceita, prescritivel],
    queryFn: () =>
      MedicamentosInfarmedService().autocomplete(
        termo,
        tipoReceita,
        prescritivel
      ),
    enabled: termo.length >= 3,
    staleTime: 30 * 1000,
  })
}

export function useMedicamentosListagemResumo(
  params: MedicamentosListagemParams,
  enabled = true
) {
  const nome = params.nome?.trim() ?? ''

  return useQuery({
    queryKey: ['medicamentos-infarmed-listagem-resumo', params],
    queryFn: () => MedicamentosInfarmedService().listagemResumo(params),
    enabled: enabled && nome.length >= 3,
    staleTime: 30 * 1000,
  })
}