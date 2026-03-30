import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'

export type PatologiaServicoRow = {
  tempId: string
  subsistemaServicoId: string
  codigoServico?: string | null
  descricaoServico?: string | null
  subSistema?: string | null
  duracao?: string | null
  ordem: number
  fisioterapia: boolean
  auxiliar: boolean
  valorUtente: number
  valorOrganismo: number
  percentagemInstituicao?: number | null
  precoEur?: number | null
  observacoes?: string | null
}

export function PatologiaServicoModal({
  open,
  onOpenChange,
  title,
  organismoId,
  initialValue,
  nextOrdem,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  organismoId?: string
  initialValue?: PatologiaServicoRow | null
  nextOrdem: number
  onConfirm: (row: PatologiaServicoRow) => void
}) {
  const [search, setSearch] = useState('')
  const [subsistemaServicoId, setSubsistemaServicoId] = useState('')
  const [duracao, setDuracao] = useState('')
  const [fisioterapia, setFisioterapia] = useState(false)
  const [auxiliar, setAuxiliar] = useState(false)

  const [valorUtente, setValorUtente] = useState<number>(0)
  const [valorOrganismo, setValorOrganismo] = useState<number>(0)
  const [percentagemInstituicao, setPercentagemInstituicao] = useState<number | null>(null)
  const [precoEur, setPrecoEur] = useState<number | null>(null)

  const { data: subsistemasResponse } = useQuery({
    queryKey: ['subsistemas-servicos-all-for-patologia', { open }],
    queryFn: () => SubsistemaServicoService().getSubsistemaServico(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: servicosResponse } = useQuery({
    queryKey: ['servicos-light-for-patologia', { open }],
    queryFn: () => ServicoService().getServicoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const subsistemas = (subsistemasResponse?.info?.data ?? []) as SubsistemaServicoDTO[]
  const servicos = servicosResponse?.info?.data ?? []

  const subsistemasFiltered = useMemo(() => {
    const base = organismoId ? subsistemas.filter((s) => s.organismoId === organismoId) : subsistemas
    if (!search.trim()) return base
    const q = search.trim().toLowerCase()
    return base.filter((s) => {
      const serv = servicos.find((x) => x.id === s.servicoId)
      const label = `${serv?.designacao ?? ''} ${s.subsistemaId ?? ''}`.toLowerCase()
      return label.includes(q)
    })
  }, [subsistemas, organismoId, search, servicos])

  const items: ComboboxItem[] = useMemo(() => {
    return subsistemasFiltered.map((s) => {
      const serv = servicos.find((x) => x.id === s.servicoId)
      return {
        value: s.id,
        label: serv?.designacao ?? s.servicoId,
      }
    })
  }, [subsistemasFiltered, servicos])

  const selectedMeta = useMemo(() => {
    const ss = subsistemas.find((x) => x.id === subsistemaServicoId)
    if (!ss) return null
    const serv = servicos.find((x) => x.id === ss.servicoId)
    return { ss, serv }
  }, [subsistemaServicoId, subsistemas, servicos])

  // Formatação final (onBlur): HH:MM sempre com 2 dígitos
  const formatDuration = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (!digits) return ''
    const padded = digits.padStart(4, '0')
    const hours = padded.slice(0, 2)
    const minutes = padded.slice(2, 4)
    return `${hours}:${minutes}`
  }

  // Formatação enquanto o utilizador escreve:
  // - insere ':' automaticamente após 2 dígitos (ex.: "00" -> "00:")
  // - com 3-4 dígitos mostra "HH:M" / "HH:MM"
  const formatDurationOnChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (!digits) return ''
    if (digits.length <= 2) {
      return digits.length === 2 ? `${digits}:` : digits
    }
    if (digits.length <= 4) {
      const hours = digits.slice(0, 2)
      const minutes = digits.slice(2)
      return `${hours}:${minutes}`
    }
    return value
  }

  useEffect(() => {
    if (!open) return
    if (initialValue) {
      setSearch('')
      setSubsistemaServicoId(initialValue.subsistemaServicoId ?? '')
      setDuracao(initialValue.duracao ?? '')
      setFisioterapia(!!initialValue.fisioterapia)
      setAuxiliar(!!initialValue.auxiliar)
      setValorUtente(initialValue.valorUtente ?? 0)
      setValorOrganismo(initialValue.valorOrganismo ?? 0)
      setPercentagemInstituicao(initialValue.percentagemInstituicao ?? null)
      setPrecoEur(initialValue.precoEur ?? null)
      return
    }
    setSearch('')
    setSubsistemaServicoId('')
    setDuracao('')
    setFisioterapia(false)
    setAuxiliar(false)
    setValorUtente(0)
    setValorOrganismo(0)
    setPercentagemInstituicao(null)
    setPrecoEur(null)
  }, [open, initialValue])

  useEffect(() => {
    if (!open) return
    if (!selectedMeta?.ss) return
    // Defaults a partir do SubsistemaServico (tabela de valores)
    setValorUtente(selectedMeta.ss.valorUtente ?? 0)
    setValorOrganismo(selectedMeta.ss.valorOrganismo ?? 0)
    setPercentagemInstituicao(selectedMeta.ss.margemOrganismoPercent ?? null)
    setPrecoEur(selectedMeta.ss.valorServico ?? null)
  }, [open, selectedMeta?.ss?.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Inserção/edição de linha Organismo/Serviço.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label>Organismo/Serviço</Label>
            <div className='flex items-center gap-2'>
              <div className='flex-1 min-w-0'>
                <AsyncCombobox
                  value={subsistemaServicoId}
                  onChange={setSubsistemaServicoId}
                  items={items}
                  isLoading={false}
                  placeholder='Organismo/Serviço...'
                  searchPlaceholder='Procurar...'
                  emptyText='Sem resultados.'
                  disabled={!open}
                  searchValue={search}
                  onSearchValueChange={setSearch}
                />
              </div>
              <Button type='button' variant='outline' size='icon' title='Selecionar'>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='grid gap-2'>
            <Label>Duração</Label>
            <Input
              value={duracao}
              placeholder='00:00'
              onChange={(e) => {
                setDuracao(formatDurationOnChange(e.target.value))
              }}
              onBlur={(e) => {
                // ao sair do campo normaliza para HH:MM
                const formatted = formatDuration(e.target.value)
                setDuracao(formatted)
              }}
            />
          </div>

          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='fisioterapia'
                checked={fisioterapia}
                onCheckedChange={(v) => setFisioterapia(v === true)}
              />
              <Label htmlFor='fisioterapia'>Fisioterapia</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='auxiliar'
                checked={auxiliar}
                onCheckedChange={(v) => setAuxiliar(v === true)}
              />
              <Label htmlFor='auxiliar'>Auxiliar</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={() => {
              const ss = selectedMeta?.ss
              const serv = selectedMeta?.serv
              const row: PatologiaServicoRow = {
                tempId: initialValue?.tempId ?? `new-${Date.now()}`,
                subsistemaServicoId,
                codigoServico: serv?.id ?? ss?.servicoId ?? null,
                descricaoServico: serv?.designacao ?? null,
                subSistema: null,
                duracao: duracao || null,
                ordem: initialValue?.ordem ?? nextOrdem,
                fisioterapia,
                auxiliar,
                valorUtente: valorUtente ?? 0,
                valorOrganismo: valorOrganismo ?? 0,
                percentagemInstituicao,
                precoEur,
                observacoes: initialValue?.observacoes ?? null,
              }
              onConfirm(row)
              onOpenChange(false)
            }}
            disabled={!subsistemaServicoId}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

