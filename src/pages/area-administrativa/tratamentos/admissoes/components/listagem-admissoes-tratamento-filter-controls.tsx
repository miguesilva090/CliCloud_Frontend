import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { modules } from '@/config/modules'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  type PageFilter,
} from '@/utils/page-data-utils'
import { ModoListagemAdmissaoTratamento } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

const permId = modules.areaAdministrativa.permissions.admissoes.id

type Props = {
  filters: PageFilter[]
  onFiltersChange: (filters: PageFilter[]) => void
  modo: ModoListagemAdmissaoTratamento
}

export function ListagemAdmissoesTratamentoFilterControls({
  filters,
  onFiltersChange,
  modo,
}: Props) {
  const [utSearch, setUtSearch] = useState('')
  const [fisioSearch, setFisioSearch] = useState('')
  const [debouncedUt] = useDebounce(utSearch, 300)
  const [debouncedFisio] = useDebounce(fisioSearch, 300)

  const data = filters.find((f) => f.id === 'data')?.value ?? ''
  const utenteId = filters.find((f) => f.id === 'utenteId')?.value ?? ''
  const localTratamentoId =
    filters.find((f) => f.id === 'localTratamentoId')?.value ?? ''
  const fisioterapeutaId =
    filters.find((f) => f.id === 'fisioterapeutaId')?.value ?? ''

  const utentesQuery = useQuery({
    queryKey: ['adm-trat-filtro', 'utentes', debouncedUt],
    queryFn: () => UtentesService(permId).getUtentesLight(debouncedUt),
  })

  const locaisQuery = useQuery({
    queryKey: ['adm-trat-filtro', 'locais'],
    queryFn: async () => {
      const res = await LocalTratamentoService(permId).getLocaisTratamentoLight()
      return res.info?.data ?? []
    },
  })

  const fisiosQuery = useQuery({
    queryKey: ['adm-trat-filtro', 'fisios', debouncedFisio],
    queryFn: async () => {
      const res = await TecnicoService(permId).getTecnicosPaginated({
        pageNumber: 1,
        pageSize: 30,
        filters: [
          { id: 'tipoTecnico', value: String(TIPO_TECNICO.Fisioterapeuta) },
          ...(debouncedFisio
            ? [{ id: 'nome', value: debouncedFisio }]
            : []),
        ],
      })
      return res.info?.data ?? []
    },
  })

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
    return list.map((l: { id: string; designacao?: string }) => ({
      value: l.id,
      label: l.designacao ?? '',
    }))
  }, [locaisQuery.data])

  const fisioItems = useMemo(() => {
    const list = fisiosQuery.data ?? []
    return list.map((t: { id: string; nome?: string | null }) => ({
      value: t.id,
      label: t.nome ?? t.id,
    }))
  }, [fisiosQuery.data])

  const patch = (id: string, value: string) => {
    applyFiltersIfChanged(
      filters,
      buildFiltersWithValue(filters, id, value),
      onFiltersChange
    )
  }

  const requireLocal =
    modo === ModoListagemAdmissaoTratamento.LocalTratamento

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      <div className='space-y-1'>
        <Label className='text-xs text-muted-foreground'>Data</Label>
        <Input
          type='date'
          value={data}
          onChange={(e) => patch('data', e.target.value)}
          className='h-9 bg-background'
        />
      </div>
      <div>
        <Label className='text-xs text-muted-foreground'>
          Local tratamento{requireLocal ? ' *' : ''}
        </Label>
        <AsyncCombobox
          value={localTratamentoId}
          onChange={(id) => patch('localTratamentoId', id)}
          searchValue=''
          onSearchValueChange={() => {}}
          items={localItems}
          isLoading={locaisQuery.isFetching}
          placeholder={requireLocal ? 'Seleccionar local…' : 'Todos'}
          searchPlaceholder='—'
          emptyText='Sem resultados'
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
        <Label className='text-xs text-muted-foreground'>Fisioterapeuta</Label>
        <AsyncCombobox
          value={fisioterapeutaId}
          onChange={(id) => patch('fisioterapeutaId', id)}
          searchValue={fisioSearch}
          onSearchValueChange={setFisioSearch}
          items={fisioItems}
          isLoading={fisiosQuery.isFetching}
          placeholder='Todos'
          searchPlaceholder='Pesquisar…'
          emptyText='Sem resultados'
        />
      </div>
    </div>
  )
}
