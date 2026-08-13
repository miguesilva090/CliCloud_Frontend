import { useMemo, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { modules } from '@/config/modules'
import { MedicacaoCronicaService } from '@/lib/services/prescricao/medicacao-cronica-service'
import { ResponseStatus } from '@/types/api/responses'
import type { MedicacaoCronicaDTO } from '@/types/dtos/prescricao/medicacao-cronica.dtos'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import { toast } from '@/utils/toast-utils'
import { useMedicacaoCronicaByUtente } from '../queries/medicacao-cronica-queries'
import {
  mapCronicaToLinhaDraft,
  MSG_MED_CRONICA,
} from '../utils/medicacao-cronica'
import { extractReceitaApiError } from '../utils/receita-api-error'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  onAddLinha: (linha: CreateReceitaLinhaRequest) => void
}

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

function formatDate(v?: string | null) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-PT')
}

export function ReceitaMedicacaoCronicaDialog({
  open,
  onOpenChange,
  utenteId,
  onAddLinha,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const query = useMedicacaoCronicaByUtente(utenteId, open)

  const rows = useMemo(() => {
    const envelope = query.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return []
    return (envelope.data ?? []) as MedicacaoCronicaDTO[]
  }, [query.data])

  const handleDelete = async (id: string) => {
    setBusyId(id)
    try {
      const res = await MedicacaoCronicaService(permissionId).delete(id)
      if (res.info?.status !== ResponseStatus.Success) {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .filter(Boolean)
            .join(' ') || MSG_MED_CRONICA.erro
        toast.error(msg)
        return
      }
      toast.success(MSG_MED_CRONICA.removida)
      await query.refetch()
    } catch (err: unknown) {
      toast.error(extractReceitaApiError(err, MSG_MED_CRONICA.erro))
    } finally {
      setBusyId(null)
    }
  }

  const handleUsar = (item: MedicacaoCronicaDTO) => {
    onAddLinha(mapCronicaToLinhaDraft(item))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Medicação crónica</DialogTitle>
        </DialogHeader>

        <div className='max-h-[420px] overflow-auto rounded-md border'>
          {query.isFetching ? (
            <div className='flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />A carregar…
            </div>
          ) : rows.length === 0 ? (
            <p className='p-6 text-center text-sm text-muted-foreground'>
              Sem medicação crónica activa.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Designação</TableHead>
                  <TableHead>Embalagem</TableHead>
                  <TableHead>Posologia</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead className='w-[140px]' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className='text-sm'>
                      <div>{r.designacao}</div>
                      {r.principioAtivo ? (
                        <div className='text-xs text-muted-foreground'>
                          {r.principioAtivo}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {r.descricaoEmbalagem || r.dosagem || '—'}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {r.posologia || '—'}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {formatDate(r.dataInicio)}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        <Button
                          type='button'
                          size='sm'
                          variant='secondary'
                          onClick={() => handleUsar(r)}
                        >
                          Usar
                        </Button>
                        <Button
                          type='button'
                          size='icon'
                          variant='ghost'
                          disabled={busyId === r.id}
                          onClick={() => void handleDelete(r.id)}
                        >
                          {busyId === r.id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <Trash2 className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
