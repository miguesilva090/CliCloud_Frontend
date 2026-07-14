import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateAtestadoRequest } from '@/types/dtos/saude/atestados.dtos'
import { ResponseStatus } from '@/types/api/responses'
import { AtestadosService } from '@/lib/services/saude/atestados-service'
import { toast } from '@/utils/toast-utils'
import { invalidateQueriesGlobally } from '@/utils/query-sync'

export function useCreateAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAtestadoRequest) =>
      AtestadosService('saude').createAtestado(payload),
    onSuccess: (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Atestado criado com sucesso')
        invalidateQueriesGlobally(queryClient, [['atestados-paginated']])
        return
      }
      const firstError =
        info.messages?.['$']?.[0] ||
        Object.values(info.messages || {})?.[0]?.[0] ||
        'Falha ao criar atestado'
      toast.error(firstError)
    },
    onError: () => {
      toast.error('Falha ao criar atestado')
    },
  })
}

export function useReenviarAtestadoOffline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AtestadosService('saude').reenviarAtestadoOffline(id),
    onSuccess: (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Atestado reenviado com sucesso.')
      } else {
        const firstError =
          info.messages?.['$']?.[0] ||
          Object.values(info.messages || {})?.[0]?.[0] ||
          'Falha ao reenviar atestado.'
        toast.error(firstError)
      }
      invalidateQueriesGlobally(queryClient, [['atestados-paginated']])
    },
    onError: () => toast.error('Falha ao reenviar atestado.'),
  })
}

export function useReenviarPendentesOffline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => AtestadosService('saude').reenviarPendentesOffline(),
    onSuccess: (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        const count = info.data ?? 0
        toast.success(`Reenvio concluído. ${count} atestado(s) enviados.`)
      } else {
        const firstError =
          info.messages?.['$']?.[0] ||
          Object.values(info.messages || {})?.[0]?.[0] ||
          'Falha ao reenviar pendentes.'
        toast.error(firstError)
      }
      invalidateQueriesGlobally(queryClient, [['atestados-paginated']])
    },
    onError: () => toast.error('Falha ao reenviar pendentes.'),
  })
}

export function useObterErroComunicacao() {
  return useMutation({
    mutationFn: (id: string) => AtestadosService('saude').obterErroComunicacao(id),
  })
}
