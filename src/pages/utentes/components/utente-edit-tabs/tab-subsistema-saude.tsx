import { useState, useMemo } from 'react'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import type { UtenteEditFormValues } from '@/pages/utentes/types/utente-edit-form-types'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { useOrganismosLight } from '@/lib/services/utility/entity-quick-create/entity-quick-create-queries'
import { EmpresaService } from '@/lib/services/saude/empresa-service'
import { useQuery } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import {
  SubsistemaSaudeInserirModal,
  type SubsistemaSaudeRowInsert,
} from './modals/subsistema-saude-inserir-modal'
import { fieldGap, inputClass, labelClass,buttonIconClass } from './utente-edit-tabs-constants'

export function TabSubsistemaSaude({
  form,
  utente,
}: {
  form: UseFormReturn<UtenteEditFormValues>
  utente?: UtenteDTO | undefined
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const subsistemaLinhasArray = useFieldArray({
    control: form.control,
    name: 'subsistemaLinhas',
  })
  const [modalInserir, setModalInserir] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleOpenCriarOrganismo = () => {
    // Ir para a listagem de Organismos, onde é possível adicionar/editar
    openPathInApp(
      navigate,
      addWindow,
      '/area-comum/tabelas/entidades/organismos',
      'Organismos'
    )
  }

  const [organismoQ, setOrganismoQ] = useState('')
  const [seguradoraQ, setSeguradoraQ] = useState('')
  const [empresaQ, setEmpresaQ] = useState('')
  const [organismoQD] = useDebounce(organismoQ, 250)
  const [seguradoraQD] = useDebounce(seguradoraQ, 250)
  const [empresaQD] = useDebounce(empresaQ, 250)

  const organismosQuery = useOrganismosLight(organismoQD)
  const seguradoraOrganismosQuery = useOrganismosLight(seguradoraQD)
  const empresasQuery = useQuery({
    queryKey: ['empresas-light', empresaQD],
    queryFn: () =>
      EmpresaService('empresas').getEmpresasPaginated({
        pageNumber: 1,
        pageSize: 100,
        filters: empresaQD ? [{ id: 'nome', value: empresaQD }] : undefined,
      }),
    staleTime: 5 * 60 * 1000,
  })

  const organismos = organismosQuery.data?.info?.data ?? []
  const seguradoraOrganismos = seguradoraOrganismosQuery.data?.info?.data ?? []
  const empresasData = empresasQuery.data?.info?.data ?? []

  const subsistemaLinhasValues = form.watch('subsistemaLinhas')
  const empresasComLinhas = useMemo(() => {
    const list = (empresasData as { id: string; nome?: string | null }[]).slice()
    const seen = new Set(list.map((e) => e.id))
    const linhas = subsistemaLinhasValues ?? []
    for (const row of linhas) {
      const eid = row?.empresaId
      if (eid && !seen.has(eid)) {
        seen.add(eid)
        list.push({ id: eid, nome: row?.empresaNome ?? null })
      }
    }
    return list
  }, [empresasData, subsistemaLinhasValues])

  const oId = utente?.organismoId ?? (utente as Record<string, unknown> | undefined)?.OrganismoId
  const oRef = utente?.organismo ?? (utente as Record<string, unknown> | undefined)?.organismo
  const sId = utente?.seguradoraId ?? (utente as Record<string, unknown> | undefined)?.SeguradoraId
  const sRef = utente?.seguradora ?? (utente as Record<string, unknown> | undefined)?.seguradora
  const eId = utente?.empresaId ?? (utente as Record<string, unknown> | undefined)?.EmpresaId
  const eRef = utente?.empresa ?? (utente as Record<string, unknown> | undefined)?.empresa

  const organismosComUtente = useMemo(() => {
    const list = organismos
    if (!oId) return list
    if (list.some((o: { id: string }) => o.id === oId)) return list
    const nome = (oRef as { id?: string; nome?: string | null; abreviatura?: string | null } | undefined)?.nome
    const abreviatura = (oRef as { abreviatura?: string | null } | undefined)?.abreviatura
    return [
      { id: oId, nome: nome ?? null, abreviatura: abreviatura ?? null },
      ...list,
    ]
  }, [organismos, oId, oRef])

  const seguradoraOrganismosComUtente = useMemo(() => {
    const list = seguradoraOrganismos
    if (!sId) return list
    if (list.some((o: { id: string }) => o.id === sId)) return list
    const nome = (sRef as { id?: string; nome?: string | null; abreviatura?: string | null } | undefined)?.nome
    const abreviatura = (sRef as { abreviatura?: string | null } | undefined)?.abreviatura
    return [
      { id: sId, nome: nome ?? null, abreviatura: abreviatura ?? null },
      ...list,
    ]
  }, [seguradoraOrganismos, sId, sRef])

  const empresasComUtente = useMemo(() => {
    const list = (empresasComLinhas as { id: string; nome?: string | null }[]).slice()
    if (!eId) return list
    if (list.some((e) => e.id === eId)) return list
    const nome = (eRef as { id?: string; nome?: string | null } | undefined)?.nome
    return [{ id: eId, nome: nome ?? null }, ...list]
  }, [empresasComLinhas, eId, eRef])

  type OrganismoOption = { id: string; nome?: string | null; abreviatura?: string | null }
  const organismoItems = useMemo(
    () =>
      (organismosComUtente as OrganismoOption[]).map((o) => ({
        value: o.id,
        label: o.nome ?? o.abreviatura ?? o.id,
        secondary: o.abreviatura ?? undefined,
      })),
    [organismosComUtente]
  )
  const seguradoraOrganismoItems = useMemo(
    () =>
      (seguradoraOrganismosComUtente as OrganismoOption[]).map((o) => ({
        value: o.id,
        label: o.nome ?? o.abreviatura ?? o.id,
        secondary: o.abreviatura ?? undefined,
      })),
    [seguradoraOrganismosComUtente]
  )
  const empresaItems = useMemo(
    () =>
      empresasComLinhas.map((e: { id: string; nome?: string | null }) => ({
        value: e.id,
        label: e.nome ?? e.id ?? '—',
      })),
    [empresasComLinhas]
  )
  const empresaItemsTop = useMemo(
    () =>
      (empresasComUtente as { id: string; nome?: string | null }[]).map((e) => ({
        value: e.id,
        label: e.nome ?? e.id ?? '—',
      })),
    [empresasComUtente]
  )

  const removeEntry = (index: number) => subsistemaLinhasArray.remove(index)

  const handleInserirConfirm = (row: SubsistemaSaudeRowInsert) => {
    subsistemaLinhasArray.append({
      organismoId: row.organismoId,
      designacao: row.designacao,
      numeroBeneficiario: row.numeroBeneficiario ?? '',
      sigla: row.sigla ?? '',
      nomeBeneficiario: row.nomeBeneficiario ?? '',
      dataCartao: row.dataCartao ?? '',
      numeroApolice: row.numeroApolice ?? '',
      empresaId: row.empresaId ?? null,
      empresaNome: row.empresaNome ?? '',
    })
  }

  const toggleRowSelection = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleRemover = () => {
    if (selectedRows.size === 0) {
      toast.warning('Seleciona pelo menos uma linha para remover.', 'Remover')
      return
    }
    const indices = Array.from(selectedRows).sort((a, b) => b - a)
    indices.forEach((i) => subsistemaLinhasArray.remove(i))
    setSelectedRows(new Set())
  }

  const tableRows = subsistemaLinhasArray.fields.map((field, index) => {
    const row = { id: field.id, index, ...form.getValues(`subsistemaLinhas.${index}`) }
    const empresaDisplay =
      row.empresaNome != null && row.empresaNome.trim() !== ''
        ? row.empresaNome
        : row.empresaId
          ? empresaItems.find((i) => i.value === row.empresaId)?.label
          : null
    return { ...row, empresaDisplay: empresaDisplay ?? '—' }
  })

  const fieldClass = `${inputClass} bg-background`

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4'>
        {/* Coluna 1: Organismo + Nome Beneficiário */}
        <div className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='organismoId'
            render={({ field }) => (
              <FormItem className={`${fieldGap} w-full min-w-0`}>
                <FormLabel className={labelClass}>Organismo</FormLabel>
                <div className='flex gap-1.5 w-full min-w-0'>
                  <div className='flex-1 min-w-0'>
                    <FormControl>
                      <AsyncCombobox
                        value={field.value ?? ''}
                        onChange={(v) => field.onChange(v || null)}
                        items={organismoItems}
                        isLoading={organismosQuery.isFetching}
                        placeholder='Organismo...'
                        searchPlaceholder='Procurar organismo...'
                        searchValue={organismoQ}
                        onSearchValueChange={setOrganismoQ}
                        className={fieldClass}
                      />
                    </FormControl>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className={buttonIconClass}
                    title='Criar novo organismo'
                    onClick={handleOpenCriarOrganismo}
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={`${fieldGap} w-full min-w-0`}>
            <FormLabel className={labelClass}>Nome Beneficiário</FormLabel>
            <Input placeholder='Nome Beneficiário...' className={fieldClass} />
          </div>
        </div>

        {/* Coluna 2: Seguradora + Número Beneficiário */}
        <div className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='seguradoraId'
            render={({ field }) => (
              <FormItem className={`${fieldGap} w-full min-w-0`}>
                <FormLabel className={labelClass}>Seguradora</FormLabel>
                <div className='flex gap-1.5 w-full min-w-0'>
                  <div className='flex-1 min-w-0'>
                    <FormControl>
                      <AsyncCombobox
                        value={field.value ?? ''}
                        onChange={(v) => field.onChange(v || null)}
                        items={seguradoraOrganismoItems}
                        isLoading={seguradoraOrganismosQuery.isFetching}
                        placeholder='Seguradora...'
                        searchPlaceholder='Procurar organismo...'
                        searchValue={seguradoraQ}
                        onSearchValueChange={setSeguradoraQ}
                        className={fieldClass}
                      />
                    </FormControl>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className={buttonIconClass}
                    title='Criar novo organismo'
                    onClick={handleOpenCriarOrganismo}
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={`${fieldGap} w-full min-w-0`}>
            <FormLabel className={labelClass}>Número Beneficiário</FormLabel>
            <Input placeholder='Número Beneficiário' className={fieldClass} />
          </div>
        </div>

        {/* Coluna 3: Empresa (utente) + Apólice — valor "em cima" guardado no utente; linhas têm empresa por linha */}
        <div className='flex flex-col gap-4'>
          <div className={`${fieldGap} w-full min-w-0`}>
            <FormLabel className={labelClass}>Empresa</FormLabel>
            <div className='flex gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormField
                  control={form.control}
                  name='empresaId'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AsyncCombobox
                          value={field.value ?? ''}
                          onChange={(v) => field.onChange(v || null)}
                          items={empresaItemsTop}
                          isLoading={empresasQuery.isFetching}
                          placeholder='Empresa...'
                          searchPlaceholder='Procurar empresa...'
                          searchValue={empresaQ}
                          onSearchValueChange={setEmpresaQ}
                          className={fieldClass}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
                title='Empresas'
                onClick={() =>
                openPathInApp(
                  navigate,
                  addWindow,
                  '/area-comum/tabelas/entidades/empresas',
                  'Empresas'
                )
                }
              >
                <Plus className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
          <div className={`${fieldGap} w-full min-w-0`}>
            <FormLabel className={labelClass}>Apólice</FormLabel>
            <Input placeholder='Apólice...' className={fieldClass} />
          </div>
        </div>

        {/* Coluna 4: Sigla + Data do cartão */}
        <div className='flex flex-col gap-4'>
          <div className={`${fieldGap} w-full min-w-0`}>
            <FormLabel className={labelClass}>Sigla</FormLabel>
            <Input placeholder='Sigla...' className={fieldClass} />
          </div>
          <div className={`${fieldGap} w-full min-w-0`}>
            <FormLabel className={labelClass}>Data do cartão</FormLabel>
            <Input type='date' className={fieldClass} />
          </div>
        </div>
      </div>

      <div className='flex gap-2 justify-end'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='border-emerald-500 text-emerald-600 hover:bg-emerald-500/10'
          onClick={() => setModalInserir(true)}
        >
          <Plus className='h-4 w-4 mr-2' />
          Inserir
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='border-destructive/50 text-destructive hover:bg-destructive/10'
          onClick={handleRemover}
        >
          <X className='h-4 w-4 mr-2' />
          Remover
        </Button>
      </div>

      <div className='rounded-md border overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b bg-muted/50'>
              <th className='text-left p-2 font-medium w-10'>
                <input type='checkbox' />
              </th>
              <th className='text-left p-2 font-medium'>Cód. Organismo</th>
              <th className='text-left p-2 font-medium'>Designação</th>
              <th className='text-left p-2 font-medium'>Nº Beneficiário</th>
              <th className='text-left p-2 font-medium'>Sigla</th>
              <th className='text-left p-2 font-medium'>Nome Beneficiário</th>
              <th className='text-left p-2 font-medium'>Data Cartão</th>
              <th className='text-left p-2 font-medium'>Nº Apólice</th>
              <th className='text-left p-2 font-medium'>Empresa</th>
              <th className='text-right p-2 font-medium'>Opções</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td colSpan={10} className='p-4 text-center text-muted-foreground'>
                  Não existem dados a apresentar
                </td>
              </tr>
            ) : (
              tableRows.map((row) => (
                <tr key={row.id} className='border-b'>
                  <td className='p-2'>
                    <input
                      type='checkbox'
                      checked={selectedRows.has(row.index)}
                      onChange={() => toggleRowSelection(row.index)}
                    />
                  </td>
                  <td className='p-2'>{(row.organismoId ?? '').slice(0, 8)}</td>
                  <td className='p-2'>{row.designacao ?? '—'}</td>
                  <td className='p-2'>{row.numeroBeneficiario ?? '—'}</td>
                  <td className='p-2'>{row.sigla ?? '—'}</td>
                  <td className='p-2'>{row.nomeBeneficiario ?? '—'}</td>
                  <td className='p-2'>{row.dataCartao ?? '—'}</td>
                  <td className='p-2'>{row.numeroApolice ?? '—'}</td>
                  <td className='p-2'>{row.empresaDisplay}</td>
                  <td className='p-2 text-right'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      title='Editar'
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-destructive'
                      title='Excluir'
                      onClick={() => removeEntry(row.index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SubsistemaSaudeInserirModal
        open={modalInserir}
        onOpenChange={setModalInserir}
        onConfirm={handleInserirConfirm}
      />
    </div>
  )
}
