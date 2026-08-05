import { useCallback, useMemo, useState } from 'react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import {
  TIPO_TECNICO,
  type TipoTecnicoValue,
} from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import { PlanningTecnicosToolbar } from '../components/planning-tecnicos-toolbar'
import { PlanningAgendaCalendario } from '../components/planning-agenda-calendario'
import { usePlanningSessoes } from '../queries/planning-queries'
import type { PlanningSessoesRequest } from '@/types/dtos/tratamentos/planning-tratamento.dtos'
import {
  PLANNING_TIPO_CORES,
  PLANNING_TIPO_LABELS,
} from '../utils/planning-agenda-cores'

export function PlanningGeralPage() {
  const [tipoTecnico, setTipoTecnico] = useState<TipoTecnicoValue>(
    TIPO_TECNICO.Fisioterapeuta
  )
  const [tecnicoId, setTecnicoId] = useState<string | null>(null)
  const [tecnicoNome, setTecnicoNome] = useState<string | null>(null)
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

  return (
    <>
      <PageHead title='Planning Geral | Tratamentos' />
      <DashboardPageContainer>
        <div className='space-y-4 p-4'>
          <div>
            <h1 className='text-lg font-semibold'>Planning Geral</h1>
            <p className='text-sm text-muted-foreground'>
              Ocupação por técnico (sessões do newCC).
              {tecnicoNome ? ` · ${tecnicoNome}` : ''}
            </p>
          </div>

          <PlanningTecnicosToolbar
            tipoTecnico={tipoTecnico}
            tecnicoId={tecnicoId}
            onTipoChange={setTipoTecnico}
            onTecnicoChange={(id, nome) => {
              setTecnicoId(id)
              setTecnicoNome(nome)
            }}
          />

          <div className='flex flex-wrap gap-3 text-xs'>
            {Object.entries(PLANNING_TIPO_LABELS).map(([k, label]) => (
              <span key={k} className='inline-flex items-center gap-1.5'>
                <span
                  className='inline-block h-3 w-3 rounded-sm'
                  style={{
                    backgroundColor: PLANNING_TIPO_CORES[Number(k)],
                  }}
                />
                {label}
              </span>
            ))}
          </div>

          {!tecnicoId ? (
            <p className='text-sm text-muted-foreground'>
              Selecciona um técnico para ver o calendário.
            </p>
          ) : sessoesQuery.isError ? (
            <p className='text-sm text-destructive'>
              {(sessoesQuery.error as Error)?.message ?? 'Erro ao carregar.'}
            </p>
          ) : (
            <PlanningAgendaCalendario
              eventos={sessoesQuery.data ?? []}
              onRangeChange={onRangeChange}
            />
          )}

          {tecnicoId && sessoesQuery.isFetching && (
            <p className='text-xs text-muted-foreground'>A actualizar…</p>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
