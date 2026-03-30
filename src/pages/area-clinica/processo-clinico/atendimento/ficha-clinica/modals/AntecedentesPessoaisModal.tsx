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
import { AntecedentesPessoaisService } from '@/lib/services/antecedentes/antecedentes-pessoais-service'
import { useInvalidateAntecedentesPessoais } from '../queries/antecedentes-pessoais-queries'
import { toast } from '@/utils/toast-utils'
import type {
  AntecedentesPessoaisTableDTO,
  CreateAntecedentesPessoaisRequest,
} from '@/types/dtos/saude/antecedentes-pessoais.dtos'
import type { PaginatedRequest } from '@/types/api/responses'
import type { DoencaTableDTO } from '@/types/dtos/doencas/doenca.dtos'

function toDateOnlyStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

export interface AntecedentesPessoaisModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  editData?: AntecedentesPessoaisTableDTO | null
  onSuccess?: () => void
}

export function AntecedentesPessoaisModal({
  open,
  onOpenChange,
  utenteId,
  editData,
  onSuccess,
}: AntecedentesPessoaisModalProps) {
  const [doencaId, setDoencaId] = useState('')
  const [doencaSearch, setDoencaSearch] = useState('')
  const [ano, setAno] = useState<number | ''>('')
  const [idade, setIdade] = useState<number | ''>('')
  const [data, setData] = useState<Date | undefined>()
  const [observacoes, setObservacoes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const invalidate = useInvalidateAntecedentesPessoais()
  const isEdit = Boolean(editData?.id)

  // carregar doenças para o combobox (paginação simples)
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

  const baseItems: ComboboxItem[] =
    (doencasResponse?.info?.data as DoencaTableDTO[] | undefined)?.map((d) => ({
      value: d.id,
      label: d.title ?? '',
    })) ?? []

  const doencaItems =
    isEdit && editData?.doencaId && editData?.nomeDoenca
      ? baseItems.some((i) => i.value === editData.doencaId)
        ? baseItems
        : [{ value: editData.doencaId, label: editData.nomeDoenca }, ...baseItems]
      : baseItems

  useEffect(() => {
    if (!open) {
      setDoencaId('')
      setDoencaSearch('')
      setAno('')
      setIdade('')
      setData(undefined)
      setObservacoes('')
      return
    }

    if (editData) {
      setDoencaId(editData.doencaId ?? '')
      setDoencaSearch(editData.nomeDoenca ?? '')
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
    if (!data) {
      toast.error('Indique a data do antecedente.')
      return
    }

    const selected = doencaItems.find((i) => i.value === doencaId)

    const payload: CreateAntecedentesPessoaisRequest = {
      utenteId,
      doencaId,
      nomeDoenca: selected?.label ?? editData?.nomeDoenca ?? null,
      ano: ano === '' ? null : ano,
      idade: idade === '' ? null : idade,
      data: data ? toDateOnlyStr(data) : null,
    }

    setIsSaving(true)
    try {
      const client = AntecedentesPessoaisService()
      const resp = isEdit && editData
        ? await client.update(editData.id, payload)
        : await client.create(payload)

      if ((resp.info as { data?: string })?.data !== undefined) {
        toast.success(
          isEdit ? 'Antecedente pessoal atualizado.' : 'Antecedente pessoal guardado.'
        )
        invalidate()
        onOpenChange(false)
        onSuccess?.()
      } else {
        const messages = (resp.info as { messages?: Record<string, string[]> })?.messages
        const flat = messages ? Object.values(messages).flat() : []
        toast.error(flat.length > 0 ? flat : 'Erro ao guardar antecedente pessoal.')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao guardar antecedente pessoal.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Antecedente Pessoal' : 'Adicionar Antecedente Pessoal'}
          </DialogTitle>
          <DialogDescription>
            Associe uma doença (ICD) e, opcionalmente, ano/idade/data ao antecedente pessoal.
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

