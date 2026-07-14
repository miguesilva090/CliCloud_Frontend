import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { modules } from '@/config/modules'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { PrioridadeService } from '@/lib/services/prioridades/prioridade-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { EstadoListaEsperaService } from '@/lib/services/estados-lista-espera/estado-lista-espera-service'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  type PageFilter,
} from '@/utils/page-data-utils'

const permId = modules.areaAdministrativa.permissions.listaEsperaTratamentos.id

type Props = {
  filters: PageFilter[]
  onFiltersChange: (filters: PageFilter[]) => void
}

export function ListaEsperaTratamentoFilterControls({ filters, onFiltersChange }: Props) {
  const [medSearch, setMedSearch] = useState('')
  const [utSearch, setUtSearch] = useState('')
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedUt] = useDebounce(utSearch, 300)

  const medicoId = filters.find((f) => f.id === 'medicoId')?.value ?? ''
  const prioridadeId = filters.find((f) => f.id === 'prioridadeId')?.value ?? ''
  const utenteId = filters.find((f) => f.id === 'utenteId')?.value ?? ''
  const localTratamentoId = filters.find((f) => f.id === 'localTratamentoId')?.value ?? ''
  const estadoListaEsperaId = filters.find((f) => f.id === 'estadoListaEsperaId')?.value ?? ''
  const historico = filters.find((f) => f.id === 'historico')?.value === '1'

  const medicosQuery = useQuery({
    queryKey: ['let-filtro-panel', 'medicos', debouncedMed],
    queryFn: () => MedicosService(permId).getMedicosLight(debouncedMed),
  })

  const prioridadesQuery = useQuery({
    queryKey: ['let-filtro-panel', 'prioridades'],
    queryFn: async () => {
      const res = await PrioridadeService(permId).getPrioridadesLight()
      return res.info?.data ?? []
    },
  })

  const utentesQuery = useQuery({
    queryKey: ['let-filtro-panel', 'utentes', debouncedUt],
    queryFn: () => UtentesService(permId).getUtentesLight(debouncedUt),
  })

  const locaisQuery = useQuery({
    queryKey: ['let-filtro-panel', 'locais'],
    queryFn: async () => {
      const res = await LocalTratamentoService(permId).getLocaisTratamentoLight()
      return res.info?.data ?? []
    },
  })

  const estadosQuery = useQuery({
    queryKey: ['let-filtro-panel', 'estados-le'],
    queryFn: async () => {
      const res = await EstadoListaEsperaService(permId).getEstadosListaEsperaLight()
      return res.info?.data ?? []
    },
  })

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }, [medicosQuery.data])

  const prioridadeItems = useMemo(() => {
    const list = prioridadesQuery.data ?? []
    return list.map((p) => ({ value: p.id, label: p.descricao ?? '' }))
  }, [prioridadesQuery.data])

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

  const localItems = useMemo(() => {
    const list = locaisQuery.data ?? []
    return list.map((l) => ({ value: l.id, label: l.designacao ?? '' }))
  }, [locaisQuery.data])

  const estadoItems = useMemo(() => {
    const list = estadosQuery.data ?? []
    return list.map((e) => ({ value: e.id, label: e.descricao ?? '' }))
  }, [estadosQuery.data])

  const patch = (id: string, value: string) => {
    applyFiltersIfChanged(
      filters,
      buildFiltersWithValue(filters, id, value),
      onFiltersChange
    )
  }

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      <div className='flex items-center gap-2 sm:col-span-2 lg:col-span-3'>
        <Checkbox
          id='let-historico'
          checked={historico}
          onCheckedChange={(checked) => patch('historico', checked ? '1' : '0')}
        />
        <Label htmlFor='let-historico' className='text-sm font-normal'>
          Mostrar histórico
        </Label>
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
        <Label className='text-xs text-muted-foreground'>Prioridade</Label>
        <AsyncCombobox
          value={prioridadeId}
          onChange={(id) => patch('prioridadeId', id)}
          searchValue=''
          onSearchValueChange={() => {}}
          items={prioridadeItems}
          isLoading={prioridadesQuery.isFetching}
          placeholder='Todas'
          searchPlaceholder='—'
          emptyText='Sem resultados'
        />
      </div>
      <div>
        <Label className='text-xs text-muted-foreground'>Local tratamento</Label>
        <AsyncCombobox
          value={localTratamentoId}
          onChange={(id) => patch('localTratamentoId', id)}
          searchValue=''
          onSearchValueChange={() => {}}
          items={localItems}
          isLoading={locaisQuery.isFetching}
          placeholder='Todos'
          searchPlaceholder='—'
          emptyText='Sem resultados'
        />
      </div>
      <div>
        <Label className='text-xs text-muted-foreground'>Estado</Label>
        <AsyncCombobox
          value={estadoListaEsperaId}
          onChange={(id) => patch('estadoListaEsperaId', id)}
          searchValue=''
          onSearchValueChange={() => {}}
          items={estadoItems}
          isLoading={estadosQuery.isFetching}
          placeholder='Todos'
          searchPlaceholder='—'
          emptyText='Sem resultados'
        />
      </div>
    </div>
  )
}
