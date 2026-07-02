import { useState } from 'react'
import {
  Check,
  FileText,
  FolderOpen,
  Plus,
  Search,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import type { AdseComunicacaoModulo, AdsePreFaturaDTO } from '@/types/dtos/faturacao/adse-comunicacao.dtos'
import {
  formatDatePt,
  formatMoneyPt,
} from '@/pages/area-financeira/faturacao/utils/faturacao-documento-display'
import { useAdsePreFaturasPorEstadoQuery } from '../queries/adse-comunicacao-queries'
import {
  useApagarAdsePreFaturaMutation,
  useConferirAdsePreFaturaMutation,
  useCriarAdsePreFaturaMutation,
  useConsultarAdsePreFaturaMutation,
  useFecharAdsePreFaturaMutation,
} from '../queries/adse-comunicacao-mutations'

type Props = {
  open: boolean
  modulo: AdseComunicacaoModulo
  onClose: () => void
  onPreFaturaSelecionada?: (numOrdem: number) => void
}

const ESTADOS = [
  { value: '1', label: 'Criada' },
  { value: '2', label: 'Aberta' },
  { value: '3', label: 'Fechada' },
] as const

export function AdsePreFaturasDialog({ open, modulo, onClose, onPreFaturaSelecionada }: Props) {
  const [estado, setEstado] = useState('2')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const listQuery = useAdsePreFaturasPorEstadoQuery(modulo, Number(estado), open)
  const criar = useCriarAdsePreFaturaMutation(modulo)
  const apagar = useApagarAdsePreFaturaMutation(modulo)
  const conferir = useConferirAdsePreFaturaMutation()
  const consultar = useConsultarAdsePreFaturaMutation()
  const fechar = useFecharAdsePreFaturaMutation()

  const linhas = listQuery.data?.info?.data ?? []
  const selected = linhas.find((p) => p.id === selectedId) ?? null

  const criarPreFatura = () => {
    criar.mutate(undefined, {
      onSuccess: (res) => {
        const handled = handleApiResponse(res, 'Pré-fatura criada.')
        if (handled.success) listQuery.refetch()
      },
    })
  }

  const eliminarPreFatura = () => {
    if (!selected) {
      toast.error('Selecione uma pré-fatura.')
      return
    }
    apagar.mutate(selected.id, {
      onSuccess: (res) => {
        const handled = handleApiResponse(res, 'Pré-fatura eliminada.')
        if (handled.success) {
          setSelectedId(null)
          listQuery.refetch()
        }
      },
    })
  }

  const confirmar = () => {
    if (selected) onPreFaturaSelecionada?.(selected.numOrdem)
    onClose()
  }

  const conferirPreFatura = () => {
    if (!selected) return toast.error('Selecione uma pré-fatura.')
    conferir.mutate(selected.id, {
      onSuccess: (res) => {
        const handled = handleApiResponse(res, 'Pré-fatura conferida.')
        if (handled.success) listQuery.refetch()
      },
    })
  }

  const consultarPreFatura = () => {
    if (!selected) return toast.error('Selecione uma pré-fatura.')
    consultar.mutate(selected.id, {
      onSuccess: (res) => {
        const handled = handleApiResponse<AdsePreFaturaDTO>(res, 'Pré-fatura consultada.')
        if (handled.success && handled.data) {
          const pf = handled.data
          toast.info(`Pré-fatura ${pf.codigo}: ${pf.numDocumentos} docs, total ${formatMoneyPt(pf.valorTotal)}`)
        }
      },
    })
  }

  const fecharPreFatura = () => {
    if (!selected) return toast.error('Selecione uma pré-fatura.')
    const numero = window.prompt('Número da fatura ADSE:')
    if (!numero) return
    const serie = window.prompt('Série da fatura ADSE (opcional):') ?? ''
    const data = window.prompt('Data da fatura ADSE (YYYY-MM-DD):') ?? ''
    if (!data) return toast.error('Data da fatura é obrigatória.')
    fechar.mutate(
      {
        id: selected.id,
        payload: {
          referenciaSerie: serie,
          referenciaNumeroDocumento: Number(numero),
          referenciaData: data,
          referenciaValor: selected.valorTotal,
        },
      },
      {
        onSuccess: (res) => {
          const handled = handleApiResponse(res, 'Pré-fatura fechada.')
          if (handled.success) listQuery.refetch()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className='max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Pré-Faturas</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <RadioGroup
            value={estado}
            onValueChange={(v) => {
              setEstado(v)
              setSelectedId(null)
            }}
            className='flex flex-wrap gap-4'
          >
            {ESTADOS.map((e) => (
              <div key={e.value} className='flex items-center gap-2'>
                <RadioGroupItem value={e.value} id={`pf-estado-${e.value}`} />
                <Label htmlFor={`pf-estado-${e.value}`}>{e.label}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className='flex flex-wrap items-center gap-2'>
            <Button size='icon' variant='default' onClick={criarPreFatura}>
              <Plus className='h-4 w-4' />
            </Button>
            <Button size='icon' variant='destructive' onClick={eliminarPreFatura}>
              <X className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-auto flex-col px-3 py-2 text-xs'
              onClick={conferirPreFatura}
            >
              <Check className='mb-1 h-4 w-4' />
              Confere Pré Fatura
            </Button>
            <Button
              variant='outline'
              className='h-auto flex-col px-3 py-2 text-xs'
              onClick={consultarPreFatura}
            >
              <Search className='mb-1 h-4 w-4' />
              Consulta Pré Fatura
            </Button>
            <Button
              variant='outline'
              className='h-auto flex-col px-3 py-2 text-xs'
              onClick={fecharPreFatura}
            >
              <FolderOpen className='mb-1 h-4 w-4' />
              Fecha Pré Fatura
            </Button>
          </div>
        </div>

        <div className='overflow-x-auto rounded-lg border bg-card'>
          <table className='w-full min-w-[900px] text-sm'>
            <thead>
              <tr className='border-b bg-muted text-left'>
                <th className='p-2'>Nº Pré-Fatura</th>
                <th className='p-2'>Data Abertura</th>
                <th className='p-2'>Estado</th>
                <th className='p-2'>Nº Docs Incl.</th>
                <th className='p-2'>Valor Total</th>
                <th className='p-2'>Data Fecho</th>
                <th className='p-2'>Nº Série / Nº Fatura</th>
                <th className='p-2'>Data Fatura</th>
                <th className='p-2'>PDF</th>
                <th className='p-2'>Comprov.</th>
              </tr>
            </thead>
            <tbody className='bg-card'>
              {listQuery.isFetching ? (
                <tr>
                  <td colSpan={10} className='p-6 text-center text-muted-foreground'>
                    A carregar...
                  </td>
                </tr>
              ) : linhas.length === 0 ? (
                <tr>
                  <td colSpan={10} className='p-6 text-center text-muted-foreground'>
                    Não existem dados a apresentar
                  </td>
                </tr>
              ) : (
                linhas.map((row) => (
                  <PreFaturaRow
                    key={row.id}
                    row={row}
                    selected={selectedId === row.id}
                    onSelect={() => setSelectedId(row.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button onClick={confirmar}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PreFaturaRow({
  row,
  selected,
  onSelect,
}: {
  row: AdsePreFaturaDTO
  selected: boolean
  onSelect: () => void
}) {
  return (
    <tr
      className={`cursor-pointer border-b ${selected ? 'bg-primary text-primary-foreground' : ''}`}
      onClick={onSelect}
    >
      <td className='p-2'>{row.codigo}</td>
      <td className='p-2'>{formatDatePt(row.dataAbertura)}</td>
      <td className='p-2'>{row.estadoDescricao}</td>
      <td className='p-2'>{row.numDocumentos}</td>
      <td className='p-2'>{formatMoneyPt(row.valorTotal)}</td>
      <td className='p-2'>{formatDatePt(row.dataFecho ?? null)}</td>
      <td className='p-2'>{row.numeroFaturaReferencia || ''}</td>
      <td className='p-2'>{formatDatePt(row.referenciaData ?? null)}</td>
      <td className='p-2 text-center'>
        <FileText
          className={`mx-auto h-4 w-4 ${row.pdfFicheiro ? '' : 'opacity-30'}`}
        />
      </td>
      <td className='p-2 text-center'>
        <FileText
          className={`mx-auto h-4 w-4 ${
            row.estado === 3 && row.numeroFaturaReferencia ? '' : 'opacity-30'
          }`}
        />
      </td>
    </tr>
  )
}
