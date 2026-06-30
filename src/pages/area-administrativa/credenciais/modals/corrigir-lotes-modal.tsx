import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import type {
  CorrigirLotesResultDTO,
  ValidarCorrigirLotesDTO,
} from '@/types/dtos/credenciais/lote-direct.dtos'
import { useLoteDirectFuncionalidadeId } from '../queries/listagem-lote-direct-queries'

const MESES = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

export function CorrigirLotesModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const navigate = useNavigate()
  const permId = useLoteDirectFuncionalidadeId()
  const now = new Date()
  const [mes, setMes] = useState(String(now.getMonth() + 1))
  const [ano, setAno] = useState(String(now.getFullYear()))
  const [validating, setValidating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [validacao, setValidacao] = useState<ValidarCorrigirLotesDTO | null>(null)
  const [resultado, setResultado] = useState<CorrigirLotesResultDTO | null>(null)

  useEffect(() => {
    if (!open) return
    const current = new Date()
    setMes(String(current.getMonth() + 1))
    setAno(String(current.getFullYear()))
    setValidacao(null)
    setResultado(null)
  }, [open])

  const runValidacao = async (mesNumero: number, anoNumero: number) => {
    setValidating(true)
    setResultado(null)
    try {
      const response = await LoteDirectService(permId).validarCorrigirLotes({
        mes: mesNumero,
        ano: anoNumero,
      })
      if (response.info.status === ResponseStatus.Success && response.info.data) {
        setValidacao(response.info.data)
        return response.info.data
      }
      setValidacao(null)
      toast.error(
        response.info.messages?.['$']?.[0] ?? 'Não foi possível validar os lotes.'
      )
      return null
    } catch (error: unknown) {
      setValidacao(null)
      toast.error((error as Error)?.message ?? 'Ocorreu um erro ao validar os lotes.')
      return null
    } finally {
      setValidating(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const mesNumero = Number(mes)
    const anoNumero = Number(ano)
    if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) return
    if (!Number.isInteger(anoNumero) || anoNumero < 1900) return
    void runValidacao(mesNumero, anoNumero)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mes, ano])

  const handleConfirm = async () => {
    const mesNumero = Number(mes)
    const anoNumero = Number(ano)

    if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
      toast.error('Selecione um mês válido.')
      return
    }

    if (!Number.isInteger(anoNumero) || anoNumero < 1900) {
      toast.error('Indique um ano válido.')
      return
    }

    const validacaoAtual = validacao ?? (await runValidacao(mesNumero, anoNumero))
    if (!validacaoAtual?.podeCorrigir) {
      toast.error('Corrija os problemas indicados antes de continuar.')
      return
    }

    setSubmitting(true)
    try {
      const response = await LoteDirectService(permId).corrigirLotes({
        mes: mesNumero,
        ano: anoNumero,
      })

      if (response.info.status === ResponseStatus.Success && response.info.data) {
        setResultado(response.info.data)
        toast.success('Lotes corrigidos com sucesso.')
        onSuccess?.()
        return
      }

      toast.error(
        response.info.messages?.['$']?.[0] ?? 'Não foi possível corrigir os lotes.'
      )
    } catch (error: unknown) {
      toast.error(
        (error as Error)?.message ?? 'Ocorreu um erro ao corrigir os lotes.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const verAgregados = () => {
    onOpenChange(false)
    navigate(
      `/area-administrativa/credenciais/agregados?mes=${mes}&ano=${ano}`
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Corrigir Lotes</DialogTitle>
          <DialogDescription>
            Agrega lançamentos de credenciais em lotes (consultas) para o mês/ano
            selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label htmlFor='corrigir-lotes-mes'>Mês</Label>
            <Select value={mes} onValueChange={setMes} disabled={submitting}>
              <SelectTrigger id='corrigir-lotes-mes'>
                <SelectValue placeholder='Selecione o mês' />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='corrigir-lotes-ano'>Ano</Label>
            <Input
              id='corrigir-lotes-ano'
              type='number'
              min={1900}
              value={ano}
              onChange={(event) => setAno(event.target.value)}
              disabled={submitting}
            />
          </div>

          {validating ? (
            <p className='text-sm text-muted-foreground'>A validar dados...</p>
          ) : null}

          {validacao && !resultado ? (
            <div className='space-y-2'>
              <p className='text-sm'>
                <span className='font-medium'>{validacao.cabecalhosEncontrados}</span>{' '}
                lançamento(s) encontrado(s).
                {validacao.agregadosExistentes > 0
                  ? ` ${validacao.agregadosExistentes} agregado(s) serão substituídos.`
                  : null}
              </p>
              {validacao.problemas.map((msg) => (
                <Alert key={msg} variant='destructive'>
                  <AlertTitle>Não é possível corrigir</AlertTitle>
                  <AlertDescription>{msg}</AlertDescription>
                </Alert>
              ))}
              {validacao.avisos.map((msg) => (
                <Alert key={msg}>
                  <AlertTitle>Aviso</AlertTitle>
                  <AlertDescription>{msg}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : null}

          {resultado ? (
            <Alert>
              <AlertTitle>Correção concluída</AlertTitle>
              <AlertDescription className='space-y-1'>
                <p>
                  {resultado.cabecalhosProcessados} lançamento(s) processado(s).
                </p>
                <p>
                  {resultado.agregadosCriados} lote(s) agregado(s) e{' '}
                  {resultado.detalhesCriados} detalhe(s) criados.
                </p>
                {resultado.avisos.map((msg) => (
                  <p key={msg} className='text-amber-700'>
                    {msg}
                  </p>
                ))}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          {resultado ? (
            <Button type='button' onClick={verAgregados}>
              Ver lotes agregados
            </Button>
          ) : null}
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {resultado ? 'Fechar' : 'Cancelar'}
          </Button>
          {!resultado ? (
            <Button
              type='button'
              onClick={() => void handleConfirm()}
              disabled={
                submitting || validating || !validacao?.podeCorrigir
              }
            >
              {submitting ? 'A corrigir...' : 'Corrigir'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
