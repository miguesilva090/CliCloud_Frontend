import { useState } from 'react'
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
import { fieldGap, labelClass } from '@/lib/form-styles'
import type { FicheiroEletronicoAnexoDTO } from '@/types/dtos/faturacao/ficheiros-eletronicos.dtos'
import type { FicheiroEletronicoSigla } from '../constants/ficheiro-eletronico-siglas'
import { fileToBase64 } from '../utils/ficheiro-eletronico-download'
import { toast } from '@/utils/toast-utils'

export function AnexarFicheirosDialog({
  open,
  sigla,
  documentoLabel,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean
  sigla: FicheiroEletronicoSigla
  documentoLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: (anexos: FicheiroEletronicoAnexoDTO[]) => void
  isPending: boolean
}) {
  const [anexos, setAnexos] = useState<FicheiroEletronicoAnexoDTO[]>([])

  const reset = () => setAnexos([])

  const onSelectFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const next: FicheiroEletronicoAnexoDTO[] = []
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.txt')) {
        toast.warning('São aceites apenas ficheiros .txt')
        continue
      }
      next.push({ nome: file.name, conteudoBase64: await fileToBase64(file) })
    }
    setAnexos((prev) => [...prev, ...next])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Anexar Ficheiros — {sigla}</DialogTitle>
        </DialogHeader>
        <div className={fieldGap}>
          <div className='space-y-2'>
            <Label className={labelClass}>Fatura</Label>
            <Input value={documentoLabel} readOnly />
          </div>
          <div className='space-y-2'>
            <Label className={labelClass}>Ficheiros .txt</Label>
            <Input
              type='file'
              accept='.txt'
              multiple
              onChange={(e) => void onSelectFiles(e.target.files)}
            />
            <p className='text-xs text-muted-foreground'>
              Indique pelo menos 2 ficheiros .txt para juntar.
            </p>
            {anexos.length > 0 ? (
              <ul className='text-sm text-muted-foreground list-disc pl-5'>
                {anexos.map((a) => (
                  <li key={a.nome}>{a.nome}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              onOpenChange(false)
              reset()
            }}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            disabled={anexos.length < 2 || isPending}
            onClick={() => onConfirm(anexos)}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
