import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { modules } from '@/config/modules'
import {
  TIPO_TECNICO_LABELS,
  type TipoTecnicoValue,
} from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'

const perm = modules.areaAdministrativa.permissions.consultas.id

type Props = {
  tipoTecnico: TipoTecnicoValue
  tecnicoId: string | null
  onTipoChange: (tipo: TipoTecnicoValue) => void
  onTecnicoChange: (id: string | null, nome: string | null) => void
}

/** Filtros brancos sob a barra teal — paridade com Especialidade/Médico da Agenda. */
export function PlanningTecnicosToolbar({
  tipoTecnico,
  tecnicoId,
  onTipoChange,
  onTecnicoChange,
}: Props) {
  const [filtro, setFiltro] = useState('')

  const tecnicosQuery = useQuery({
    queryKey: ['planning-tecnicos', tipoTecnico, filtro],
    queryFn: async () => {
      const res = await TecnicoService(perm).getTecnicosPaginated({
        pageNumber: 1,
        pageSize: 40,
        filters: [
          { id: 'tipoTecnico', value: String(tipoTecnico) },
          ...(filtro.trim()
            ? [{ id: 'nome', value: filtro.trim() }]
            : []),
        ],
      })
      return res.info?.data ?? []
    },
    staleTime: 30_000,
  })

  const tipos = useMemo(
    () => Object.entries(TIPO_TECNICO_LABELS) as Array<[string, string]>,
    []
  )

  return (
    <div className='flex flex-col gap-2 border-b border-border/40 bg-white px-3 py-2.5'>
      <div className='flex flex-wrap items-end gap-3'>
        <div className='flex min-w-0 flex-col gap-1'>
          <Label className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
            Tipo técnico
          </Label>
          <div className='flex flex-wrap gap-1.5'>
            {tipos.map(([value, label]) => {
              const v = Number(value) as TipoTecnicoValue
              const active = tipoTecnico === v
              return (
                <Button
                  key={value}
                  type='button'
                  size='sm'
                  className={cn(
                    'h-8',
                    active
                      ? 'bg-[#4b8df8] text-white hover:bg-[#4b8df8]/90'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                  variant={active ? 'default' : 'outline'}
                  onClick={() => {
                    onTipoChange(v)
                    onTecnicoChange(null, null)
                  }}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </div>

        <div className='flex w-full min-w-[12rem] max-w-sm flex-col gap-1'>
          <Label className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
            Técnico
          </Label>
          <Input
            className='h-8'
            placeholder='Filtrar técnico…'
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className='flex max-h-28 flex-wrap gap-1.5 overflow-y-auto'>
        {(tecnicosQuery.data ?? []).map(
          (t: { id: string; nome?: string | null }) => (
            <button
              key={t.id}
              type='button'
              className={cn(
                'rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50',
                tecnicoId === t.id &&
                  'border-[#4b8df8] bg-[#4b8df8]/15 font-medium text-slate-900'
              )}
              onClick={() => onTecnicoChange(t.id, t.nome ?? null)}
            >
              {t.nome ?? t.id}
            </button>
          )
        )}
        {tecnicosQuery.isLoading && (
          <span className='text-xs text-muted-foreground'>A carregar…</span>
        )}
        {!tecnicosQuery.isLoading &&
          (tecnicosQuery.data?.length ?? 0) === 0 && (
            <span className='text-xs text-muted-foreground'>
              Sem técnicos para este tipo.
            </span>
          )}
      </div>
    </div>
  )
}
