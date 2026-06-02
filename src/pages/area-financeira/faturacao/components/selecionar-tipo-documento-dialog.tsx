import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fieldGap, labelClass, selectTriggerClass } from '@/lib/form-styles'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import { isTipoDocumentoFaturacao } from '../utils/faturacao-documento-display'

export function SelecionarTipoDocumentoDialog({
  open,
  tipos,
  onConfirm,
  onCancel,
}: {
  open: boolean
  tipos: TipoDocumentoLightDTO[]
  onConfirm: (tipo: TipoDocumentoLightDTO) => void
  onCancel: () => void
}) {
  const opcoes = useMemo(
    () =>
      tipos.filter(
        (t) =>
          !t.inactivo &&
          t.mostraFaturacao !== false &&
          isTipoDocumentoFaturacao(t.abreviatura),
      ),
    [tipos],
  )
  const [tipoId, setTipoId] = useState('')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Faturação</DialogTitle>
        </DialogHeader>
        <div className={fieldGap}>
          <Label className={labelClass}>Tipo de Documento</Label>
          <Select value={tipoId} onValueChange={setTipoId}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder='Selecionar…' />
            </SelectTrigger>
            <SelectContent>
              {opcoes.length === 0 ? (
                <div className='text-muted-foreground px-2 py-3 text-sm'>
                  Nenhum tipo de documento disponível para esta clínica.
                </div>
              ) : (
                opcoes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.abreviatura}
                    {t.numeroSerie ? ` - ${t.numeroSerie}` : ''} - {t.descricao}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type='button'
            disabled={!tipoId}
            onClick={() => {
              const tipo = opcoes.find((t) => t.id === tipoId)
              if (tipo) onConfirm(tipo)
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
