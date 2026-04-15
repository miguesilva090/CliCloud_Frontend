import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type {
  AtualizarConfiguracaoEmailAutomaticaRequest,
  ConfiguracaoEmailAutomaticaDTO,
} from '@/types/dtos/core/email.dtos'

type Props = {
  open: boolean
  config: ConfiguracaoEmailAutomaticaDTO | null
  loading?: boolean
  onClose: () => void
  onSave: (payload: AtualizarConfiguracaoEmailAutomaticaRequest) => Promise<void>
  title?: string
  descricaoLabel?: string
  descricaoReadOnly?: boolean
  showDiasAntecedencia?: boolean
}

const placeholdersByCode: Record<string, string[]> = {
  '1': ['Utente', 'Hora', 'Data', 'Medico', 'Especialidade'],
  '2.1': ['Utente', 'Hora', 'Data', 'Fisioterapeuta', 'Nsessao'],
  '2.2': ['Utente', 'Hora', 'Data', 'Fisioterapeuta', 'Nsessao'],
  '2.3': ['Utente', 'Hora', 'Data', 'Fisioterapeuta', 'Nsessao'],
  '3': ['Utente'],
  '6.1': ['Utente', 'Hora', 'Data', 'Medico', 'Especialidade'],
  '6.2': ['Utente', 'Hora', 'Data', 'Medico', 'Especialidade', 'HoraAntiga', 'DataAntiga', 'HoraNova', 'DataNova'],
  '7.1': ['Utente', 'Hora', 'Data', 'Profissional', 'Modalidade'],
  '8.1': ['Utente', 'Médico', 'Especialidade', 'Data', 'Hora'],
  '8.2': ['Utente', 'Fisioterapeuta', 'Nsessao', 'Data', 'Hora'],
  '8.3': ['Utente', 'Data', 'Hora', 'Especialidade'],
  '8.4': ['Utente', 'Data', 'Hora', 'Profissional'],
  'TPL.CONSULTAS': ['Utente', 'Médico', 'Especialidade', 'Data', 'Hora'],
  'TPL.TRATAMENTOS': ['Utente'],
  'TPL.EXAMES': [],
  'TPL.RELATORIOS': [],
}

export function EmailAutomaticaModal({
  open,
  config,
  loading = false,
  onClose,
  onSave,
  title = 'Configuração de Email Automático',
  descricaoLabel = 'Descrição',
  descricaoReadOnly = true,
  showDiasAntecedencia = true,
}: Props) {
  const [ativo, setAtivo] = useState(true)
  const [dias, setDias] = useState('0')
  const [mensagem, setMensagem] = useState('')
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    if (!config) return
    setAtivo(config.ativo === 1)
    setDias(String(config.diasantecedencia))
    setMensagem(config.textomensagem ?? '')
    setDescricao(config.descricao ?? '')
  }, [config])

  const placeholders = useMemo(() => {
    if (!config) return []
    return placeholdersByCode[config.codigo] ?? []
  }, [config])

  const inserirPlaceholder = (placeholder: string) => {
    const token = `@${placeholder}@`
    setMensagem((prev) => (prev.trim() ? `${prev} ${token}`.replace(/\s+/g, ' ').trim() : token))
  }

  const handleSave = async () => {
    if (!config) return
    await onSave({
      codigo: config.codigo,
      descricao: descricao.trim(),
      ativo: ativo ? 1 : 0,
      diasantecedencia: showDiasAntecedencia ? Number(dias) || 0 : 0,
      textomensagem: mensagem.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>Editar template automático de email.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <Label>Código</Label>
              <Input value={config?.codigo ?? ''} readOnly />
            </div>
            <div className='space-y-1'>
              <Label>{descricaoLabel}</Label>
              <Input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                readOnly={descricaoReadOnly}
                disabled={loading}
              />
            </div>
          </div>

          <div className='flex items-center justify-between rounded border p-3'>
            <Label htmlFor='email-auto-ativo'>Ativo</Label>
            <Switch id='email-auto-ativo' checked={ativo} onCheckedChange={setAtivo} disabled={loading} />
          </div>

          {showDiasAntecedencia && (
            <div className='space-y-1'>
              <Label htmlFor='email-auto-dias'>Dias de Antecedência</Label>
              <Input
                id='email-auto-dias'
                type='number'
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className='space-y-1'>
            <Label htmlFor='email-auto-mensagem'>Texto da Mensagem</Label>
            <Textarea
              id='email-auto-mensagem'
              rows={7}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              disabled={loading}
            />
          </div>

          {!!placeholders.length ? (
            <div className='flex flex-wrap gap-2'>
              {placeholders.map((p) => (
                <Button
                  key={`${config?.codigo}-${p}`}
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder(p)}
                  disabled={loading}
                >
                  {p}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSave()} disabled={loading}>
            {loading ? 'A guardar...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
