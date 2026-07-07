import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DateField } from '@/components/shared/date-field'
import { modules } from '@/config/modules'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  type PageFilter,
} from '@/utils/page-data-utils'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'

const permId = modules.areaAdministrativa.permissions.consultas.id

type Props = {
  filters: PageFilter[]
  onFiltersChange: (filters: PageFilter[]) => void
}

export function ListagemOrdemEntradaFilterControls({ filters, onFiltersChange }: Props) {
  const [medSearch, setMedSearch] = useState('')
  const [espSearch, setEspSearch] = useState('')
  const [utSearch, setUtSearch] = useState('')
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedEsp] = useDebounce(espSearch, 300)
  const [debouncedUt] = useDebounce(utSearch, 300)

  const dataDe = filters.find((f) => f.id === 'dataDe')?.value ?? getDataTrabalhoIsoDate()
  const dataAte = filters.find((f) => f.id === 'dataAte')?.value ?? getDataTrabalhoIsoDate()
  const medicoId = filters.find((f) => f.id === 'medicoId')?.value ?? ''
  const especialidadeId = filters.find((f) => f.id === 'especialidadeId')?.value ?? ''
  const utenteId = filters.find((f) => f.id === 'utenteId')?.value ?? ''

  const medicosQuery = useQuery({
    queryKey: ['oe-filtro-panel', 'medicos', debouncedMed],
    queryFn: () => MedicosService(permId).getMedicosLight(debouncedMed),
  })

  const espQuery = useQuery({
    queryKey: ['oe-filtro-panel', 'esp', debouncedEsp],
    queryFn: () => EspecialidadeService(permId).getEspecialidadesLight(debouncedEsp),
  })

  const utentesQuery = useQuery({
    queryKey: ['oe-filtro-panel', 'utentes', debouncedUt],
    queryFn: () => UtentesService(permId).getUtentesLight(debouncedUt),
  })

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }, [medicosQuery.data])

  const espItems = useMemo(() => {
    const list = espQuery.data?.info?.data ?? []
    return list.map((e) => ({ value: e.id, label: e.nome }))
  }, [espQuery.data])

  const utenteItems = useMemo(() => {
    const list = (utentesQuery.data?.info?.data ?? []) as Array<{
      id: string
      nome: string
      numeroUtente?: string
    }>
    return list.map((u) => ({
      value: u.id,
      label: [u.numeroUtente, u.nome].filter(Boolean).join(' — '),
    }))
  }, [utentesQuery.data])

  const patch = (id: string, value: string) => {
    applyFiltersIfChanged(
      filters,
      buildFiltersWithValue(filters, id, value),
      onFiltersChange
    )
  }

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
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
      <div>
        <Label className='text-xs text-muted-foreground'>Utente</Label>
        <AsyncCombobox
          value={utenteId}
          onChange={(id) => patch('utenteId', id)}
          searchValue={utSearch}
          onSearchValueChange={setUtSearch}
          items={utenteItems}
          isLoading={utentesQuery.isFetching}
          placeholder='Todos'
          searchPlaceholder='Pesquisar…'
          emptyText='Sem resultados'
        />
      </div>
      <div>
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
      <div>
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
    </div>
  )
}
