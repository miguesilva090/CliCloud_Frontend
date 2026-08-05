import { useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TimeField } from '@/components/shared/time-field'
import { useDisponibilidadeTecnicoSlot } from '@/hooks/tratamentos/use-disponibilidade-tecnico-slot'
import { toast } from '@/utils/toast-utils'

type Props = {
  enabled: boolean
  tecnicoId: string
  data: string
  idFuncionalidade: string
  unidadeTempo: number
  onUnidadeTempoChange: (v: number) => void
  hora: string
  onHoraChange: (v: string) => void
  duracao: string
  onDuracaoChange: (v: string) => void
  ignorarSessaoId?: string | null
}

export function TecnicoSlotHorarioFields({
  enabled,
  tecnicoId,
  data,
  idFuncionalidade,
  unidadeTempo,
  onUnidadeTempoChange,
  hora,
  onHoraChange,
  duracao,
  onDuracaoChange,
  ignorarSessaoId,
}: Props) {
  const {
    unidadesTempo,
    horas,
    bloqueioMotivo,
    isLoadingUnidades,
    isLoadingHoras,
  } = useDisponibilidadeTecnicoSlot({
    enabled: enabled && !!tecnicoId,
    tecnicoId,
    data,
    unidadeTempo,
    idFuncionalidade,
    ignorarSessaoId,
  })

  const lastToast = useRef('')

  useEffect(() => {
    if (!enabled || !tecnicoId) return
    if (!unidadesTempo.includes(unidadeTempo)) {
      onUnidadeTempoChange(unidadesTempo[0] ?? 1)
    }
  }, [enabled, tecnicoId, unidadesTempo, unidadeTempo, onUnidadeTempoChange])

  useEffect(() => {
    if (!enabled) return
    if (hora && (horas.length === 0 || !horas.includes(hora))) {
      onHoraChange('')
    }
  }, [enabled, hora, horas, onHoraChange])

  useEffect(() => {
    if (!enabled || !bloqueioMotivo) {
      lastToast.current = ''
      return
    }
    if (lastToast.current === bloqueioMotivo) return
    lastToast.current = bloqueioMotivo
    toast.error(bloqueioMotivo)
    onHoraChange('')
  }, [enabled, bloqueioMotivo, onHoraChange])

  const disabled = !enabled || !tecnicoId
  const placeholderInicio = isLoadingHoras
    ? 'A carregar…'
    : bloqueioMotivo
      ? bloqueioMotivo
      : horas.length === 0
        ? 'Sem horas'
        : 'HH:mm'

  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      <div className='space-y-1'>
        <Label className='text-xs'>U.Tempo</Label>
        <Select
          value={String(unidadeTempo)}
          disabled={disabled || isLoadingUnidades}
          onValueChange={(v) => {
            onUnidadeTempoChange(Number(v) || 1)
            onHoraChange('')
          }}
        >
          <SelectTrigger className='h-8'>
            <SelectValue placeholder='U.Tempo' />
          </SelectTrigger>
          <SelectContent>
            {unidadesTempo.map((u) => (
              <SelectItem key={u} value={String(u)}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-1'>
        <Label className='text-xs'>Início</Label>
        <Select
          value={hora || undefined}
          disabled={disabled || !data || isLoadingHoras || !!bloqueioMotivo}
          onValueChange={onHoraChange}
        >
          <SelectTrigger className='h-8'>
            <SelectValue placeholder={placeholderInicio} />
          </SelectTrigger>
          <SelectContent>
            {horas.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-1'>
        <Label className='text-xs'>Duração</Label>
        <TimeField
          value={duracao}
          disabled={!enabled}
          placeholder='HH:mm'
          onChange={onDuracaoChange}
        />
      </div>
    </div>
  )
}
