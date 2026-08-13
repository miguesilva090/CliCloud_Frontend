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
import { MedicacaoFavoritaService } from '@/lib/services/prescricao/medicacao-favorita-service'
import { ResponseStatus } from '@/types/api/responses'
import type { MedicacaoFavoritaDTO } from '@/types/dtos/prescricao/medicacao-favorita.dtos'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import { toast } from '@/utils/toast-utils'
import { useMedicacaoFavoritaByMedico } from '../queries/medicacao-favorita-queries'
import {
  mapFavoritoToLinhaDraft,
  MSG_MED_FAVORITA,
} from '../utils/medicacao-favorita'
import { extractReceitaApiError } from '../utils/receita-api-error'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicoId: string
  tipoLinha?: number
  onAddLinha: (linha: CreateReceitaLinhaRequest) => void
}

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

export function ReceitaMedicacaoFavoritaDialog({
  open,
  onOpenChange,
  medicoId,
  tipoLinha,
  onAddLinha,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const query = useMedicacaoFavoritaByMedico(medicoId, open, tipoLinha)

  const rows = useMemo(() => {
    const envelope = query.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return []
    return (envelope.data ?? []) as MedicacaoFavoritaDTO[]
  }, [query.data])

  const handleDelete = async (id: string) => {
    setBusyId(id)
    try {
      const res = await MedicacaoFavoritaService(permissionId).delete(id)
      if (res.info?.status !== ResponseStatus.Success) {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .filter(Boolean)
            .join(' ') || MSG_MED_FAVORITA.erro
        toast.error(msg)
        return
      }
      toast.success(MSG_MED_FAVORITA.removida)
      await query.refetch()
    } catch (err: unknown) {
      toast.error(extractReceitaApiError(err, MSG_MED_FAVORITA.erro))
    } finally {
      setBusyId(null)
    }
  }

  const handleUsar = (item: MedicacaoFavoritaDTO) => {
    onAddLinha(mapFavoritoToLinhaDraft(item))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Medicamentos favoritos</DialogTitle>
        </DialogHeader>

        <div className='max-h-[420px] overflow-auto rounded-md border'>
          {query.isFetching ? (
            <div className='flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />A carregar…
            </div>
          ) : rows.length === 0 ? (
            <p className='p-6 text-center text-sm text-muted-foreground'>
              Sem favoritos para este médico.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Designação</TableHead>
                  <TableHead>Embalagem</TableHead>
                  <TableHead>Posologia</TableHead>
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
