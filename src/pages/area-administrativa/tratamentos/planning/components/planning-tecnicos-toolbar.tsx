import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { modules } from '@/config/modules'
import {
  TIPO_TECNICO,
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
    <div className='space-y-3 border-b pb-3'>
      <div className='flex flex-wrap gap-2'>
        {tipos.map(([value, label]) => {
          const v = Number(value) as TipoTecnicoValue
          return (
            <Button
              key={value}
              type='button'
              size='sm'
              variant={tipoTecnico === v ? 'default' : 'outline'}
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
      <Input
        className='h-8 max-w-sm'
        placeholder='Filtrar técnico…'
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      <div className='flex flex-wrap gap-1.5 max-h-28 overflow-y-auto'>
        {(tecnicosQuery.data ?? []).map(
          (t: { id: string; nome?: string | null }) => (
            <button
              key={t.id}
              type='button'
              className={cn(
                'rounded border px-2 py-1 text-xs hover:bg-muted',
                tecnicoId === t.id &&
                  'border-primary bg-primary/10 font-medium'
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
        {!tecnicosQuery.isLoading && (tecnicosQuery.data?.length ?? 0) === 0 && (
          <span className='text-xs text-muted-foreground'>
            Sem técnicos para este tipo.
          </span>
        )}
      </div>
    </div>
  )
}
