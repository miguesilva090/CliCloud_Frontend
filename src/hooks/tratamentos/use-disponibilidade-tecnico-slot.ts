import { useQuery } from '@tanstack/react-query'
import { DisponibilidadeTecnicoTratamentoService } from '@/lib/services/tratamentos/disponibilidade-tecnico-tratamento-service'
import { ResponseStatus } from '@/types/api/responses'

type Args = {
  enabled: boolean
  tecnicoId: string
  data: string
  unidadeTempo: number
  idFuncionalidade: string
  ignorarSessaoId?: string | null
}

function firstMessage(messages?: Record<string, string[]> | null): string {
  return (
    Object.values(messages ?? {})
      .flat()
      .find(Boolean) ?? ''
  )
}

export function useDisponibilidadeTecnicoSlot({
  enabled,
  tecnicoId,
  data,
  unidadeTempo,
  idFuncionalidade,
  ignorarSessaoId,
}: Args) {
  const canQuery = enabled && !!tecnicoId

  const unidadesQ = useQuery({
    queryKey: ['disp-utempo', idFuncionalidade, tecnicoId],
    enabled: canQuery,
    queryFn: async () => {
      const res = await DisponibilidadeTecnicoTratamentoService(
        idFuncionalidade
      ).getUnidadesTempo(tecnicoId)
      if (res.info?.status !== ResponseStatus.Success) {
        return { maxTratamentos: 1, unidadesTempo: [1] as number[] }
      }

      const d = res.info.data
      const unidades = d?.unidadesTempo?.length ? d.unidadesTempo : [1]
      return {
        maxTratamentos: d?.maxTratamentos ?? unidades.length,
        unidadesTempo: unidades,
      }
    },
  })

  const horasQ = useQuery({
    queryKey: [
      'disp-horas',
      idFuncionalidade,
      tecnicoId,
      data,
      unidadeTempo,
      ignorarSessaoId ?? '',
    ],
    enabled: canQuery && !!data && unidadeTempo >= 1,
    queryFn: async () => {
      const res = await DisponibilidadeTecnicoTratamentoService(
        idFuncionalidade
      ).getHorasPossiveis({
        tecnicoId,
        data,
        unidadeTempo,
        ignorarSessaoId: ignorarSessaoId ?? null,
      })
      if (res.info?.status !== ResponseStatus.Success) {
        return {
          duracao: '',
          horas: [] as string[],
          bloqueioMotivo: firstMessage(res.info?.messages),
        }
      }
      return {
        duracao: res.info.data?.duracao ?? '',
        horas: res.info.data?.horas ?? [],
        bloqueioMotivo: '' as string,
      }
    },
  })

  return {
    unidadesTempo: unidadesQ.data?.unidadesTempo ?? [1],
    maxTratamentos: unidadesQ.data?.maxTratamentos ?? 1,
    horas: horasQ.data?.horas ?? [],
    intervaloMarcacao: horasQ.data?.duracao ?? '',
    bloqueioMotivo: horasQ.data?.bloqueioMotivo ?? '',
    isLoadingUnidades: unidadesQ.isFetching,
    isLoadingHoras: horasQ.isFetching,
  }
}
