import { useMemo, useState } from 'react'
import type {
  ComunicacaoFaturasTipoPreFatura,
  PreFaturaEstadoFiltro,
  PreFaturaTableDTO,
} from '@/types/dtos/faturacao/comunicacao-faturas.dtos'
import { FolderClosed, ListChecks, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getMockPreFaturas } from '../constants/comunicacao-faturas-pre-faturas-mock'

const ESTADO_FILTRO_LABEL: Record<PreFaturaEstadoFiltro, string> = {
  criada: 'Criada',
  aberta: 'Aberta',
  fechada: 'Fechada',
}

function formatValor(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return ''
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoPreFatura: ComunicacaoFaturasTipoPreFatura
  numeroPreFaturaSelecionado?: string
  onConfirm: (preFatura: PreFaturaTableDTO | null) => void
}

export function ComunicacaoFaturasPreFaturasDialog({
  open,
  onOpenChange,
  tipoPreFatura,
  numeroPreFaturaSelecionado,
  onConfirm,
}: Props) {
  const [estadoFiltro, setEstadoFiltro] =
    useState<PreFaturaEstadoFiltro>('aberta')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const all = getMockPreFaturas(tipoPreFatura)
    const estadoLabel = ESTADO_FILTRO_LABEL[estadoFiltro]
    return all.filter((row) => row.estado === estadoLabel)
  }, [estadoFiltro, tipoPreFatura])

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const all = getMockPreFaturas(tipoPreFatura)
      const current =
        all.find((row) => row.numeroPreFatura === numeroPreFaturaSelecionado) ??
        all.find((row) => row.estado === 'Aberta') ??
        all[0] ??
        null

      if (current) {
        const filtro = (Object.entries(ESTADO_FILTRO_LABEL).find(
          ([, label]) => label === current.estado
        )?.[0] ?? 'aberta') as PreFaturaEstadoFiltro
        setEstadoFiltro(filtro)
        setSelectedId(current.id)
      } else {
        setEstadoFiltro('aberta')
        setSelectedId(null)
      }
    } else {
      setSelectedId(null)
    }
    onOpenChange(next)
  }

  const selectedRow = rows.find((row) => row.id === selectedId) ?? null

  const handleOk = () => {
    onConfirm(selectedRow)
    setSelectedId(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex max-h-[90vh] max-w-6xl flex-col gap-4'>
        <DialogHeader>
          <DialogTitle>Pré-Faturas</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <RadioGroup
            value={estadoFiltro}
            onValueChange={(value) => {
              setEstadoFiltro(value as PreFaturaEstadoFiltro)
              setSelectedId(null)
            }}
            className='flex flex-wrap items-center gap-4'
          >
            {(Object.keys(ESTADO_FILTRO_LABEL) as PreFaturaEstadoFiltro[]).map(
              (key) => (
                <div key={key} className='flex items-center gap-2'>
                  <RadioGroupItem value={key} id={`pre-fatura-estado-${key}`} />
                  <Label
                    htmlFor={`pre-fatura-estado-${key}`}
                    className='cursor-pointer font-normal'
                  >
                    {ESTADO_FILTRO_LABEL[key]}
                  </Label>
                </div>
              )
            )}
          </RadioGroup>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              size='icon'
              className='h-8 w-8'
              title='Nova pré-fatura'
              onClick={() =>
                toast.info('Nova pré-fatura — integração API em preparação.')
              }
            >
              <Plus className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              size='icon'
              variant='destructive'
              className='h-8 w-8'
              title='Eliminar pré-fatura'
              disabled={!selectedRow}
              onClick={() =>
                toast.info(
                  'Eliminar pré-fatura — integração API em preparação.'
                )
              }
            >
              <X className='h-4 w-4' />
            </Button>

            <Button
              type='button'
              size='sm'
              className='h-auto min-w-[7.5rem] flex-col gap-1 px-3 py-2 text-xs leading-tight'
              disabled={!selectedRow}
              onClick={() =>
                toast.info(
                  'Conferir pré-fatura — integração API em preparação.'
                )
              }
            >
              <ListChecks className='h-4 w-4' />
              Confere
              <span>Pré-Fatura</span>
            </Button>
            <Button
              type='button'
              size='sm'
              className='h-auto min-w-[7.5rem] flex-col gap-1 bg-teal-600 px-3 py-2 text-xs leading-tight text-white hover:bg-teal-700'
              disabled={!selectedRow}
              onClick={() =>
                toast.info(
                  'Consulta pré-fatura — integração API em preparação.'
                )
              }
            >
              <Search className='h-4 w-4' />
              Consulta
              <span>Pré-Fatura</span>
            </Button>
            <Button
              type='button'
              size='sm'
              variant='destructive'
              className='h-auto min-w-[7.5rem] flex-col gap-1 px-3 py-2 text-xs leading-tight'
              disabled={!selectedRow}
              onClick={() =>
                toast.info('Fechar pré-fatura — integração API em preparação.')
              }
            >
              <FolderClosed className='h-4 w-4' />
              Fecha
              <span>Pré-Fatura</span>
            </Button>
          </div>
        </div>

        <ScrollArea className='w-full rounded-md border'>
          <Table className='min-w-[1100px]'>
            <TableHeader>
              <TableRow className='bg-muted/50 hover:bg-muted/50'>
                <TableHead className='whitespace-nowrap'>
                  Nº Pré-Fatura
                </TableHead>
                <TableHead className='whitespace-nowrap'>
                  Data Abertura
                </TableHead>
                <TableHead className='whitespace-nowrap'>Estado</TableHead>
                <TableHead className='whitespace-nowrap text-right'>
                  Nº Docs Incl.
                </TableHead>
                <TableHead className='whitespace-nowrap text-right'>
                  Valor Total
                </TableHead>
                <TableHead className='whitespace-nowrap'>Data Fecho</TableHead>
                <TableHead className='whitespace-nowrap'>
                  Nº Série / Nº Fatura
                </TableHead>
                <TableHead className='whitespace-nowrap'>Data Fatura</TableHead>
                <TableHead className='whitespace-nowrap text-center'>
                  PDF
                </TableHead>
                <TableHead className='whitespace-nowrap text-center'>
                  Comprov.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className='h-16 text-center text-muted-foreground'
                  >
                    Não existem dados a apresentar
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isSelected = row.id === selectedId
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'cursor-pointer',
                        isSelected && 'bg-primary/10 hover:bg-primary/10'
                      )}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <TableCell className='font-medium'>
                        {row.numeroPreFatura}
                      </TableCell>
                      <TableCell>{row.dataAbertura || ''}</TableCell>
                      <TableCell>{row.estado}</TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {row.numeroDocsIncluidos ?? ''}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatValor(row.valorTotal)}
                      </TableCell>
                      <TableCell>{row.dataFecho || ''}</TableCell>
                      <TableCell>{row.numeroSerieFatura || ''}</TableCell>
                      <TableCell>{row.dataFatura || ''}</TableCell>
                      <TableCell className='text-center'>
                        {row.temPdf ? '✓' : ''}
                      </TableCell>
                      <TableCell className='text-center'>
                        {row.temComprovativo ? '✓' : ''}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>

        <DialogFooter>
          <Button type='button' onClick={handleOk}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
