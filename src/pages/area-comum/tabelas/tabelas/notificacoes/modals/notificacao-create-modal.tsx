import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast-utils'
import { NotificacaoTipoService } from '@/lib/services/notificacoes/notificacao-tipo-service'
import { NotificacaoService } from '@/lib/services/notificacoes/notificacao-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { TecnicoClient } from '@/lib/services/saude/tecnico-service/tecnico-client'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { ResponseStatus } from '@/types/api/responses'
import type { MedicoLightDTO } from '@/types/dtos/saude/medicos.dtos'
import type { TecnicoLightDTO } from '@/types/dtos/saude/tecnicos.dtos'
import type { UtenteLightDTO } from '@/types/dtos/saude/utentes.dtos'

interface NotificacaoCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/** Opções alinhadas a NotificacaoLabels no backend (prioridade pré-definida 2 no legado ao adicionar). */
const PRIORIDADE_OPCOES = [
  { value: '0', label: 'Baixa' },
  { value: '1', label: 'Normal' },
  { value: '2', label: 'Alta' },
  { value: '3', label: 'Urgente' },
]

const ESTADO_OPCOES = [
  { value: '0', label: 'Pendente' },
  { value: '1', label: 'Lida' },
  { value: '2', label: 'Em progresso' },
  { value: '3', label: 'Atualização clínica' },
]

type Alcance = 'empresa' | 'utilizadores'

type LinhaDestinatario = {
  utilizadorId: string
  nome: string
  papel: string
}

function buildDestinatariosRows(
  medicos: MedicoLightDTO[],
  tecnicos: TecnicoLightDTO[],
  utentes: UtenteLightDTO[],
): LinhaDestinatario[] {
  const map = new Map<string, LinhaDestinatario>()
  for (const m of medicos) {
    const uid = m.idUtilizador?.trim()
    if (!uid) continue
    const nome = (m.nome ?? '').trim() || uid
    if (!map.has(uid))
      map.set(uid, { utilizadorId: uid, nome, papel: 'Médico' })
  }
  for (const t of tecnicos) {
    const uid = t.idUtilizador?.trim()
    if (!uid) continue
    const nome = (t.nome ?? '').trim() || uid
    if (!map.has(uid))
      map.set(uid, { utilizadorId: uid, nome, papel: 'Técnico' })
  }
  for (const u of utentes) {
    const uid = u.idUtilizador?.trim()
    if (!uid) continue
    const nome = (u.nome ?? '').trim() || uid
    if (!map.has(uid))
      map.set(uid, { utilizadorId: uid, nome, papel: 'Utente' })
  }
  return [...map.values()].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }),
  )
}

export function NotificacaoCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: NotificacaoCreateModalProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('2')
  const [estado, setEstado] = useState('0')
  const [tipoId, setTipoId] = useState<string>('')
  const [alcance, setAlcance] = useState<Alcance>('utilizadores')
  const [filtroNomes, setFiltroNomes] = useState('')
  const [filtroDebounced] = useDebounce(filtroNomes, 300)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

  const tiposQuery = useQuery({
    queryKey: ['notificacao-tipos', 'light', 'create-modal'],
    queryFn: () => NotificacaoTipoService().getNotificacaoTiposLight(''),
    enabled: open,
    staleTime: 60 * 1000,
  })

  const medicosQuery = useQuery({
    queryKey: ['medicos-light', 'notif-create', filtroDebounced],
    queryFn: () => MedicosService('area-comum-notificacoes').getMedicosLight(filtroDebounced),
    enabled: open && alcance === 'utilizadores',
    staleTime: 30 * 1000,
  })

  const tecnicosQuery = useQuery({
    queryKey: ['tecnicos-light', 'notif-create', filtroDebounced],
    queryFn: () =>
      new TecnicoClient('area-comum-notificacoes').getTecnicosLight(filtroDebounced),
    enabled: open && alcance === 'utilizadores',
    staleTime: 30 * 1000,
  })

  const utentesQuery = useQuery({
    queryKey: ['utentes-light', 'notif-create', filtroDebounced],
    queryFn: () =>
      UtentesService('area-comum-notificacoes').getUtentesLight(filtroDebounced),
    enabled: open && alcance === 'utilizadores',
    staleTime: 30 * 1000,
  })

  const tipos = tiposQuery.data?.info?.data ?? []
  const medicos = (medicosQuery.data?.info?.data ?? []) as MedicoLightDTO[]
  const tecnicos = (tecnicosQuery.data?.info?.data ?? []) as TecnicoLightDTO[]
  const utentes = (utentesQuery.data?.info?.data ?? []) as UtenteLightDTO[]

  const linhasDestinatarios = useMemo(
    () => buildDestinatariosRows(medicos, tecnicos, utentes),
    [medicos, tecnicos, utentes],
  )

  const carregandoLista =
    alcance === 'utilizadores' &&
    (medicosQuery.isFetching ||
      tecnicosQuery.isFetching ||
      utentesQuery.isFetching)

  useEffect(() => {
    if (open) {
      setTitulo('')
      setDescricao('')
      setPrioridade('2')
      setEstado('0')
      setTipoId('')
      setAlcance('utilizadores')
      setFiltroNomes('')
      setSelecionados(new Set())
    }
  }, [open])

  const toggleSelecionado = (utilizadorId: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(utilizadorId)) next.delete(utilizadorId)
      else next.add(utilizadorId)
      return next
    })
  }

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      toast.error('Título é obrigatório.')
      return
    }
    if (!descricao.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }
    if (!tipoId) {
      toast.error('Selecione um tipo de notificação.')
      return
    }

    let destinatariosUtilizadorIds: string[] | undefined
    if (alcance === 'utilizadores') {
      destinatariosUtilizadorIds = [...selecionados]
      if (destinatariosUtilizadorIds.length === 0) {
        toast.error('Selecione pelo menos um utilizador.')
        return
      }
    }

    try {
      const res = await NotificacaoService('area-comum-notificacoes').createNotificacao({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        estado: Number(estado) || 0,
        prioridade: Number(prioridade) || 0,
        notificacaoTipoId: tipoId,
        ...(alcance === 'utilizadores'
          ? { destinatariosUtilizadorIds }
          : { destinatarioUtilizadorId: null }),
        clinicaDestinoId: null,
      })
      if (res.info.status === ResponseStatus.Success && res.info.data) {
        const n = res.info.data.length
        toast.success(n > 1 ? `${n} notificações criadas.` : 'Notificação criada.')
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(res.info.messages?.['$']?.[0] ?? 'Falha ao criar.')
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? 'Erro ao criar.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Nova notificação</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label>Tipo</Label>
            <Select value={tipoId} onValueChange={setTipoId}>
              <SelectTrigger>
                <SelectValue placeholder='Selecionar tipo…' />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.designacaoTipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tiposQuery.isError ? (
              <p className='text-xs text-destructive'>Não foi possível carregar os tipos.</p>
            ) : null}
          </div>

          <div className='grid gap-2'>
            <Label>Título</Label>
            <Input
              value={titulo}
              maxLength={500}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder='Titulo…'
            />
          </div>

          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              rows={6}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder='Descrição…'
            />
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label>Estado inicial</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_OPCOES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADE_OPCOES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid gap-3 rounded-lg border p-3'>
            <Label className='text-base'>Destinatários</Label>
            <RadioGroup
              value={alcance}
              onValueChange={(v) => setAlcance(v as Alcance)}
              className='grid gap-3'
            >
              <div className='flex items-center gap-3'>
                <RadioGroupItem value='utilizadores' id='alc-util' />
                <Label htmlFor='alc-util' className='cursor-pointer font-normal'>
                  Utilizadores
                </Label>
              </div>
              <div className='flex items-center gap-3'>
                <RadioGroupItem value='empresa' id='alc-emp' />
                <Label htmlFor='alc-emp' className='cursor-pointer font-normal'>
                  Empresa
                </Label>
              </div>
            </RadioGroup>

            {alcance === 'utilizadores' ? (
              <div className='grid gap-3 pt-1'>
                <div className='grid gap-2'>
                  <Label htmlFor='filtro-dest'>Procurar por nome</Label>
                  <Input
                    id='filtro-dest'
                    value={filtroNomes}
                    onChange={(e) => setFiltroNomes(e.target.value)}
                    placeholder='Filtrar por nome…'
                  />
                </div>
                <Label>Destinatários</Label>
                <div className='max-h-48 overflow-y-auto rounded-md border p-2'>
                  {carregandoLista ? (
                    <p className='py-6 text-center text-sm text-muted-foreground'>
                      A carregar…
                    </p>
                  ) : linhasDestinatarios.length === 0 ? (
                    <p className='py-6 text-center text-sm text-muted-foreground'>
                      Nenhum resultado.
                    </p>
                  ) : (
                    <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                      {linhasDestinatarios.map((row) => (
                        <li key={row.utilizadorId} className='flex items-start gap-2'>
                          <Checkbox
                            id={`dest-${row.utilizadorId}`}
                            checked={selecionados.has(row.utilizadorId)}
                            onCheckedChange={() => toggleSelecionado(row.utilizadorId)}
                            className='mt-0.5'
                          />
                          <label
                            htmlFor={`dest-${row.utilizadorId}`}
                            className='cursor-pointer text-sm leading-tight'
                          >
                            <span className='font-medium'>{row.nome}</span>
                            <span className='ml-1 text-xs text-muted-foreground'>({row.papel})</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {selecionados.size > 0 ? (
                  <p className='text-xs text-muted-foreground'>
                    {selecionados.size} selecionado(s).
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleGuardar}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
