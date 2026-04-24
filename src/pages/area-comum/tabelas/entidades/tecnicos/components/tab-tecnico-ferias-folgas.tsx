import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import type { TecnicoDTO, FolgasTecnicoDTO } from '@/types/dtos/saude/tecnicos.dtos'
import type { TecnicoEditFormValues } from '@/pages/tecnicos/types/tecnico-edit-form-types'
import {
  useGetFolgasTecnicoByTecnicoId,
  useCreateFolgasTecnico,
  useDeleteFolgasTecnico,
} from '../queries/tecnico-horario-queries'

function formatDateLabel(s: string) {
  if (!s) return '—'
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTimeDisplay(s: string | null | undefined): string {
  if (!s) return '—'
  const parts = s.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return s
}

export function TabTecnicoFeriasFolgas({
  form,
  tecnico,
}: {
  form: UseFormReturn<TecnicoEditFormValues>
  tecnico: TecnicoDTO | undefined
}) {
  void form
  const tecnicoId = tecnico?.id ?? ''
  const hasTecnico = !!tecnicoId

  const { data: response, isLoading } =
    useGetFolgasTecnicoByTecnicoId(tecnicoId)
  const createMutation = useCreateFolgasTecnico(tecnicoId)
  const deleteMutation = useDeleteFolgasTecnico(tecnicoId)

  const lista: FolgasTecnicoDTO[] = response?.info?.data ?? []

  const [open, setOpen] = useState(false)
  const [dataDe, setDataDe] = useState('')
  const [dataAte, setDataAte] = useState('')
  const [todoDia, setTodoDia] = useState(false)
  const [mesInteiro, setMesInteiro] = useState(false)
  const [manhaInicio, setManhaInicio] = useState('')
  const [manhaFim, setManhaFim] = useState('')
  const [tardeInicio, setTardeInicio] = useState('')
  const [tardeFim, setTardeFim] = useState('')

  const handleTodoDiaChange = (checked: boolean) => {
    setTodoDia(checked)
    if (checked) {
      setManhaInicio('08:00')
      setManhaFim('12:00')
      setTardeInicio('12:00')
      setTardeFim('20:00')
    }
  }

  const handleAdicionar = () => {
    if (!dataDe.trim() || !tecnicoId) return
    createMutation.mutate({
      tecnicoId,
      dataDe: dataDe.trim(),
      dataAte: dataAte.trim() || dataDe.trim(),
      todoDia,
      mesInteiro,
      manhaInicio: manhaInicio || undefined,
      manhaFim: manhaFim || undefined,
      tardeInicio: tardeInicio || undefined,
      tardeFim: tardeFim || undefined,
    })
    setDataDe('')
    setDataAte('')
    setTodoDia(false)
    setMesInteiro(false)
    setManhaInicio('')
    setManhaFim('')
    setTardeInicio('')
    setTardeFim('')
    setOpen(false)
  }

  const handleRemover = (id: string) => {
    deleteMutation.mutate(id)
  }

  if (!hasTecnico) {
    return (
      <div className='rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground'>
        Grave o técnico primeiro para poder definir férias e folgas.
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <section>
        <div className='flex items-center justify-between gap-4 mb-3'>
          <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5'>
            Férias / Folgas
          </h3>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8'
            onClick={() => setOpen(true)}
            disabled={createMutation.isPending}
          >
            <Plus className='h-4 w-4 mr-2' />
            Adicionar férias
          </Button>
        </div>

        {isLoading ? (
          <div className='rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground'>
            A carregar…
          </div>
        ) : lista.length === 0 ? (
          <div className='rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground'>
            Nenhuma férias ou folga definida. Use o botão acima para adicionar.
          </div>
        ) : (
          <div className='rounded-md border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-muted/50'>
                  <th className='text-left p-2 font-medium'>Data de</th>
                  <th className='text-left p-2 font-medium'>Data até</th>
                  <th className='text-left p-2 font-medium'>Todo o dia</th>
                  <th className='text-left p-2 font-medium'>Mês inteiro</th>
                  <th className='text-left p-2 font-medium'>Manhã</th>
                  <th className='text-left p-2 font-medium'>Tarde</th>
                  <th className='w-10 p-2'></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((item) => (
                  <tr key={item.id} className='border-b last:border-0'>
                    <td className='p-2'>{formatDateLabel(item.dataDe)}</td>
                    <td className='p-2'>{formatDateLabel(item.dataAte)}</td>
                    <td className='p-2'>{item.todoDia ? 'Sim' : 'Não'}</td>
                    <td className='p-2'>{item.mesInteiro ? 'Sim' : 'Não'}</td>
                    <td className='p-2'>
                      {item.manhaInicio || item.manhaFim
                        ? `${formatTimeDisplay(item.manhaInicio)} - ${formatTimeDisplay(item.manhaFim)}`
                        : '—'}
                    </td>
                    <td className='p-2'>
                      {item.tardeInicio || item.tardeFim
                        ? `${formatTimeDisplay(item.tardeInicio)} - ${formatTimeDisplay(item.tardeFim)}`
                        : '—'}
                    </td>
                    <td className='p-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-destructive hover:text-destructive'
                        onClick={() => handleRemover(item.id)}
                        title='Remover'
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Adicionar férias</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Data de</label>
                <Input
                  type='date'
                  className='h-8'
                  value={dataDe}
                  onChange={(e) => setDataDe(e.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Data até</label>
                <Input
                  type='date'
                  className='h-8'
                  value={dataAte}
                  onChange={(e) => setDataAte(e.target.value)}
                />
              </div>
            </div>
            <div className='flex flex-wrap gap-6'>
              <label className='flex items-center space-x-2 cursor-pointer'>
                <Checkbox
                  checked={todoDia}
                  onCheckedChange={(c) => handleTodoDiaChange(!!c)}
                />
                <span className='text-sm font-normal'>Todo o dia</span>
              </label>
              <label className='flex items-center space-x-2 cursor-pointer'>
                <Checkbox
                  checked={mesInteiro}
                  onCheckedChange={(c) => setMesInteiro(!!c)}
                />
                <span className='text-sm font-normal'>Definir mês inteiro</span>
              </label>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Manhã Início</label>
                <Input
                  type='time'
                  className='h-8'
                  value={manhaInicio}
                  onChange={(e) => setManhaInicio(e.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Manhã Fim</label>
                <Input
                  type='time'
                  className='h-8'
                  value={manhaFim}
                  onChange={(e) => setManhaFim(e.target.value)}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Tarde Início</label>
                <Input
                  type='time'
                  className='h-8'
                  value={tardeInicio}
                  onChange={(e) => setTardeInicio(e.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Tarde Fim</label>
                <Input
                  type='time'
                  className='h-8'
                  value={tardeFim}
                  onChange={(e) => setTardeFim(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type='button'
              onClick={handleAdicionar}
              disabled={!dataDe.trim() || createMutation.isPending}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

