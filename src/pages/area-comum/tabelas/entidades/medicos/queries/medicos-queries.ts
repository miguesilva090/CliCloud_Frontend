import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import type { MedicoTableFilterRequest } from '@/types/dtos/saude/medicos.dtos'

export const useGetMedico = (id: string) =>
  useQuery({
    queryKey: ['medico', id],
    queryFn: () => MedicosService('medicos').getMedico(id),
    enabled: !!id,
  })

/** Colunas que o backend ordena sobre `Medico`; ids do TanStack devem coincidir com propriedades da entidade (ex.: nome). */
export const MEDICO_LIST_ALLOWED_SORT_IDS = new Set(['nome'])

export function sanitizeMedicoListSorting(
  sorting: Array<{ id: string; desc: boolean }> | null | undefined
): Array<{ id: string; desc: boolean }> | undefined {
  if (sorting == null || sorting.length === 0) return undefined
  const ok = sorting.filter((s) => MEDICO_LIST_ALLOWED_SORT_IDS.has(s.id))
  return ok.length > 0 ? ok : undefined
}

export const useGetMedicosPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  const params: MedicoTableFilterRequest = {
    pageNumber,
    pageSize: pageLimit,
    sorting: sanitizeMedicoListSorting(sorting),
    filters: (filters ?? []).filter((f) => f.value),
  }

  return useQuery({
    queryKey: ['medicos-paginated', params],
    queryFn: () => MedicosService('medicos').getMedicosPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export const usePrefetchAdjacentMedicos = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const baseParams: Pick<MedicoTableFilterRequest, 'pageSize' | 'filters'> = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: MedicoTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['medicos-paginated', params],
        queryFn: () => MedicosService('medicos').getMedicosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: MedicoTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['medicos-paginated', params],
      queryFn: () => MedicosService('medicos').getMedicosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

const svc = () => MedicosService('medicos')

export const useGetHorarioMedicoByMedicoId = (medicoId: string) =>
  useQuery({
    queryKey: ['horario-medico', medicoId],
    queryFn: () => svc().getHorarioMedicoByMedicoId(medicoId),
    enabled: !!medicoId,
    refetchOnMount: 'always',
  })

export const useGetHorarioMedicoDiaByHorarioMedicoId = (horarioMedicoId: string) =>
  useQuery({
    queryKey: ['horario-medico-dia', horarioMedicoId],
    queryFn: () => svc().getHorarioMedicoDiaByHorarioMedicoId(horarioMedicoId),
    enabled: !!horarioMedicoId,
    refetchOnMount: 'always',
  })

export const useGetHorarioMedicoVariavelByMedicoId = (medicoId: string) =>
  useQuery({
    queryKey: ['horario-medico-variavel', medicoId],
    queryFn: () => svc().getHorarioMedicoVariavelByMedicoId(medicoId),
    enabled: !!medicoId,
  })

export const useGetFolgasMedicoByMedicoId = (medicoId: string) =>
  useQuery({
    queryKey: ['folgas-medico', medicoId],
    queryFn: () => svc().getFolgasMedicoByMedicoId(medicoId),
    enabled: !!medicoId,
  })

export {
  useCreateMedico,
  useUpdateMedico,
  useDeleteMedico,
  useCreateHorarioMedico,
  useUpdateHorarioMedico,
  useCreateHorarioMedicoDia,
  useUpdateHorarioMedicoDia,
  useCreateHorarioMedicoVariavel,
  useUpdateHorarioMedicoVariavel,
  useDeleteHorarioMedicoVariavel,
  useCreateFolgasMedico,
  useUpdateFolgasMedico,
  useDeleteFolgasMedico,
  normalizeFieldKey,
} from './medicos-mutations'

export type { UseUpdateMedicoOptions } from './medicos-mutations'
