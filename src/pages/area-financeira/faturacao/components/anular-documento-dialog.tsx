import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast-utils'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import { useAnularDocumentoMutation } from '@/pages/area-financeira/documentos/queries/documento-emissao-queries'
import { useInvalidateDocumentosMutation } from '../queries/documento-queries'
import {
  getFaturacaoApiErrorMessage,
  isFaturacaoApiSuccess,
} from '../utils/faturacao-api-utils'
import { getDocumentoNumeroLabel } from '../utils/faturacao-documento-display'

const ID_FUNCIONALIDADE = 'documentos'

export function AnularDocumentoDialog({
  documento,
  onOpenChange,
}: {
  documento: DocumentoTableDTO | null
  onOpenChange: (open: boolean) => void
}) {
  const [motivoAnulacao, setMotivoAnulacao] = useState('')
  const [dataAnulacao, setDataAnulacao] = useState('')
  const [reverterEstadosClinicos, setReverterEstadosClinicos] = useState(false)

  const anularMutation = useAnularDocumentoMutation(ID_FUNCIONALIDADE)
  const invalidateMutation = useInvalidateDocumentosMutation()

  const handleAnular = async () => {
    if (!documento) return
    if (!motivoAnulacao.trim()) {
      toast.error('Motivo de anulação é obrigatório.')
      return
    }

    try {
      const res = await anularMutation.mutateAsync({
        documentoId: documento.id,
        payload: {
          motivoAnulacao: motivoAnulacao.trim(),
          dataAnulacao: dataAnulacao || null,
          reverterEstadosClinicos,
        },
      })

      if (isFaturacaoApiSuccess(res.info)) {
        toast.success('Documento anulado com sucesso.')
        await invalidateMutation.mutateAsync()
        onOpenChange(false)
        setMotivoAnulacao('')
        setDataAnulacao('')
        setReverterEstadosClinicos(false)
      } else {
        toast.error(
          getFaturacaoApiErrorMessage(res.info, 'Não foi possível anular o documento.'),
        )
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro inesperado ao anular.',
      )
    }
  }

  return (
    <Dialog open={!!documento} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            Anular{' '}
            {documento ? getDocumentoNumeroLabel(documento) : 'documento'}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Motivo *</Label>
            <Textarea
              value={motivoAnulacao}
              onChange={(e) => setMotivoAnulacao(e.target.value)}
              placeholder='Indique o motivo da anulação'
            />
          </div>
          <div className='space-y-2'>
            <Label>Data de anulação</Label>
            <Input
              type='date'
              value={dataAnulacao}
              onChange={(e) => setDataAnulacao(e.target.value)}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='reverter-estados-clinicos'
              checked={reverterEstadosClinicos}
              onCheckedChange={(checked) =>
                setReverterEstadosClinicos(!!checked)
              }
            />
            <Label htmlFor='reverter-estados-clinicos'>
              Reverter estados clínicos
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={handleAnular}
            disabled={anularMutation.isPending}
          >
            Anular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
