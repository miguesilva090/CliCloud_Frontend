import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/utils/toast-utils'
import {
  JUSTIFICACOES_QUANTIDADE_ATIVAS,
  MSG_JAU,
  patchConfirmarJustificacao,
  patchLimparJustificacao,
  maxQuantidadeSemJustificacao,
} from '../utils/justificacao-quantidade'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  embalagemUnitaria?: boolean | null
  initialCodigo?: string | null
  initialOutro?: string | null
  onConfirm: (patch: {
    codJustificacaoQuantidade: string | null
    justificacaoQuantidade: string | null
    codValidade: number
  }) => void
  onCancelResetQuantidade: (
    quantidade: number,
    patch: {
      codJustificacaoQuantidade: string | null
      justificacaoQuantidade: string | null
      codValidade: number
    }
  ) => void
}

export function ReceitaJustificacaoQuantidadeDialog({
  open,
  onOpenChange,
  embalagemUnitaria,
  initialCodigo,
  initialOutro,
  onConfirm,
  onCancelResetQuantidade,
}: Props) {
  const [codigo, setCodigo] = useState('JAU1')
  const [outro, setOutro] = useState('')
  const confirmedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      confirmedRef.current = false
      return
    }
    const ativo =
      JUSTIFICACOES_QUANTIDADE_ATIVAS.find((j) => j.value === initialCodigo)
        ?.value ?? 'JAU1'
    setCodigo(ativo)
    setOutro(initialCodigo === 'JAU4' ? (initialOutro ?? '') : '')
  }, [open, initialCodigo, initialOutro])

  const handleConfirm = () => {
    if (!codigo) {
      toast.error(MSG_JAU.selecionar)
      return
    }
    if (codigo === 'JAU4' && !outro.trim()) {
      toast.error(MSG_JAU.selecionar)
      return
    }
    confirmedRef.current = true
    onConfirm(patchConfirmarJustificacao(codigo, outro))
    toast.success(MSG_JAU.gravada)
    onOpenChange(false)
  }

  const handleCancel = () => {
    const qtd = maxQuantidadeSemJustificacao(embalagemUnitaria)
    onCancelResetQuantidade(qtd, patchLimparJustificacao())
    toast.info(MSG_JAU.cancelada)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          onOpenChange(true)
          return
        }
        // Fecho após confirmar: não resetar quantidade
        if (confirmedRef.current) {
          confirmedRef.current = false
          onOpenChange(false)
          return
        }
        handleCancel()
      }}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Justificação de quantidade</DialogTitle>
        </DialogHeader>

        <RadioGroup value={codigo} onValueChange={setCodigo} className='gap-3'>
          {JUSTIFICACOES_QUANTIDADE_ATIVAS.map((j) => (
            <div key={j.value} className='flex items-center gap-2'>
              <RadioGroupItem value={j.value} id={`jau-${j.value}`} />
              <Label htmlFor={`jau-${j.value}`}>{j.label}</Label>
            </div>
          ))}
        </RadioGroup>

        {codigo === 'JAU4' ? (
          <div className='space-y-1'>
            <Label>Outra</Label>
            <Textarea
              rows={3}
              value={outro}
              onChange={(e) => setOutro(e.target.value)}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleConfirm}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
