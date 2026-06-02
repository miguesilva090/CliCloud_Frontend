import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DocumentoDetalhesAdmissoesDTO } from '@/types/dtos/faturacao/documento.dtos'

export function DetalhesAdmissoesDialog({
  open,
  detalhes,
  onOpenChange,
}: {
  open: boolean
  detalhes: DocumentoDetalhesAdmissoesDTO | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Detalhes de Admissões</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {detalhes?.itens?.length ? (
            detalhes.itens.map((item, idx) => (
              <div key={`${item.origem}-${idx}`} className='rounded-md border p-3 text-sm'>
                <p>
                  <strong>Origem:</strong> {item.origem}
                </p>
                <p>
                  <strong>Admissão:</strong> {item.admissaoId ?? '-'}
                </p>
                <p>
                  <strong>Consulta:</strong> {item.consultaId ?? '-'}
                </p>
                <p className='text-muted-foreground'>{item.descricao}</p>
              </div>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>
              Não existem admissões/consultas associadas a este documento.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
