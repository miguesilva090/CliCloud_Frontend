import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import type { ReceitaMedicaTableDTO } from '@/types/dtos/prescricao/receita-medica.dtos'
import { useGetReceitasPaginated } from '../queries/listagem-receitas-queries'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  onSelect: (receitaId: string) => void
}

const PAGE_SIZE = 10

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

function estadoLabel(r: ReceitaMedicaTableDTO) {
  if (r.anulada === 1) return 'Anulada'
  if (r.enviada === 1) return 'Enviada'
  return 'Local'
}

/** Paridade PrescricaoRSPLst modo selectField=SelReceita. */
export function ReceitaAnterioresDialog({
  open,
  onOpenChange,
  utenteId,
  onSelect,
}: Props) {
  const [page, setPage] = useState(1)

  const filters = useMemo(
    () => (utenteId ? [{ id: 'utenteId', value: utenteId }] : null),
    [utenteId]
  )

  const query = useGetReceitasPaginated(
    page,
    PAGE_SIZE,
    filters,
    [{ id: 'dataPrescricao', desc: true }],
    open && Boolean(utenteId)
  )

  const rows = (query.data?.info?.data ?? []) as ReceitaMedicaTableDTO[]
  const totalPages = Math.max(1, query.data?.info?.totalPages ?? 1)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPage(1)
        onOpenChange(v)
      }}
    >
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Receitas anteriores</DialogTitle>
        </DialogHeader>

        <div className='max-h-[420px] overflow-auto rounded-md border'>
          {query.isFetching ? (
            <div className='flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              A carregar…
            </div>
          ) : rows.length === 0 ? (
            <p className='p-6 text-center text-sm text-muted-foreground'>
              Sem receitas para este utente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Local</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className='w-[100px]' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className='text-sm'>
                      {r.numeroReceitaLocal || r.numeroReceita || '—'}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {formatDate(r.dataPrescricao)}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {r.medicoNome || '—'}
                    </TableCell>
                    <TableCell className='text-sm'>{estadoLabel(r)}</TableCell>
                    <TableCell>
                      <Button
                        type='button'
                        size='sm'
                        variant='secondary'
                        onClick={() => {
                          onSelect(r.id)
                          onOpenChange(false)
                          setPage(1)
                        }}
                      >
                        Usar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className='flex items-center justify-between gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className='text-xs text-muted-foreground'>
            Página {page} / {totalPages}
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page >= totalPages || query.isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Seguinte
          </Button>
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
