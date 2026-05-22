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
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { SmsService } from '@/lib/services/core/sms-service'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { pickUtenteTelefone } from '../utils/pick-utente-telefone'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listPermId: string
  defaultMedicoId?: string
  defaultMedicoLabel?: string
}

type Step = 'filtro' | 'lista' | 'enviar'

export function MarcacoesEnvioSmsModal({
  open,
  onOpenChange,
  listPermId,
  defaultMedicoId,
  defaultMedicoLabel,
}: Props) {
  const [step, setStep] = useState<Step>('filtro')
  const [data, setData] = useState(getDataTrabalhoIsoDate())
  const [medicoId, setMedicoId] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [marcacoes, setMarcacoes] = useState<MarcacaoAdministrativoTableDTO[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [selectedMarcacao, setSelectedMarcacao] = useState<MarcacaoAdministrativoTableDTO | null>(
    null
  )
  const [telefone, setTelefone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingContacto, setLoadingContacto] = useState(false)

  const medicosQuery = useQuery({
    queryKey: ['sms-filtro', 'medicos', debouncedMed],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedMed),
    enabled: open,
  })

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }, [medicosQuery.data])

  useEffect(() => {
    if (!open) return
    setStep('filtro')
    setData(getDataTrabalhoIsoDate())
    setMedicoId(defaultMedicoId ?? '')
    setMedSearch(defaultMedicoLabel ?? '')
    setMarcacoes([])
    setSelectedMarcacao(null)
    setTelefone('')
    setMensagem('')
  }, [open, defaultMedicoId, defaultMedicoLabel])

  const handleFiltrar = async () => {
    if (!data || !medicoId) {
      toast.error('Indique data e médico.')
      return
    }
    setLoadingLista(true)
    try {
      const res = await MarcacoesAdministrativoService(listPermId).getPaginated({
        pageNumber: 1,
        pageSize: 500,
        dataDe: `${data}T00:00:00`,
        dataAte: `${data}T23:59:59`,
        medicoId,
        apenasAtivas: true,
      })
      const items = res.info?.data ?? []
      if (!res.info) {
        toast.error('Não foi possível obter marcações.')
        return
      }
      setMarcacoes(items)
      setStep('lista')
      if (items.length === 0) {
        toast.info('Sem marcações neste dia para o médico selecionado.')
      }
    } catch {
      toast.error('Erro ao carregar marcações.')
    } finally {
      setLoadingLista(false)
    }
  }

  const abrirEnvio = (row: MarcacaoAdministrativoTableDTO) => {
    setSelectedMarcacao(row)
    setTelefone('')
    setMensagem('')
    setStep('enviar')
  }

  useEffect(() => {
    if (step !== 'enviar' || !selectedMarcacao?.id) return
    let cancelled = false
    setLoadingContacto(true)
    void MarcacoesAdministrativoService(listPermId)
      .getById(selectedMarcacao.id)
      .then(async (res) => {
        if (cancelled || res.info?.status !== ResponseStatus.Success || !res.info.data) return
        const utenteId = res.info.data.utenteId
        if (!utenteId) return
        const utRes = await UtentesService(listPermId).getUtente(utenteId)
        if (cancelled || utRes.info?.status !== ResponseStatus.Success || !utRes.info.data) return
        const tel = pickUtenteTelefone(utRes.info.data.entidadeContactos)
        if (tel) setTelefone(tel)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingContacto(false)
      })
    return () => {
      cancelled = true
    }
  }, [step, selectedMarcacao?.id, listPermId])

  const handleSend = async () => {
    if (!telefone.trim() || !mensagem.trim()) {
      toast.error('Indique telefone e mensagem.')
      return
    }
    setSending(true)
    try {
      const res = await SmsService(listPermId).enviarTeste({
        numeroDestinatario: telefone.trim(),
        textoMensagem: mensagem.trim(),
        modulo: 'MarcacoesAdm',
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('SMS enviado.')
        setStep('lista')
        setSelectedMarcacao(null)
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível enviar SMS.')
      }
    } catch {
      toast.error('Erro ao enviar SMS.')
    } finally {
      setSending(false)
    }
  }

  const titulo =
    step === 'filtro'
      ? 'Filtragem para Envio SMS'
      : step === 'lista'
        ? 'Marcações — envio SMS'
        : `Envio SMS${selectedMarcacao?.utenteNome ? ` — ${selectedMarcacao.utenteNome}` : ''}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={step === 'lista' ? 'max-w-lg' : 'max-w-md'}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>

        {step === 'filtro' ? (
          <div className='space-y-3'>
            <div>
              <Label>Hora</Label>
              <Input
                type='date'
                className='mt-1'
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div>
              <Label>Cód. Médico</Label>
              <div className='mt-1'>
                <AsyncCombobox
                  value={medicoId}
                  onChange={setMedicoId}
                  searchValue={medSearch}
                  onSearchValueChange={setMedSearch}
                  items={medicoItems}
                  isLoading={medicosQuery.isFetching}
                  placeholder='Médico…'
                  searchPlaceholder='Pesquisar…'
                  emptyText='Sem resultados'
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 'lista' ? (
          <div className='max-h-72 space-y-2 overflow-y-auto'>
            {marcacoes.map((m) => (
              <div
                key={m.id}
                className='flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-sm'
              >
                <span className='min-w-0 truncate'>
                  {[m.horaInicio, m.utenteNumero, m.utenteNome].filter(Boolean).join(' — ')}
                </span>
                <Button type='button' size='sm' variant='outline' onClick={() => abrirEnvio(m)}>
                  SMS
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {step === 'enviar' ? (
          <div className='space-y-3'>
            <div>
              <Label>Telemóvel</Label>
              <Input
                className='mt-1'
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder={loadingContacto ? 'A carregar contacto…' : '+351…'}
                disabled={loadingContacto}
              />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea
                className='mt-1'
                rows={4}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {step === 'filtro' ? (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button type='button' disabled={loadingLista} onClick={handleFiltrar}>
                {loadingLista ? 'A carregar…' : 'Adicionar'}
              </Button>
            </>
          ) : null}
          {step === 'lista' ? (
            <>
              <Button type='button' variant='outline' onClick={() => setStep('filtro')}>
                Voltar
              </Button>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </>
          ) : null}
          {step === 'enviar' ? (
            <>
              <Button type='button' variant='outline' onClick={() => setStep('lista')}>
                Cancelar
              </Button>
              <Button type='button' disabled={sending} onClick={handleSend}>
                {sending ? 'A enviar…' : 'Enviar'}
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
