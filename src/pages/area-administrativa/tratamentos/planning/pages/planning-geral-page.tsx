import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import {
  TIPO_TECNICO,
  isTipoTecnicoValue,
  type TipoTecnicoValue,
} from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import { PlanningAgendaAcoesToolbar } from '../components/planning-agenda-acoes-toolbar'
import { PlanningTecnicosToolbar } from '../components/planning-tecnicos-toolbar'
import { PlanningAgendaCalendario } from '../components/planning-agenda-calendario'
import { PlanningAgendaLegenda } from '../components/planning-agenda-legenda'
import { usePlanningSessoes } from '../queries/planning-queries'
import type { PlanningSessoesRequest } from '@/types/dtos/tratamentos/planning-tratamento.dtos'

export function PlanningGeralPage() {
  const queryClient = useQueryClient()
  const [params] = useSearchParams()
  const tipoFromUrl = Number(params.get('tipoTecnico'))
  const tecnicoFromUrl = params.get('tecnicoId')
  const nomeFromUrl = params.get('tecnicoNome')

  const [tipoTecnico, setTipoTecnico] = useState<TipoTecnicoValue>(
    isTipoTecnicoValue(tipoFromUrl) ? tipoFromUrl : TIPO_TECNICO.Fisioterapeuta
  )
  const [tecnicoId, setTecnicoId] = useState<string | null>(tecnicoFromUrl)
  const [tecnicoNome, setTecnicoNome] = useState<string | null>(nomeFromUrl)
  const [range, setRange] = useState<{ de: string; ate: string } | null>(null)

  const request: PlanningSessoesRequest | null = useMemo(() => {
    if (!tecnicoId || !range) return null
    return {
      tecnicoId,
      tipoTecnico,
      dataDe: range.de,
      dataAte: range.ate,
    }
  }, [tecnicoId, tipoTecnico, range])

  const sessoesQuery = usePlanningSessoes(request, !!request)

  const onRangeChange = useCallback((dataDe: string, dataAte: string) => {
    setRange((prev) =>
      prev?.de === dataDe && prev?.ate === dataAte
        ? prev
        : { de: dataDe, ate: dataAte }
    )
  }, [])

  const onRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['planning-sessoes'] })
    void queryClient.invalidateQueries({ queryKey: ['planning-tecnicos'] })
  }

  return (
    <>
      <PageHead title='Planning Geral | Tratamentos' />
      <DashboardPageContainer className='!m-0 !mt-1 !rounded-none !pt-14 !md:my-0 !md:rounded-none !md:pt-14'>
        <div className='flex flex-col gap-0 overflow-hidden rounded-none border border-t-0 bg-card shadow-sm'>
          <PlanningAgendaAcoesToolbar
            tecnicoNome={tecnicoNome}
            onRefresh={onRefresh}
          />

          <PlanningTecnicosToolbar
            tipoTecnico={tipoTecnico}
            tecnicoId={tecnicoId}
            onTipoChange={setTipoTecnico}
            onTecnicoChange={(id, nome) => {
              setTecnicoId(id)
              setTecnicoNome(nome)
            }}
          />

          {!tecnicoId ? (
            <p className='px-4 py-6 text-sm text-muted-foreground'>
              Selecciona um técnico para ver o calendário.
            </p>
          ) : sessoesQuery.isError ? (
            <p className='px-4 py-6 text-sm text-destructive'>
              {(sessoesQuery.error as Error)?.message ?? 'Erro ao carregar.'}
            </p>
          ) : (
            <PlanningAgendaCalendario
              eventos={sessoesQuery.data ?? []}
              onRangeChange={onRangeChange}
              isLoading={sessoesQuery.isLoading || sessoesQuery.isFetching}
            />
          )}

          <PlanningAgendaLegenda />
        </div>
      </DashboardPageContainer>
    </>
  )
}
