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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { extrairHorasDisponiveis } from '../utils/global-booking-horas-utils'
import { PedidosConsultaAdministrativoService } from '@/lib/services/consultas/pedidos-consulta-administrativo-service'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'
import { TipoAdmissaoService } from '@/lib/services/consultas/tipo-admissao-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { PedidoConsultaDTO } from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  codigo: number | null
  listPermId: string
  onSaved: () => void
}

function resetFormState() {
  return {
    pedido: null as PedidoConsultaDTO | null,
    utenteId: '',
    medicoId: '',
    especialidadeId: '',
    organismoId: '',
    tipoConsultaId: '',
    tipoAdmissaoId: '',
    data: '',
    hora: '',
    obs: '',
    enviarEmail: true,
    enviarSms: true,
    medSearch: '',
    utSearch: '',
  }
}

export function GlobalBookingAgendarModal({
  open,
  onOpenChange,
  codigo,
  listPermId,
  onSaved,
}: Props) {
  const [pedido, setPedido] = useState<PedidoConsultaDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [utenteId, setUtenteId] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [especialidadeId, setEspecialidadeId] = useState('')
  const [organismoId, setOrganismoId] = useState('')
  const [tipoConsultaId, setTipoConsultaId] = useState('')
  const [tipoAdmissaoId, setTipoAdmissaoId] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [obs, setObs] = useState('')
  const [enviarEmail, setEnviarEmail] = useState(true)
  const [enviarSms, setEnviarSms] = useState(true)
  const [medSearch, setMedSearch] = useState('')
  const [utSearch, setUtSearch] = useState('')
  const [espItems, setEspItems] = useState<Array<{ value: string; label: string }>>([])
  const [orgItems, setOrgItems] = useState<Array<{ value: string; label: string }>>([])
  const [tipoConsultaItems, setTipoConsultaItems] = useState<
    Array<{ value: string; label: string }>
  >([])
  const [tipoAdmissaoItems, setTipoAdmissaoItems] = useState<
    Array<{ value: string; label: string }>
  >([])
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedUt] = useDebounce(utSearch, 300)

  const bloqueadoAgendado = pedido?.agendado === true

  useEffect(() => {
    if (!open) {
      const s = resetFormState()
      setPedido(s.pedido)
      setUtenteId(s.utenteId)
      setMedicoId(s.medicoId)
      setEspecialidadeId(s.especialidadeId)
      setOrganismoId(s.organismoId)
      setTipoConsultaId(s.tipoConsultaId)
      setTipoAdmissaoId(s.tipoAdmissaoId)
      setData(s.data)
      setHora(s.hora)
      setObs(s.obs)
      setEnviarEmail(s.enviarEmail)
      setEnviarSms(s.enviarSms)
      setMedSearch(s.medSearch)
      setUtSearch(s.utSearch)
    }
  }, [open])

  const medicosQuery = useQuery({
    queryKey: ['gb-agendar', 'medicos', debouncedMed],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedMed),
    enabled: open,
  })

  const utentesQuery = useQuery({
    queryKey: ['gb-agendar', 'utentes', debouncedUt],
    queryFn: () => UtentesService(listPermId).getUtentesLight(debouncedUt),
    enabled: open && debouncedUt.length >= 2,
  })

  const calendarioQuery = useQuery({
    queryKey: ['gb-agendar', 'calendario', medicoId, especialidadeId, data],
    queryFn: () =>
      MarcacoesAdministrativoService(listPermId).getCalendario({
        medicoId,
        especialidadeId: especialidadeId || undefined,
        dataDe: `${data}T00:00:00`,
        dataAte: `${data}T00:00:00`,
      }),
    enabled: open && !!medicoId && !!data && !bloqueadoAgendado,
  })

  const horasDisponiveis = useMemo(() => {
    if (!data || calendarioQuery.data?.info?.status !== ResponseStatus.Success) {
      return []
    }
    return extrairHorasDisponiveis(calendarioQuery.data.info.data, data)
  }, [calendarioQuery.data, data])

  useEffect(() => {
    if (horasDisponiveis.length && hora && !horasDisponiveis.includes(hora)) {
      setHora('')
    }
  }, [horasDisponiveis, hora])

  useEffect(() => {
    if (!open || !codigo) return
    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const [pedidoRes, espRes, orgRes, tiposRes, tiposAdmRes] = await Promise.all([
          PedidosConsultaAdministrativoService(listPermId).getById(codigo),
          EspecialidadeService(listPermId).getEspecialidadesLight(''),
          OrganismoService(listPermId).getOrganismosLight(''),
          TipoConsultaService(listPermId).getTiposConsultaLight(''),
          TipoAdmissaoService(listPermId).getTiposAdmissaoLight(''),
        ])

        if (cancelled || pedidoRes.info?.status !== ResponseStatus.Success || !pedidoRes.info.data) {
          return
        }

        const p = pedidoRes.info.data
        setPedido(p)
        setData(p.data?.slice(0, 10) ?? '')
        setHora(p.hora?.slice(0, 5) ?? '')
        setMedSearch(p.medico ?? p.codigoMedico ?? '')
        setEnviarEmail(true)
        setEnviarSms(true)

        if (p.agendado && p.codigoAdmissao) {
          toast.info(
            `Já existe agendamento para este pedido (admissão legado ${p.codigoAdmissao}).`
          )
        }

        if (p.codigoMedico) {
          const medRes = await MarcacoesAdministrativoService(listPermId).resolveMedicoLegado(
            p.codigoMedico
          )
          if (medRes.info?.status === ResponseStatus.Success && medRes.info.data?.medicoId) {
            setMedicoId(medRes.info.data.medicoId)
          }
        }

        const espList = espRes.info?.data ?? []
        setEspItems(
          espList.map((e: { id: string; nome: string }) => ({
            value: e.id,
            label: e.nome,
          }))
        )
        const espNome = (p.especialidade ?? '').trim().toLowerCase()
        const matchEsp = espList.find(
          (e: { id: string; nome: string }) =>
            e.nome?.trim().toLowerCase() === espNome ||
            e.nome?.trim().toLowerCase().includes(espNome) ||
            espNome.includes(e.nome?.trim().toLowerCase() ?? '')
        )
        if (matchEsp) setEspecialidadeId(matchEsp.id)

        const orgList = orgRes.info?.data ?? []
        setOrgItems(
          orgList.map((o: { id: string; nome?: string }) => ({
            value: o.id,
            label: o.nome ?? o.id,
          }))
        )
        const orgNome = (p.organismo ?? '').trim().toLowerCase()
        const matchOrg = orgList.find(
          (o: { id: string; nome?: string }) =>
            (o.nome ?? '').trim().toLowerCase() === orgNome
        )
        if (matchOrg) setOrganismoId(matchOrg.id)

        const tiposList = tiposRes.info?.data ?? []
        setTipoConsultaItems(
          tiposList.map(
            (t: { id: string; designacao?: string; nome?: string }) => ({
              value: t.id,
              label: t.designacao ?? t.nome ?? t.id,
            })
          )
        )
        const primeira = tiposList.find(
          (t: { id: string; codigoLegado?: number | null }) => t.codigoLegado === 1
        )
        if (primeira) setTipoConsultaId(primeira.id)
        else if (tiposList[0]) setTipoConsultaId(tiposList[0].id)

        const admList = tiposAdmRes.info?.data ?? []
        setTipoAdmissaoItems(
          admList.map(
            (t: { id: string; designacao?: string; nome?: string }) => ({
              value: t.id,
              label: t.designacao ?? t.nome ?? t.id,
            })
          )
        )
        const admDefeito = admList.find(
          (t: { id: string; codigoLegado?: number | null }) => t.codigoLegado === 1
        )
        if (admDefeito) setTipoAdmissaoId(admDefeito.id)
        else if (admList[0]) setTipoAdmissaoId(admList[0].id)
      } catch {
        if (!cancelled) toast.error('Erro ao carregar pedido.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, codigo, listPermId])

  const medicoItems = (medicosQuery.data?.info?.data ?? []).map(
    (m: { id: string; nome: string }) => ({ value: m.id, label: m.nome })
  )
  const utenteItems = (utentesQuery.data?.info?.data ?? []).map(
    (u: { id: string; nome: string; numeroUtente?: string }) => ({
      value: u.id,
      label: [u.numeroUtente, u.nome].filter(Boolean).join(' — '),
    })
  )
  const handleGuardar = async () => {
    if (bloqueadoAgendado) {
      toast.error('Este pedido já está agendado.')
      return
    }
    if (!codigo || !medicoId || !especialidadeId || !organismoId || !data || !hora) {
      toast.error('Preencha médico, especialidade, organismo, data e hora.')
      return
    }
    setSaving(true)
    try {
      const [h, m] = hora.split(':').map(Number)
      const horaSpan = `${String(h).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}:00`
      const res = await PedidosConsultaAdministrativoService(listPermId).guardarMarcacao(codigo, {
        utenteId: utenteId || undefined,
        forcarNovoUtente: !utenteId,
        medicoId,
        especialidadeId,
        organismoId,
        tipoConsultaId: tipoConsultaId || undefined,
        tipoAdmissaoId: tipoAdmissaoId || undefined,
        data: `${data}T00:00:00`,
        hora: horaSpan,
        obs,
        enviarEmail,
        enviarSms,
      })
      if (res.info?.status === ResponseStatus.Success) {
        const avisos = res.info.data?.avisos ?? []
        if (avisos.length) toast.info(avisos.join(' '))
        toast.success('Consulta agendada.')
        onSaved()
        onOpenChange(false)
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível agendar.')
      }
    } catch {
      toast.error('Erro ao agendar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Marcar consulta — GlobalBooking</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className='text-muted-foreground text-sm'>A carregar…</p>
        ) : bloqueadoAgendado ? (
          <p className='text-destructive text-sm'>
            Este pedido já está agendado
            {pedido?.codigoAdmissao
              ? ` (admissão legado ${pedido.codigoAdmissao}).`
              : '.'}
          </p>
        ) : (
          <div className='space-y-3'>
            <p className='text-sm'>
              <span className='font-medium'>Utente:</span> {pedido?.nome ?? '—'}
            </p>
            {pedido?.especialidade && (
              <p className='text-sm text-muted-foreground'>
                Pedido: {pedido.especialidade} · {pedido.medico ?? pedido.codigoMedico}
              </p>
            )}
            <div>
              <Label>Utente existente (opcional)</Label>
              <AsyncCombobox
                value={utenteId}
                onChange={setUtenteId}
                items={utenteItems}
                placeholder='Deixar vazio para criar ficha'
                searchPlaceholder='Pesquisar utente…'
                onSearchChange={setUtSearch}
              />
            </div>
            <div>
              <Label>Médico</Label>
              <AsyncCombobox
                value={medicoId}
                onChange={setMedicoId}
                items={medicoItems}
                placeholder='Médico…'
                searchPlaceholder='Pesquisar…'
                onSearchChange={setMedSearch}
              />
            </div>
            <div>
              <Label>Especialidade</Label>
              <AsyncCombobox
                value={especialidadeId}
                onChange={setEspecialidadeId}
                items={espItems}
                placeholder={pedido?.especialidade ?? 'Especialidade…'}
                searchPlaceholder='Pesquisar…'
                onSearchChange={() => {}}
              />
            </div>
            <div>
              <Label>Organismo</Label>
              <AsyncCombobox
                value={organismoId}
                onChange={setOrganismoId}
                items={orgItems}
                placeholder='Organismo…'
                searchPlaceholder='Pesquisar…'
                onSearchChange={() => {}}
              />
            </div>
            <div>
              <Label>Tipo de consulta</Label>
              <AsyncCombobox
                value={tipoConsultaId}
                onChange={setTipoConsultaId}
                items={tipoConsultaItems}
                placeholder='Tipo consulta…'
                searchPlaceholder='Pesquisar…'
                onSearchChange={() => {}}
              />
            </div>
            <div>
              <Label>Tipo de admissão</Label>
              <AsyncCombobox
                value={tipoAdmissaoId}
                onChange={setTipoAdmissaoId}
                items={tipoAdmissaoItems}
                placeholder='Tipo admissão…'
                searchPlaceholder='Pesquisar…'
                onSearchChange={() => {}}
              />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Label>Data</Label>
                <Input type='date' value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div>
                <Label>Hora</Label>
                {horasDisponiveis.length > 0 ? (
                  <Select value={hora} onValueChange={setHora}>
                    <SelectTrigger className='mt-0'>
                      <SelectValue placeholder='Selecionar hora…' />
                    </SelectTrigger>
                    <SelectContent>
                      {horasDisponiveis.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type='time'
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    disabled={!medicoId || !data || calendarioQuery.isFetching}
                  />
                )}
                {medicoId && data && calendarioQuery.isFetching && (
                  <p className='text-muted-foreground text-xs mt-1'>A carregar horas…</p>
                )}
                {medicoId &&
                  data &&
                  !calendarioQuery.isFetching &&
                  horasDisponiveis.length === 0 && (
                    <p className='text-muted-foreground text-xs mt-1'>
                      Sem horas livres neste dia — pode indicar manualmente.
                    </p>
                  )}
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} />
            </div>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox checked={enviarEmail} onCheckedChange={(v) => setEnviarEmail(!!v)} />
              Enviar email agendamento
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox checked={enviarSms} onCheckedChange={(v) => setEnviarSms(!!v)} />
              Enviar SMS agendamento
            </label>
          </div>
        )}
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleGuardar()}
            disabled={saving || loading || bloqueadoAgendado}
          >
            Guardar marcação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
