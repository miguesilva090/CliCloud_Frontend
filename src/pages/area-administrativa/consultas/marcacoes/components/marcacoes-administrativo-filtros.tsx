import { useMemo, useState } from 'react'
import { format, isValid, parseISO, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { modules } from '@/config/modules'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'

const permId = modules.areaAdministrativa.permissions.consultas.id

type Props = {
  criteria: MarcacoesListCriteria
  onChange: (next: MarcacoesListCriteria) => void
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined
  const d = parseISO(value)
  return isValid(d) ? startOfDay(d) : undefined
}

function DateField({
  label,
  value,
  onSelect,
}: {
  label: string
  value: string
  onSelect: (iso: string) => void
}) {
  const selected = parseIsoDate(value)
  return (
    <div className='flex flex-col gap-1'>
      <Label className='text-xs text-muted-foreground'>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'h-9 w-[140px] justify-start text-left font-normal',
              !selected && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {selected ? format(selected, 'dd/MM/yyyy', { locale: pt }) : 'Escolher'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selected}
            onSelect={(d) => {
              if (!d) return
              onSelect(format(startOfDay(d), 'yyyy-MM-dd'))
            }}
            locale={pt}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function MarcacoesAdministrativoFiltros({ criteria, onChange }: Props) {
  const [medSearch, setMedSearch] = useState('')
  const [espSearch, setEspSearch] = useState('')
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedEsp] = useDebounce(espSearch, 300)

  const medicosQuery = useQuery({
    queryKey: ['marcacoes-filtro', 'medicos', debouncedMed],
    queryFn: () => MedicosService(permId).getMedicosLight(debouncedMed),
  })

  const espQuery = useQuery({
    queryKey: ['marcacoes-filtro', 'especialidades', debouncedEsp],
    queryFn: () => EspecialidadeService(permId).getEspecialidadesLight(debouncedEsp),
  })

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }, [medicosQuery.data])

  const espItems = useMemo(() => {
    const list = espQuery.data?.info?.data ?? []
    return list.map((e) => ({ value: e.id, label: e.nome }))
  }, [espQuery.data])

  const patch = (partial: Partial<MarcacoesListCriteria>) => onChange({ ...criteria, ...partial })

  return (
    <div className='mb-3 flex flex-wrap items-end gap-3 rounded-md border bg-muted/20 p-3'>
      <DateField
        label='Data de'
        value={criteria.dataDe}
        onSelect={(iso) => patch({ dataDe: iso })}
      />
      <DateField
        label='Data até'
        value={criteria.dataAte}
        onSelect={(iso) => patch({ dataAte: iso })}
      />
      <div className='flex min-w-[220px] flex-col gap-1'>
        <Label className='text-xs text-muted-foreground'>Especialidade</Label>
        <AsyncCombobox
          value={criteria.especialidadeId}
          onChange={(id) => {
            const label = espItems.find((i) => i.value === id)?.label ?? ''
            patch({ especialidadeId: id, especialidadeLabel: label })
          }}
          searchValue={espSearch}
          onSearchValueChange={setEspSearch}
          items={espItems}
          isLoading={espQuery.isFetching}
          placeholder='Todas'
          searchPlaceholder='Pesquisar…'
          emptyText='Sem resultados'
        />
      </div>
      <div className='flex min-w-[220px] flex-col gap-1'>
        <Label className='text-xs text-muted-foreground'>Médico</Label>
        <AsyncCombobox
          value={criteria.medicoId}
          onChange={(id) => {
            const label = medicoItems.find((i) => i.value === id)?.label ?? ''
            patch({ medicoId: id, medicoLabel: label })
          }}
          searchValue={medSearch}
          onSearchValueChange={setMedSearch}
          items={medicoItems}
          isLoading={medicosQuery.isFetching}
          placeholder='Todos'
          searchPlaceholder='Pesquisar médico…'
          emptyText='Sem resultados'
        />
      </div>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='h-9'
        onClick={() =>
          patch({
            medicoId: '',
            medicoLabel: '',
            especialidadeId: '',
            especialidadeLabel: '',
          })
        }
      >
        Limpar médico / especialidade
      </Button>
    </div>
  )
}
