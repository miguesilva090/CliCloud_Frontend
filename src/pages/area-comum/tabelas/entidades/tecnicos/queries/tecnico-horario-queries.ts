import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import type {
  CreateHorarioTecnicoRequest,
  UpdateHorarioTecnicoRequest,
  CreateHorarioTecnicoDiaRequest,
  UpdateHorarioTecnicoDiaRequest,
  CreateHorarioTecnicoVariavelRequest,
  UpdateHorarioTecnicoVariavelRequest,
  CreateFolgasTecnicoRequest,
  UpdateFolgasTecnicoRequest,
} from '@/types/dtos/saude/tecnicos.dtos'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'

const svc = () => TecnicoService('tecnicos')

export const useGetHorarioTecnicoByTecnicoId = (tecnicoId: string) =>
  useQuery({
    queryKey: ['horario-tecnico', tecnicoId],
    queryFn: () => svc().getHorarioTecnicoByTecnicoId(tecnicoId),
    enabled: !!tecnicoId,
    staleTime: 30_000,
    refetchOnMount: 'always',
  })

export const useGetHorarioTecnicoDiaByHorarioTecnicoId = (
  horarioTecnicoId: string
) =>
  useQuery({
    queryKey: ['horario-tecnico-dia', horarioTecnicoId],
    queryFn: () =>
      svc().getHorarioTecnicoDiaByHorarioTecnicoId(horarioTecnicoId),
    enabled: !!horarioTecnicoId,
    staleTime: 30_000,
    refetchOnMount: 'always',
  })

export const useCreateHorarioTecnico = (tecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHorarioTecnicoRequest) =>
      svc().createHorarioTecnico(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário gravado')
        await queryClient.invalidateQueries({
          queryKey: ['horario-tecnico', tecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao gravar horário'
        )
      }
    },
    onError: () => toast.error('Falha ao gravar horário'),
  })
}

export const useUpdateHorarioTecnico = (
  tecnicoId: string,
  horarioTecnicoId: string
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateHorarioTecnicoRequest) =>
      svc().updateHorarioTecnico(horarioTecnicoId, payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário atualizado')
        await queryClient.invalidateQueries({
          queryKey: ['horario-tecnico', tecnicoId],
        })
        await queryClient.invalidateQueries({
          queryKey: ['horario-tecnico-dia', horarioTecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao atualizar horário'
        )
      }
    },
    onError: () => toast.error('Falha ao atualizar horário'),
  })
}

export const useCreateHorarioTecnicoDia = (horarioTecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHorarioTecnicoDiaRequest) =>
      svc().createHorarioTecnicoDia(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        await queryClient.invalidateQueries({
          queryKey: ['horario-tecnico-dia', horarioTecnicoId],
        })
      }
    },
  })
}

export const useUpdateHorarioTecnicoDia = (horarioTecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateHorarioTecnicoDiaRequest
    }) => svc().updateHorarioTecnicoDia(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['horario-tecnico-dia', horarioTecnicoId],
      })
    },
  })
}

// Horário Variável

export const useGetHorarioTecnicoVariavelByTecnicoId = (tecnicoId: string) =>
  useQuery({
    queryKey: ['horario-tecnico-variavel', tecnicoId],
    queryFn: () => svc().getHorarioTecnicoVariavelByTecnicoId(tecnicoId),
    enabled: !!tecnicoId,
    staleTime: 30_000,
  })

export const useCreateHorarioTecnicoVariavel = (tecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHorarioTecnicoVariavelRequest) =>
      svc().createHorarioTecnicoVariavel(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário variável gravado')
        await queryClient.invalidateQueries({
          queryKey: ['horario-tecnico-variavel', tecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao gravar horário variável'
        )
      }
    },
    onError: () => toast.error('Falha ao gravar horário variável'),
  })
}

export const useUpdateHorarioTecnicoVariavel = (tecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateHorarioTecnicoVariavelRequest
    }) => svc().updateHorarioTecnicoVariavel(id, payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário variável atualizado')
        await queryClient.invalidateQueries({
          queryKey: ['horario-tecnico-variavel', tecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao atualizar horário variável'
        )
      }
    },
    onError: () => toast.error('Falha ao atualizar horário variável'),
  })
}

export const useDeleteHorarioTecnicoVariavel = (tecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc().deleteHorarioTecnicoVariavel(id),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário variável removido')
        await queryClient.invalidateQueries({
          queryKey: ['horario-tecnico-variavel', tecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao remover horário variável'
        )
      }
    },
    onError: () => toast.error('Falha ao remover horário variável'),
  })
}

// Férias / Folgas

export const useGetFolgasTecnicoByTecnicoId = (tecnicoId: string) =>
  useQuery({
    queryKey: ['folgas-tecnico', tecnicoId],
    queryFn: () => svc().getFolgasTecnicoByTecnicoId(tecnicoId),
    enabled: !!tecnicoId,
    staleTime: 30_000,
  })

export const useCreateFolgasTecnico = (tecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFolgasTecnicoRequest) =>
      svc().createFolgasTecnico(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Férias gravadas')
        await queryClient.invalidateQueries({
          queryKey: ['folgas-tecnico', tecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao gravar férias'
        )
      }
    },
    onError: () => toast.error('Falha ao gravar férias'),
  })
}

export const useUpdateFolgasTecnico = (tecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateFolgasTecnicoRequest
    }) => svc().updateFolgasTecnico(id, payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Férias atualizadas')
        await queryClient.invalidateQueries({
          queryKey: ['folgas-tecnico', tecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao atualizar férias'
        )
      }
    },
    onError: () => toast.error('Falha ao atualizar férias'),
  })
}

export const useDeleteFolgasTecnico = (tecnicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc().deleteFolgasTecnico(id),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Férias removidas')
        await queryClient.invalidateQueries({
          queryKey: ['folgas-tecnico', tecnicoId],
        })
      } else {
        toast.error(
          Object.values(response.info?.messages || {})?.[0]?.[0] ||
            'Falha ao remover férias'
        )
      }
    },
    onError: () => toast.error('Falha ao remover férias'),
  })
}


