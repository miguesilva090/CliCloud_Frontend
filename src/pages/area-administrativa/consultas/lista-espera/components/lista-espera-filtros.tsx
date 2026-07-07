import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DateField } from '@/components/shared/date-field'
import { Label } from '@/components/ui/label'
import { modules } from '@/config/modules'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { PrioridadeService } from '@/lib/services/prioridades/prioridade-service'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  type PageFilter,
} from '@/utils/page-data-utils'

const permId = modules.areaAdministrativa.permissions.listaEsperaConsultas.id

type Props = {
  filters: PageFilter[]
  onFiltersChange: (filters: PageFilter[]) => void
}

export function ListaEsperaFiltros({ filters, onFiltersChange }: Props) {
  const [medSearch, setMedSearch] = useState('')
  const [espSearch, setEspSearch] = useState('')
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedEsp] = useDebounce(espSearch, 300)

  const medicoId = filters.find((f) => f.id === 'medicoId')?.value ?? ''
  const especialidadeId = filters.find((f) => f.id === 'especialidadeId')?.value ?? ''
  const prioridadeId = filters.find((f) => f.id === 'prioridadeId')?.value ?? ''
  const dataDe = filters.find((f) => f.id === 'dataDe')?.value ?? ''
  const dataAte = filters.find((f) => f.id === 'dataAte')?.value ?? ''

  const medicosQuery = useQuery({
    queryKey: ['le-filtro', 'medicos', debouncedMed],
    queryFn: () => MedicosService(permId).getMedicosLight(debouncedMed),
  })

  const espQuery = useQuery({
    queryKey: ['le-filtro', 'esp', debouncedEsp],
    queryFn: () => EspecialidadeService(permId).getEspecialidadesLight(debouncedEsp),
  })

  const prioridadesQuery = useQuery({
    queryKey: ['le-filtro', 'prioridades'],
    queryFn: async () => {
      const res = await PrioridadeService(permId).getPrioridadesLight()
      return res.info?.data ?? []
    },
  })

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }, [medicosQuery.data])

  const espItems = useMemo(() => {
    const list = espQuery.data?.info?.data ?? []
    return list.map((e) => ({ value: e.id, label: e.nome }))
  }, [espQuery.data])

  const patch = (id: string, value: string) => {
    applyFiltersIfChanged(
      filters,
      buildFiltersWithValue(filters, id, value),
      onFiltersChange
    )
  }

  return (
    <div className='mb-3 flex flex-wrap items-end gap-3 rounded-md border bg-muted/20 p-3'>
      <div className='min-w-[180px] flex-1'>
        <Label className='text-xs text-muted-foreground'>Médico</Label>
        <AsyncCombobox
          value={medicoId}
          onChange={(id) => patch('medicoId', id)}
          searchValue={medSearch}
          onSearchValueChange={setMedSearch}
          items={medicoItems}
          isLoading={medicosQuery.isFetching}
          placeholder='Todos'
          searchPlaceholder='Pesquisar…'
          emptyText='Sem resultados'
        />
      </div>
      <div className='min-w-[180px] flex-1'>
        <Label className='text-xs text-muted-foreground'>Especialidade</Label>
        <AsyncCombobox
          value={especialidadeId}
          onChange={(id) => patch('especialidadeId', id)}
          searchValue={espSearch}
          onSearchValueChange={setEspSearch}
          items={espItems}
          isLoading={espQuery.isFetching}
          placeholder='Todas'
          searchPlaceholder='Pesquisar…'
          emptyText='Sem resultados'
        />
      </div>
      <div className='min-w-[140px]'>
        <Label className='text-xs text-muted-foreground'>Prioridade</Label>
        <select
          className='mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm'
          value={prioridadeId || ''}
          onChange={(e) => patch('prioridadeId', e.target.value)}
        >
          <option value=''>Todas</option>
          {(prioridadesQuery.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {(p as { designacao?: string; nome?: string }).designacao ??
                (p as { nome?: string }).nome ??
                p.id}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className='text-xs text-muted-foreground'>Data de</Label>
        <DateField
          className='mt-1 w-full'
          value={dataDe}
          onChange={(v) => patch('dataDe', v)}
        />
      </div>
      <div>
        <Label className='text-xs text-muted-foreground'>Data até</Label>
        <DateField
          className='mt-1 w-full'
          value={dataAte}
          onChange={(v) => patch('dataAte', v)}
        />
      </div>
    </div>
  )
}
