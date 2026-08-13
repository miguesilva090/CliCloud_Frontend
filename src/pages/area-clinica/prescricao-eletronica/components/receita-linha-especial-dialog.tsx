import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/utils/toast-utils'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import {
  buildLinhaEspecial,
  tituloDialogoEspecial,
  type LinhaEspecialForm,
} from '../utils/receita-linha-especial'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoLinha: number
  onConfirm: (linha: CreateReceitaLinhaRequest) => void
}

const emptyForm = (): LinhaEspecialForm => ({
  designacao: '',
  dosagem: '',
  formaFarmaceutica: '',
  substanciaAtiva: '',
  dimensaoOuCodigo: '',
  posologia: '',
})

export function ReceitaLinhaEspecialDialog({
  open,
  onOpenChange,
  tipoLinha,
  onConfirm,
}: Props) {
  const [form, setForm] = useState<LinhaEspecialForm>(emptyForm)

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open, tipoLinha])

  const patch = (p: Partial<LinhaEspecialForm>) =>
    setForm((prev) => ({ ...prev, ...p }))

  const handleOk = () => {
    const built = buildLinhaEspecial(tipoLinha, form)
    if ('error' in built) {
      toast.error(built.error, 'Validação')
      return
    }
    onConfirm(built)
    onOpenChange(false)
  }

  const isManipulado = tipoLinha === 4
  const isLout = tipoLinha === 6
  const isCamara = tipoLinha === 8
  const showPosologia = tipoLinha !== 8

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{tituloDialogoEspecial(tipoLinha)}</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label>
              {isCamara ? 'Tipo de câmara expansora (*)' : 'Designação (*)'}
            </Label>
            <Input
              value={form.designacao}
              onChange={(e) => patch({ designacao: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleOk()
                }
              }}
            />
          </div>

          {isManipulado ? (
            <>
              <div className='space-y-1'>
                <Label>Dosagem (*)</Label>
                <Input
                  value={form.dosagem ?? ''}
                  onChange={(e) => patch({ dosagem: e.target.value })}
                />
              </div>
              <div className='space-y-1'>
                <Label>Forma farmacêutica</Label>
                <Input
                  value={form.formaFarmaceutica ?? ''}
                  onChange={(e) => patch({ formaFarmaceutica: e.target.value })}
                />
              </div>
              <div className='space-y-1'>
                <Label>Substância activa</Label>
                <Input
                  value={form.substanciaAtiva ?? ''}
                  onChange={(e) => patch({ substanciaAtiva: e.target.value })}
                />
              </div>
            </>
          ) : null}

          {isLout || isCamara ? (
            <div className='space-y-1'>
              <Label>{isCamara ? 'Código (opcional)' : 'Dimensão / embalagem'}</Label>
              <Input
                value={form.dimensaoOuCodigo ?? ''}
                onChange={(e) => patch({ dimensaoOuCodigo: e.target.value })}
              />
            </div>
          ) : null}

          {showPosologia ? (
            <div className='space-y-1'>
              <Label>Posologia</Label>
              <Input
                value={form.posologia ?? ''}
                onChange={(e) => patch({ posologia: e.target.value })}
                placeholder='Pode completar na grelha'
              />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type='button' onClick={handleOk}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}