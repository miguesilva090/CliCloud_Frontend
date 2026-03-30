import { useEffect, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { AntecedentesCirurgicosService } from '@/lib/services/antecedentes/antecedentes-cirurgicos-service'
import { useInvalidateAntecedentesCirurgicos } from '../queries/antecedentes-cirurgicos-queries'
import { toast } from '@/utils/toast-utils'
import type {
  AntecedentesCirurgicosTableDTO,
  CreateAntecedentesCirurgicosRequest,
} from '@/types/dtos/saude/antecedentes-cirurgicos.dtos'

export interface AntecedentesCirurgicosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  editData?: AntecedentesCirurgicosTableDTO | null
  onSuccess?: () => void
}

export function AntecedentesCirurgicosModal({
  open,
  onOpenChange,
  utenteId,
  editData,
  onSuccess,
}: AntecedentesCirurgicosModalProps) {
  const [ano, setAno] = useState<number | ''>('')
  const [tipoCirurgia, setTipoCirurgia] = useState('')
  const [houveComplicacoes, setHouveComplicacoes] = useState(false)
  const [complicacoes, setComplicacoes] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const invalidate = useInvalidateAntecedentesCirurgicos()
  const isEdit = Boolean(editData?.id)

  useEffect(() => {
    if (!open) {
      setAno('')
      setTipoCirurgia('')
      setHouveComplicacoes(false)
      setComplicacoes('')
      setObservacoes('')
      return
    }

    if (editData) {
      setAno(editData.ano ?? '')
      setTipoCirurgia(editData.tipoCirurgia ?? '')
      setHouveComplicacoes(editData.houveComplicacoes ?? false)
      setComplicacoes(editData.complicacoes ?? '')
      setObservacoes(editData.observacoes ?? '')
    }
  }, [open, editData])

  const handleGuardar = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }

    if (!tipoCirurgia || tipoCirurgia.trim().length === 0) {
      toast.error('Indique o tipo de cirurgia.')
      return
    }

    const payload: CreateAntecedentesCirurgicosRequest = {
      utenteId,
      ano: ano === '' ? null : ano,
      tipoCirurgia,
      houveComplicacoes,
      complicacoes: complicacoes || null,
      observacoes: observacoes || null,
    }

    setIsSaving(true)
    try {
      const client = AntecedentesCirurgicosService()
      const resp = isEdit && editData
        ? await client.update(editData.id, payload)
        : await client.create(payload)

      if ((resp.info as { data?: string })?.data !== undefined) {
        toast.success(isEdit ? 'Antecedente cirúrgico atualizado.' : 'Antecedente cirúrgico guardado.')
        invalidate()
        onOpenChange(false)
        onSuccess?.()
      } else {
        const messages = (resp.info as { messages?: Record<string, string[]> })?.messages
        const flat = messages ? Object.values(messages).flat() : []
        toast.error(flat.length > 0 ? flat : 'Erro ao guardar antecedente cirúrgico.')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao guardar antecedente cirúrgico.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onOpenChange(false)
        } else {
          onOpenChange(true)
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Antecedente Cirúrgico' : 'Adicionar Antecedente Cirúrgico'}
          </DialogTitle>
          <DialogDescription>
            Registe os antecedentes cirúrgicos do utente (ano, tipo de cirurgia e, se aplicável,
            complicações e observações).
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
              <Label>Tipo de Cirurgia</Label>
              <Input
                value={tipoCirurgia}
                onChange={(e) => setTipoCirurgia(e.target.value)}
                placeholder='Tipo de cirurgia'
              />
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <Checkbox
              id='houve-complicacoes-edit'
              checked={houveComplicacoes}
              onCheckedChange={(c) => setHouveComplicacoes(c === true)}
            />
            <Label htmlFor='houve-complicacoes-edit' className='text-sm leading-none'>
              Houve complicações?
            </Label>
          </div>

          <div className='space-y-2'>
            <Label>Complicações</Label>
            <Textarea
              value={complicacoes}
              onChange={(e) => setComplicacoes(e.target.value)}
              placeholder='Descreva as complicações (se existirem)...'
              className='min-h-[80px]'
              disabled={!houveComplicacoes}
            />
          </div>

          <div className='space-y-2'>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder='Observações adicionais...'
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

