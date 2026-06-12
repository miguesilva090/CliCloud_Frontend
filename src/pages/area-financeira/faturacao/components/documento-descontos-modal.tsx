import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import { ORGANISMO_DESCONTO_BLOQUEADO_MSG } from '../utils/organismo-desconto-utils'

/** Modal de descontos (legado TfaturaEdt — `modalDesconto` / `ShowDescontoClick`). */
export function DocumentoDescontosModal({
  open,
  onOpenChange,
  state,
  descontosBloqueados = false,
  onChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: DocumentoEditorState
  descontosBloqueados?: boolean
  onChange: (p: Partial<DocumentoEditorState>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Descontos</DialogTitle>
        </DialogHeader>
        {descontosBloqueados ? (
          <Alert>
            <AlertDescription>{ORGANISMO_DESCONTO_BLOQUEADO_MSG}</AlertDescription>
          </Alert>
        ) : null}
        <div className={`grid gap-4 ${formBlockGap}`}>
          <div className={fieldGap}>
            <Label className={labelClass}>Desconto cliente (%)</Label>
            <Input
              type='number'
              min={0}
              max={100}
              step={0.01}
              className={inputClass}
              disabled={descontosBloqueados}
              value={state.descontoCliente || ''}
              onChange={(e) =>
                onChange({ descontoCliente: Number(e.target.value) || 0 })
              }
            />
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Desconto cond. pagamento (%)</Label>
            <Input
              type='number'
              min={0}
              max={100}
              step={0.01}
              className={inputClass}
              disabled={descontosBloqueados}
              value={state.descontoPagamento || ''}
              onChange={(e) =>
                onChange({ descontoPagamento: Number(e.target.value) || 0 })
              }
            />
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Acerto / outros</Label>
            <Input
              type='number'
              step={0.01}
              className={inputClass}
              disabled={descontosBloqueados}
              value={state.outros || ''}
              onChange={(e) => onChange({ outros: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
