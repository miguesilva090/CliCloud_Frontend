import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { toast } from '@/utils/toast-utils'
import { NotificacaoTipoService } from '@/lib/services/notificacoes/notificacao-tipo-service'
import { NotificacaoService } from '@/lib/services/notificacoes/notificacao-service'
import { ResponseStatus } from '@/types/api/responses'

interface NotificacaoCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NotificacaoCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: NotificacaoCreateModalProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('0')
  const [estado, setEstado] = useState('0')
  const [tipoId, setTipoId] = useState<string>('')
  const [destinatarioId, setDestinatarioId] = useState('')

  const tiposQuery = useQuery({
    queryKey: ['notificacao-tipos', 'light', 'create-modal'],
    queryFn: () => NotificacaoTipoService().getNotificacaoTiposLight(''),
    enabled: open,
    staleTime: 60 * 1000,
  })

  const tipos = tiposQuery.data?.info?.data ?? []

  useEffect(() => {
    if (open) {
      setTitulo('')
      setDescricao('')
      setPrioridade('0')
      setEstado('0')
      setTipoId('')
      setDestinatarioId('')
    }
  }, [open])

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      toast.error('Título é obrigatório.')
      return
    }
    if (!tipoId) {
      toast.error('Selecione um tipo de notificação.')
      return
    }

    let destGuid: string | null = null
    if (destinatarioId.trim()) {
      const g = destinatarioId.trim()
      if (!/^[0-9a-fA-F-]{36}$/.test(g)) {
        toast.error('ID do destinatário deve ser um GUID válido.')
        return
      }
      destGuid = g
    }

    try {
      const res = await NotificacaoService().createNotificacao({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        estado: Number(estado) || 0,
        prioridade: Number(prioridade) || 0,
        notificacaoTipoId: tipoId,
        destinatarioUtilizadorId: destGuid,
        clinicaDestinoId: null,
      })
      if (res.info.status === ResponseStatus.Success) {
        toast.success('Notificação criada.')
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
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Nova notificação</DialogTitle>
        </DialogHeader>
        <div className='grid gap-3 py-2'>
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
              placeholder='Assunto da notificação'
            />
          </div>
          <div className='grid gap-2'>
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={descricao}
              rows={3}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder='Corpo da mensagem'
            />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='grid gap-2'>
              <Label>Estado</Label>
              <Input
                type='number'
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Prioridade</Label>
              <Input
                type='number'
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
              />
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>Destinatário (GUID do utilizador, opcional)</Label>
            <Input
              value={destinatarioId}
              onChange={(e) => setDestinatarioId(e.target.value)}
              placeholder='Vazio = atualização só com clínica no servidor'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleGuardar}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
