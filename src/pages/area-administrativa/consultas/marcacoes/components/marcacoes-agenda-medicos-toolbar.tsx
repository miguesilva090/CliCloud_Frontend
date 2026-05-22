import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { modules } from '@/config/modules'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'
import {
  MARCACOES_AGENDA_TEAL,
  MARCACOES_AGENDA_TEAL_ACTIVE,
} from '../utils/marcacoes-agenda-cores'

const permId = modules.areaAdministrativa.permissions.consultas.id

type Props = {
  criteria: MarcacoesListCriteria
  onChange: (next: MarcacoesListCriteria) => void
}

/** Legado: uma linha de especialidade + botões de médico (sem dropdown duplicado). */
export function MarcacoesAgendaMedicosToolbar({ criteria, onChange }: Props) {
  const [espSearch, setEspSearch] = useState('')
  const [debouncedEsp] = useDebounce(espSearch, 300)

  const espQuery = useQuery({
    queryKey: ['marcacoes-agenda', 'especialidades', debouncedEsp],
    queryFn: () => EspecialidadeService(permId).getEspecialidadesLight(debouncedEsp),
  })

  const medicosQuery = useQuery({
    queryKey: ['marcacoes-agenda', 'medicos-todos'],
    queryFn: () => MedicosService(permId).getMedicosLight(''),
    enabled: !!criteria.especialidadeId,
  })

  const espItems = useMemo(() => {
    const list = espQuery.data?.info?.data ?? []
    return list.map((e) => ({ value: e.id, label: e.nome }))
  }, [espQuery.data])

  const medicos = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{
      id: string
      nome: string
      especialidadeId?: string | null
    }>
    if (!criteria.especialidadeId) return []
    return list
      .filter((m) => m.especialidadeId === criteria.especialidadeId)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
  }, [medicosQuery.data, criteria.especialidadeId])

  const patch = (partial: Partial<MarcacoesListCriteria>) => onChange({ ...criteria, ...partial })

  return (
    <div className='flex flex-col gap-2 border-b border-border/40 bg-white px-3 py-2.5 sm:flex-row sm:items-center'>
      <div className='flex w-full shrink-0 flex-col gap-1 sm:w-72'>
        <Label className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
          Especialidade
        </Label>
        <AsyncCombobox
          value={criteria.especialidadeId}
          onChange={(id) => {
            const label = espItems.find((i) => i.value === id)?.label ?? ''
            patch({
              especialidadeId: id,
              especialidadeLabel: label,
              medicoId: '',
              medicoLabel: '',
            })
          }}
          searchValue={espSearch}
          onSearchValueChange={setEspSearch}
          items={espItems}
          isLoading={espQuery.isFetching}
          placeholder='Selecione…'
          searchPlaceholder='Pesquisar…'
          emptyText='Sem resultados'
        />
      </div>

      {criteria.especialidadeId ? (
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <Label className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
            Médico
          </Label>
          <div className='flex flex-wrap gap-1'>
            {medicos.length === 0 ? (
              <span className='text-sm text-muted-foreground'>Sem médicos nesta especialidade.</span>
            ) : (
              medicos.map((m) => {
                const active = criteria.medicoId === m.id
                return (
                  <Button
                    key={m.id}
                    type='button'
                    size='sm'
                    variant={active ? 'default' : 'secondary'}
                    className={cn(
                      'h-8 max-w-[200px] truncate rounded border-0 px-2.5 text-xs font-semibold text-white shadow-sm',
                      active ? 'hover:opacity-95' : 'opacity-90 hover:opacity-100'
                    )}
                    style={{
                      backgroundColor: active
                        ? MARCACOES_AGENDA_TEAL_ACTIVE
                        : MARCACOES_AGENDA_TEAL,
                    }}
                    title={m.nome}
                    onClick={() => patch({ medicoId: m.id, medicoLabel: m.nome })}
                  >
                    {m.nome}
                  </Button>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <p className='flex flex-1 items-end pb-1 text-sm text-muted-foreground sm:pb-2'>
          Selecione a especialidade para carregar os médicos.
        </p>
      )}
    </div>
  )
}
