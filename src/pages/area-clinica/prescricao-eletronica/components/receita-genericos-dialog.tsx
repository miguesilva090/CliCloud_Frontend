import { useEffect, useState } from 'react'
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
import { cn } from '@/lib/utils'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import type { MedicamentoPrescricaoOpcaoDto } from '@/types/dtos/prescricao/medicamentos-infarmed.dtos'
import { MedicamentosInfarmedService } from '@/lib/services/prescricao/medicamentos-infarmed-service'
import { calcularTotaisLinha } from '@/pages/area-clinica/processo-clinico/atendimento/ficha-clinica/utils/calcular-totais-linha'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { formatEuroOpcao } from '../utils/genericos-equivalentes'

export type GenericosPending = {
  linhaMarca: CreateReceitaLinhaRequest
  resumo: {
    nome: string
    substancia?: string | null
    embalagem?: string | null
    forma?: string | null
    taxa?: number | null
    pvp?: number | null
    valorUtente?: number | null
  }
  equivalentes: MedicamentoPrescricaoOpcaoDto[]
  patologias?: string
}

type Props = {
  open: boolean
  pending: GenericosPending | null
  onOpenChange: (open: boolean) => void
  onManter: (linha: CreateReceitaLinhaRequest) => void
  onPrescrever: (linha: CreateReceitaLinhaRequest) => void
}

export function ReceitaGenericosDialog({
  open,
  pending,
  onOpenChange,
  onManter,
  onPrescrever,
}: Props) {
  const [selectedCnpem, setSelectedCnpem] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !pending) return
    setSelectedCnpem(pending.equivalentes[0]?.cnpem ?? null)
  }, [open, pending])

  if (!pending) return null

  const handleManter = () => {
    onManter(pending.linhaMarca)
    onOpenChange(false)
  }

  const handlePrescrever = async () => {
    const opcao = pending.equivalentes.find((e) => e.cnpem === selectedCnpem)
    if (!opcao) {
      toast.error('Seleccione um equivalente para prescrever.')
      return
    }

    setLoading(true)
    try {
      const base = pending.linhaMarca
      const res = await MedicamentosInfarmedService().getPrescricaoByCnpem(
        opcao.cnpem,
        undefined,
        pending.patologias
      )
      const envelope = res.info
      const ficha =
        envelope?.status === ResponseStatus.Success ? envelope.data : null

      const totais = ficha
        ? calcularTotaisLinha(ficha, base.quantidade || 1)
        : null

      const nome = (ficha?.nome ?? opcao.nome).trim()
      const dosagem = (ficha?.dosagem ?? opcao.dosagem ?? '').trim()
      const dci = (ficha?.principioActivo ?? '').trim()

      // Prescrição por DCI / genérico
      const designacao = [dci || nome, dosagem].filter(Boolean).join(' ')

      onPrescrever({
        ...base,
        embId: ficha?.embId ?? null,
        cnpem: opcao.cnpem,
        designacao,
        descricaoEmbalagem:
          ficha?.embalagem ?? opcao.embalagem ?? base.descricaoEmbalagem,
        pvp: totais?.pvp ?? opcao.preco ?? null,
        comparticipacao: totais?.psns ?? null,
        valorUtente: totais?.put ?? null,
        // Prescrição por DCI / genérico (legado codTipoPrescricao = 2)
        codTipoPrescricao: 2,
        codMotivo: null,
        diploma: null,
      })
      onOpenChange(false)
    } catch {
      toast.error('Não foi possível carregar o equivalente seleccionado.')
    } finally {
      setLoading(false)
    }
  }

  const r = pending.resumo

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // Fechar sem Manter/Prescrever = descartar (não adiciona linha)
        onOpenChange(v)
      }}
    >
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Opções de medicamentos</DialogTitle>
        </DialogHeader>

        <div className='rounded-md border bg-muted/20 p-3 text-sm'>
          <p className='mb-2 font-medium'>Medicamento escolhido</p>
          <div className='grid gap-1 sm:grid-cols-2'>
            <p>
              <span className='text-muted-foreground'>Medicamento: </span>
              {r.nome || '—'}
            </p>
            <p>
              <span className='text-muted-foreground'>Substância: </span>
              {r.substancia || '—'}
            </p>
            <p>
              <span className='text-muted-foreground'>Embalagem: </span>
              {r.embalagem || '—'}
            </p>
            <p>
              <span className='text-muted-foreground'>Forma: </span>
              {r.forma || '—'}
            </p>
            <p>
              <span className='text-muted-foreground'>Taxa: </span>
              {r.taxa != null ? `${r.taxa}%` : '—'}
            </p>
            <p>
              <span className='text-muted-foreground'>PVP: </span>
              {formatEuroOpcao(r.pvp)}
            </p>
            <p>
              <span className='text-muted-foreground'>Utente: </span>
              {formatEuroOpcao(r.valorUtente)}
            </p>
          </div>
        </div>

        <div className='max-h-72 overflow-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicamento</TableHead>
                <TableHead>Dosagem</TableHead>
                <TableHead>Embalagem</TableHead>
                <TableHead>Genérico</TableHead>
                <TableHead className='text-right'>PVP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.equivalentes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center text-muted-foreground'
                  >
                    Sem equivalentes.
                  </TableCell>
                </TableRow>
              ) : (
                pending.equivalentes.map((e) => (
                  <TableRow
                    key={e.cnpem}
                    className={cn(
                      'cursor-pointer',
                      selectedCnpem === e.cnpem && 'bg-primary/15'
                    )}
                    onClick={() => setSelectedCnpem(e.cnpem)}
                  >
                    <TableCell className='font-medium'>{e.nome}</TableCell>
                    <TableCell>{e.dosagem || '—'}</TableCell>
                    <TableCell>{e.embalagem || '—'}</TableCell>
                    <TableCell>{e.generico ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {formatEuroOpcao(e.preco)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className='gap-2 sm:gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            onClick={handleManter}
          >
            Manter
          </Button>
          <Button
            type='button'
            disabled={loading || !selectedCnpem}
            onClick={() => void handlePrescrever()}
          >
            Prescrever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}