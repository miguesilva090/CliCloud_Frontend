import { useQuery } from '@tanstack/react-query'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'

const svc = () => TecnicoService('tecnicos')

export const useGetHorarioTecnicoByTecnicoId = (tecnicoId: string) =>
  useQuery({
    queryKey: ['horario-tecnico', tecnicoId],
    queryFn: () => svc().getHorarioTecnicoByTecnicoId(tecnicoId),
    enabled: !!tecnicoId,
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
    refetchOnMount: 'always',
  })

export const useGetHorarioTecnicoVariavelByTecnicoId = (tecnicoId: string) =>
  useQuery({
    queryKey: ['horario-tecnico-variavel', tecnicoId],
    queryFn: () => svc().getHorarioTecnicoVariavelByTecnicoId(tecnicoId),
    enabled: !!tecnicoId,
  })

export const useGetFolgasTecnicoByTecnicoId = (tecnicoId: string) =>
  useQuery({
    queryKey: ['folgas-tecnico', tecnicoId],
    queryFn: () => svc().getFolgasTecnicoByTecnicoId(tecnicoId),
    enabled: !!tecnicoId,
  })


export { useCreateHorarioTecnico, useUpdateHorarioTecnico, useCreateHorarioTecnicoDia, useUpdateHorarioTecnicoDia, useCreateHorarioTecnicoVariavel, useUpdateHorarioTecnicoVariavel, useDeleteHorarioTecnicoVariavel, useCreateFolgasTecnico, useUpdateFolgasTecnico, useDeleteFolgasTecnico } from './tecnico-horario-mutations'
