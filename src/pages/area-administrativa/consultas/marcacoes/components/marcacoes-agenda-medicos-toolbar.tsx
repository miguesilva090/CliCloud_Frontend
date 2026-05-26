import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Label } from '@/components/ui/label'
import { modules } from '@/config/modules'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { SalaService } from '@/lib/services/consultas/sala-service'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'

const permId = modules.areaAdministrativa.permissions.consultas.id

type Props = {
  criteria: MarcacoesListCriteria
  onChange: (next: MarcacoesListCriteria) => void
}

/** Legado: uma linha de especialidade + botões de médico (sem dropdown duplicado). */
export function MarcacoesAgendaMedicosToolbar({ criteria, onChange }: Props) {
  const [espSearch, setEspSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [salaSearch, setSalaSearch] = useState('')
  const [debouncedEsp] = useDebounce(espSearch, 300)
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedSala] = useDebounce(salaSearch, 300)

  const espQuery = useQuery({
    queryKey: ['marcacoes-agenda', 'especialidades', debouncedEsp],
    queryFn: () => EspecialidadeService(permId).getEspecialidadesLight(debouncedEsp),
  })

  const medicosQuery = useQuery({
    queryKey: ['marcacoes-agenda', 'medicos', debouncedMed],
    queryFn: () => MedicosService(permId).getMedicosLight(debouncedMed),
    enabled: !!criteria.especialidadeId,
  })

  const salasQuery = useQuery({
    queryKey: ['marcacoes-agenda', 'salas'],
    queryFn: async () => {
      const res = await SalaService(permId).getSalasPaginated({
        pageNumber: 1,
        pageSize: 300,
        sorting: [{ id: 'nome', desc: false }],
      })
      const payload = res.info?.data as { data?: SalaTableDTO[] } | SalaTableDTO[] | undefined
      if (Array.isArray(payload)) return payload
      return payload?.data ?? []
    },
  })

  const clinicaQuery = useQuery({
    queryKey: ['marcacoes-agenda', 'clinica-current'],
    queryFn: () => ClinicaService(permId).getClinicaCurrent(),
  })

  const espItems = useMemo(() => {
    const list = espQuery.data?.info?.data ?? []
    return list.map((e) => ({ value: e.id, label: e.nome }))
  }, [espQuery.data])

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{
      id: string
      nome: string
      especialidadeId?: string | null
    }>
    if (!criteria.especialidadeId) return []
    const items = list
      .filter((m) => m.especialidadeId === criteria.especialidadeId)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
      .map((m) => ({ value: m.id, label: m.nome }))

    if (
      criteria.medicoId &&
      criteria.medicoLabel &&
      !items.some((item) => item.value === criteria.medicoId)
    ) {
      items.unshift({ value: criteria.medicoId, label: criteria.medicoLabel })
    }

    return items
  }, [
    medicosQuery.data,
    criteria.especialidadeId,
    criteria.medicoId,
    criteria.medicoLabel,
  ])

  const salaItems = useMemo(() => {
    const keyword = debouncedSala.toLocaleLowerCase('pt')
    const items: Array<{ value: string; label: string; secondary?: string }> = (salasQuery.data ?? [])
      .filter((s) => !keyword || s.nome.toLocaleLowerCase('pt').includes(keyword))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
      .map((s) => ({ value: s.id, label: s.nome, secondary: String(s.numeroSala) }))

    if (
      criteria.salaId &&
      criteria.salaLabel &&
      !items.some((item) => item.value === criteria.salaId)
    ) {
      items.unshift({ value: criteria.salaId, label: criteria.salaLabel, secondary: undefined })
    }

    return items
  }, [salasQuery.data, debouncedSala, criteria.salaId, criteria.salaLabel])

  const patch = (partial: Partial<MarcacoesListCriteria>) => onChange({ ...criteria, ...partial })
  const gestaoSalasAtiva = clinicaQuery.data?.info?.data?.gestaoSalas === true

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
            setMedSearch('')
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

      {gestaoSalasAtiva ? (
        <div className='flex w-full min-w-0 flex-col gap-1 sm:max-w-md'>
          <Label className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
            Sala
          </Label>
          <AsyncCombobox
            value={criteria.salaId}
            onChange={(id) => {
              const label = salaItems.find((item) => item.value === id)?.label ?? ''
              patch({ salaId: id, salaLabel: label })
            }}
            searchValue={salaSearch}
            onSearchValueChange={setSalaSearch}
            items={salaItems}
            isLoading={salasQuery.isFetching}
            placeholder='Selecione a sala…'
            searchPlaceholder='Pesquisar sala…'
            emptyText='Sem salas'
          />
        </div>
      ) : null}

      {criteria.especialidadeId ? (
        <div className='flex w-full min-w-0 flex-col gap-1 sm:max-w-md'>
          <Label className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
            Médico
          </Label>
          <AsyncCombobox
            value={criteria.medicoId}
            onChange={(id) => {
              const label = medicoItems.find((item) => item.value === id)?.label ?? ''
              patch({ medicoId: id, medicoLabel: label })
            }}
            searchValue={medSearch}
            onSearchValueChange={setMedSearch}
            items={medicoItems}
            isLoading={medicosQuery.isFetching}
            placeholder='Selecione o médico…'
            searchPlaceholder='Pesquisar médico…'
            emptyText='Sem médicos nesta especialidade'
          />
        </div>
      ) : (
        <p className='flex flex-1 items-end pb-1 text-sm text-muted-foreground sm:pb-2'>
          Selecione a especialidade para carregar os médicos.
        </p>
      )}
    </div>
  )
}
