import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, X } from 'lucide-react'
import { QuestionarioUtenteService } from '@/lib/services/processo-clinico/questionario-utente-service'
import { useGetQuestionariosUtentePaginated, useInvalidateQuestionariosUtente } from '../queries/questionario-utente-queries'
import { QuestionarioUtenteModal } from '../modals/QuestionarioUtenteModal'
import { toast } from '@/utils/toast-utils'
import type { QuestionarioUtenteTableDTO } from '@/types/dtos/saude/questionario-utente.dtos'

export interface QuestionarioTabProps {
  utenteId?: string
}

export function QuestionarioTab({ utenteId = '' }: QuestionarioTabProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const { data } = useGetQuestionariosUtentePaginated(utenteId, 1, 100)
  const questionarios = (data?.info?.data ?? []) as QuestionarioUtenteTableDTO[]
  const hasQuestionarios = questionarios.length > 0

  const invalidate = useInvalidateQuestionariosUtente()

  const handleInserirClick = () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    setModalOpen(true)
  }

  const handleRemoverClick = () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos um questionário para remover.')
      return
    }
    void handleConfirmRemover()
  }

  const handleConfirmRemover = async () => {
    if (!utenteId || selectedIds.length === 0) return
    try {
      setIsDeleting(true)
      const client = QuestionarioUtenteService()
      await Promise.all(selectedIds.map((id) => client.delete(id)))
      toast.success('Questionário(s) removido(s) com sucesso.')
      setSelectedIds([])
      invalidate()
    } catch {
      toast.error('Erro ao remover questionário(s).')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='rounded-lg border bg-card'>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b bg-teal-50 px-4 py-2 dark:bg-teal-950/30'>
        <h3 className='text-sm font-semibold text-teal-800 dark:text-teal-200'>Questionário</h3>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            className='gap-1 bg-teal-600 hover:bg-teal-700'
            onClick={handleInserirClick}
            disabled={!utenteId}
          >
            <Plus className='h-4 w-4' /> Inserir
          </Button>
          <Button
            size='sm'
            variant='destructive'
            className='gap-1'
            onClick={handleRemoverClick}
            disabled={!utenteId || selectedIds.length === 0 || isDeleting}
          >
            <X className='h-4 w-4' /> Remover
          </Button>
        </div>
      </div>

      <div className='overflow-x-auto p-4'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10' />
              <TableHead className='text-left'>Código</TableHead>
              <TableHead className='text-center whitespace-nowrap'>Data</TableHead>
              <TableHead className='text-center whitespace-nowrap'>Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasQuestionarios ? (
              <TableRow>
                <TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
                  Não existem dados a apresentar
                </TableCell>
              </TableRow>
            ) : (
              questionarios.map((row: QuestionarioUtenteTableDTO, index) => {
                const data = row.dataCriacao ? new Date(row.dataCriacao) : null
                return (
                  <TableRow key={row.id}>
                    <TableCell className='w-10 align-middle'>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={(c) => {
                          if (c === true) {
                            setSelectedIds((prev) =>
                              prev.includes(row.id) ? prev : [...prev, row.id]
                            )
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== row.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className='align-middle text-left'>{index + 1}</TableCell>
                    <TableCell className='align-middle text-center whitespace-nowrap'>
                      {data ? format(data, 'dd/MM/yyyy') : '—'}
                    </TableCell>
                    <TableCell className='align-middle text-center whitespace-nowrap'>
                      {data ? format(data, 'HH:mm') : '—'}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionarioUtenteModal
        utenteId={utenteId}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
        }}
        onSaved={() => {
          invalidate()
        }}
      />
    </div>
  )
}


