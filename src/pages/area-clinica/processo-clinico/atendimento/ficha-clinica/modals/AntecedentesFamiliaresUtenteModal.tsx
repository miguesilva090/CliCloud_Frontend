import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { DoencaService } from '@/lib/services/doencas/doenca-service'
import { GrauParentescoService } from '@/lib/services/graus-parentesco/grau-parentesco-service'
import { AntecedentesFamiliaresUtenteService } from '@/lib/services/antecedentes/antecedentes-familiares-utente-service'
import { useInvalidateAntecedentesFamiliaresUtente } from '../queries/antecedentes-familiares-utente-queries'
import { toast } from '@/utils/toast-utils'
import type {
  AntecedentesFamiliaresUtenteTableDTO,
  CreateAntecedentesFamiliaresUtenteRequest,
} from '@/types/dtos/saude/antecedentes-familiares-utente.dtos'
import type { PaginatedRequest } from '@/types/api/responses'
import type { DoencaTableDTO } from '@/types/dtos/doencas/doenca.dtos'
import type { GrauParentescoLightDTO } from '@/types/dtos/graus-parentesco/grau-parentesco.dtos'

function toDateOnlyStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

export interface AntecedentesFamiliaresUtenteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  editData?: AntecedentesFamiliaresUtenteTableDTO | null
  onSuccess?: () => void
}

export function AntecedentesFamiliaresUtenteModal({
  open,
  onOpenChange,
  utenteId,
  editData,
  onSuccess,
}: AntecedentesFamiliaresUtenteModalProps) {
  const [doencaId, setDoencaId] = useState('')
  const [doencaSearch, setDoencaSearch] = useState('')
  const [grauParentescoId, setGrauParentescoId] = useState('')
  const [grauParentescoSearch, setGrauParentescoSearch] = useState('')
  const [ano, setAno] = useState<number | ''>('')
  const [idade, setIdade] = useState<number | ''>('')
  const [data, setData] = useState<Date | undefined>()
  const [observacoes, setObservacoes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const invalidate = useInvalidateAntecedentesFamiliaresUtente()
  const isEdit = Boolean(editData?.id)

  const doencaParams: PaginatedRequest = {
    pageNumber: 1,
    pageSize: 20,
    filters: doencaSearch ? { keyword: doencaSearch } : undefined,
    sorting: [{ id: 'title', desc: false }],
  }

  const { data: doencasResponse, isLoading: isLoadingDoencas } = useQuery({
    queryKey: ['doencas-light', doencaParams, { open }],
    queryFn: () => DoencaService().getDoencasPaginated(doencaParams),
    enabled: open,
    staleTime: 60 * 1000,
  })

  const grauParentescoQuery = useQuery({
    queryKey: ['graus-parentesco-light', grauParentescoSearch, { open }],
    queryFn: () =>
      GrauParentescoService().getGrausParentescoLight(
        grauParentescoSearch || undefined
      ),
    enabled: open,
    staleTime: 60 * 1000,
  })

  const baseDoencaItems: ComboboxItem[] =
    (doencasResponse?.info?.data as DoencaTableDTO[] | undefined)?.map((d) => ({
      value: d.id,
      label: d.title ?? '',
    })) ?? []

  const doencaItems =
    isEdit && editData?.doencaId && editData?.nomeDoenca
      ? baseDoencaItems.some((i) => i.value === editData.doencaId)
        ? baseDoencaItems
        : [{ value: editData.doencaId, label: editData.nomeDoenca }, ...baseDoencaItems]
      : baseDoencaItems

  const baseGrauItems: ComboboxItem[] =
    (grauParentescoQuery.data?.info?.data as GrauParentescoLightDTO[] | undefined)?.map(
      (g) => ({
        value: g.id,
        label: g.descricao,
      })
    ) ?? []

  const grauItems =
    isEdit && editData?.grauParentescoId && editData?.grauParentesco
      ? baseGrauItems.some((i) => i.value === editData.grauParentescoId)
        ? baseGrauItems
        : [
            {
              value: editData.grauParentescoId,
              label: editData.grauParentesco ?? '',
            },
            ...baseGrauItems,
          ]
      : baseGrauItems

  useEffect(() => {
    if (!open) {
      setDoencaId('')
      setDoencaSearch('')
      setGrauParentescoId('')
      setGrauParentescoSearch('')
      setAno('')
      setIdade('')
      setData(undefined)
      setObservacoes('')
      return
    }

    if (editData) {
      setDoencaId(editData.doencaId ?? '')
      setDoencaSearch(editData.nomeDoenca ?? '')
      setGrauParentescoId(editData.grauParentescoId)
      setGrauParentescoSearch(editData.grauParentesco ?? '')
      setAno(editData.ano ?? '')
      setIdade(editData.idade ?? '')
      setData(editData.data ? new Date(editData.data) : undefined)
    }
  }, [open, editData])

  const handleGuardar = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (!doencaId) {
      toast.error('Selecione uma doença.')
      return
    }
    if (!grauParentescoId) {
      toast.error('Selecione o grau de parentesco.')
      return
    }
    if (!data) {
      toast.error('Indique a data do antecedente.')
      return
    }

    const payload: CreateAntecedentesFamiliaresUtenteRequest = {
      utenteId,
      doencaId,
      ano: ano === '' ? null : ano,
      idade: idade === '' ? null : idade,
      data: data ? toDateOnlyStr(data) : null,
      grauParentescoId,
    }

    setIsSaving(true)
    try {
      const client = AntecedentesFamiliaresUtenteService()
      const resp = isEdit && editData
        ? await client.update(editData.id, payload)
        : await client.create(payload)

      if ((resp.info as { data?: string })?.data !== undefined) {
        toast.success(
          isEdit
            ? 'Antecedente familiar atualizado.'
            : 'Antecedente familiar guardado.'
        )
        invalidate()
        onOpenChange(false)
        onSuccess?.()
      } else {
        const messages = (resp.info as { messages?: Record<string, string[]> })?.messages
        const flat = messages ? Object.values(messages).flat() : []
        toast.error(flat.length > 0 ? flat : 'Erro ao guardar antecedente familiar.')
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao guardar antecedente familiar.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Antecedente Familiar' : 'Adicionar Antecedente Familiar'}
          </DialogTitle>
          <DialogDescription>
            Registe antecedentes familiares do utente (doença, ano, idade, data e grau de
            parentesco).
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <Label>Doença</Label>
            <AsyncCombobox
              value={doencaId}
              onChange={setDoencaId}
              items={doencaItems}
              isLoading={isLoadingDoencas}
              placeholder='Doença'
              searchPlaceholder='Pesquisar doença…'
              emptyText='Nenhuma doença encontrada.'
              searchValue={doencaSearch}
              onSearchValueChange={setDoencaSearch}
            />
          </div>

          <div className='space-y-2'>
            <Label>Grau de Parentesco</Label>
            <AsyncCombobox
              value={grauParentescoId}
              onChange={setGrauParentescoId}
              items={grauItems}
              isLoading={grauParentescoQuery.isLoading}
              placeholder='Grau de parentesco'
              searchPlaceholder='Pesquisar grau…'
              emptyText='Nenhum grau encontrado.'
              searchValue={grauParentescoSearch}
              onSearchValueChange={setGrauParentescoSearch}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='space-y-2'>
              <Label>Ano</Label>
              <Input
                type='number'
                value={ano === '' ? '' : ano}
                onChange={(e) => {
                  const value = e.target.value
                  setAno(value === '' ? '' : Number(value))
                }}
                placeholder='Ano'
              />
            </div>
            <div className='space-y-2'>
              <Label>Idade</Label>
              <Input
                type='number'
                value={idade === '' ? '' : idade}
                onChange={(e) => {
                  const value = e.target.value
                  setIdade(value === '' ? '' : Number(value))
                }}
                placeholder='Idade'
              />
            </div>
            <div className='space-y-2'>
              <Label>Data</Label>
              <DatePicker value={data} onChange={setData} displayFormat='dd/MM/yyyy' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder='Observações adicionais (opcional)...'
              className='min-h-[80px]'
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button type='button' onClick={handleGuardar} disabled={isSaving || !utenteId}>
            {isSaving ? 'A guardar…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

