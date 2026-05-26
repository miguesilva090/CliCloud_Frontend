import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import { MarcacoesAgendaMedicosToolbar } from '../components/marcacoes-agenda-medicos-toolbar'
import { MarcacoesAgendaAcoesToolbar } from '../components/marcacoes-agenda-acoes-toolbar'
import { MarcacoesAgendaCalendario } from '../components/marcacoes-agenda-calendario'
import { MarcacoesAgendaLegenda } from '../components/marcacoes-agenda-legenda'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { MarcacaoAdministrativoViewEditModal } from '../modals/marcacao-administrativo-view-edit-modal'
import { MarcacaoAdministrativoDesmarcarModal } from '../modals/marcacao-administrativo-desmarcar-modal'
import { MarcacaoAssociarSalaModal } from '../modals/marcacao-associar-sala-modal'
import { MarcacoesRelatoriosModal } from '../modals/marcacoes-relatorios-modal'
import { MarcacoesEnvioSmsModal } from '../modals/marcacoes-envio-sms-modal'
import {
  defaultMarcacoesListCriteria,
  type MarcacoesListCriteria,
} from '../utils/marcacoes-list-criteria'
import { invalidateMarcacoesAdministrativoQueries } from '../queries/listagem-marcacoes-administrativo-queries'
import { toast } from '@/utils/toast-utils'
import {
  hasMarcacoesAgendaUrlPrefill,
  parseMarcacoesAgendaSearchParams,
} from '../utils/marcacoes-agenda-url-prefill'
import { resolveMarcacoesAgendaUrlPrefill } from '../utils/resolve-marcacoes-agenda-url-prefill'
import type { MarcacaoAdministrativoFormState } from '../modals/marcacao-administrativo-form-utils'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

type SalaModalState = {
  marcacaoId: string
  data: string
  horaInicio: string
  salaAtualNome?: string | null
} | null

export function ListagemMarcacoesAdministrativoPage() {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const urlPrefillDoneRef = useRef(false)
  const { canChange, canDelete } = useAreaComumEntityListPermissions(listPermId)

  const [listCriteria, setListCriteria] = useState<MarcacoesListCriteria>(
    defaultMarcacoesListCriteria
  )
  const [modoDisponibilidade, setModoDisponibilidade] = useState(false)
  const [selectedMarcacaoId, setSelectedMarcacaoId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [selectedRow, setSelectedRow] = useState<MarcacaoAdministrativoTableDTO | null>(null)
  const [desmarcarOpen, setDesmarcarOpen] = useState(false)
  const [salaOpen, setSalaOpen] = useState(false)
  const [salaModalState, setSalaModalState] = useState<SalaModalState>(null)
  const [relatoriosOpen, setRelatoriosOpen] = useState(false)
  const [smsOpen, setSmsOpen] = useState(false)
  const [createSlotData, setCreateSlotData] = useState<string | undefined>()
  const [createSlotHora, setCreateSlotHora] = useState<string | undefined>()
  const [createPrefill, setCreatePrefill] =
    useState<Partial<MarcacaoAdministrativoFormState> | null>(null)

  const refresh = () => invalidateMarcacoesAdministrativoQueries(queryClient)

  useEffect(() => {
    if (urlPrefillDoneRef.current) return
    const raw = parseMarcacoesAgendaSearchParams(searchParams)
    if (!hasMarcacoesAgendaUrlPrefill(raw)) return
    urlPrefillDoneRef.current = true

    void resolveMarcacoesAgendaUrlPrefill(raw, listPermId).then((resolved) => {
      if (Object.keys(resolved.criteriaPatch).length > 0) {
        setListCriteria((prev) => ({ ...prev, ...resolved.criteriaPatch }))
      }
      if (resolved.unresolvedLegacyMedicoKey) {
        toast.error(
          `Parâmetro legado c_medico="${resolved.unresolvedLegacyMedicoKey}" não tem equivalente Guid — selecione o médico na agenda.`
        )
      }
      if (resolved.openCreateModal) {
        setCreatePrefill(resolved.createFormPatch)
        setSelectedRow(null)
        setModalMode('create')
        setModalOpen(true)
      }
    })
  }, [searchParams])

  const handleListCriteriaChange = (next: MarcacoesListCriteria) => {
    setListCriteria(next)
    setSelectedMarcacaoId(null)
  }

  const openCreate = (data?: string, hora?: string) => {
    setSelectedRow(null)
    setCreateSlotData(data)
    setCreateSlotHora(hora)
    setCreatePrefill(
      listCriteria.salaId
        ? { salaId: listCriteria.salaId, salaLabel: listCriteria.salaLabel }
        : null
    )
    setModalMode('create')
    setModalOpen(true)
  }

  const openViewEdit = (row: MarcacaoAdministrativoTableDTO, mode: 'view' | 'edit') => {
    setSelectedRow(row)
    setModalMode(mode)
    setModalOpen(true)
  }

  const openMarcacaoById = async (marcacaoId: string) => {
    try {
      const res = await MarcacoesAdministrativoService(listPermId).getById(marcacaoId)
      if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
        return
      }
      const d = res.info.data
      openViewEdit(
        {
          id: d.id,
          data: d.data ?? null,
          horaInicio: d.horaInicio?.slice(0, 5) ?? null,
          horaFim: d.horaFim?.slice(0, 5) ?? null,
          utenteNumero: d.utenteNumero ?? null,
          utenteNome: d.utenteNome ?? null,
          medicoNome: d.medicoNome ?? null,
          especialidadeDesignacao: d.especialidadeDesignacao ?? null,
        },
        canChange ? 'edit' : 'view'
      )
    } catch {
      /* ignorar */
    }
  }

  const openDesmarcarSelecionada = async () => {
    if (!selectedMarcacaoId) return
    try {
      const res = await MarcacoesAdministrativoService(listPermId).getById(selectedMarcacaoId)
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        const d = res.info.data
        setSelectedRow({
          id: d.id,
          data: d.data ?? null,
          horaInicio: d.horaInicio?.slice(0, 5) ?? null,
        })
        setDesmarcarOpen(true)
      }
    } catch {
      /* ignorar */
    }
  }

  const openAssociarSalaSelecionada = async () => {
    if (!selectedMarcacaoId) return
    try {
      const res = await MarcacoesAdministrativoService(listPermId).getById(selectedMarcacaoId)
      if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
        toast.error('Não foi possível carregar a marcação selecionada.')
        return
      }

      const d = res.info.data
      const data = d.data?.slice(0, 10) ?? ''
      const horaInicio = d.horaInicio?.slice(0, 5) ?? ''
      if (!data || !horaInicio) {
        toast.error('A marcação selecionada não tem data e hora definidas.')
        return
      }

      setSalaModalState({
        marcacaoId: d.id,
        data,
        horaInicio,
        salaAtualNome: d.salaNome,
      })
      setSalaOpen(true)
    } catch {
      toast.error('Erro ao carregar a marcação selecionada.')
    }
  }

  const entrarDisponibilidade = () => {
    if (!listCriteria.especialidadeId) {
      toast.error('Selecione a especialidade na agenda.')
      return
    }
    setModoDisponibilidade(true)
    setSelectedMarcacaoId(null)
  }

  const sairDisponibilidade = () => setModoDisponibilidade(false)

  const handlePickMedicoDisponibilidade = (
    medicoId: string,
    medicoNome: string,
    dataIso: string
  ) => {
    setModoDisponibilidade(false)
    handleListCriteriaChange({
      ...listCriteria,
      medicoId,
      medicoLabel: medicoNome,
      dataDe: dataIso,
      dataAte: dataIso,
    })
    toast.success(`Médico ${medicoNome} — ${dataIso}`)
  }

  return (
    <>
      <PageHead title='Agenda | CliCloud' />
      <DashboardPageContainer className='!m-0 !mt-1 !rounded-none !pt-14 !md:my-0 !md:rounded-none !md:pt-14'>
        <div className='flex flex-col gap-0 overflow-hidden rounded-none border border-t-0 bg-card shadow-sm'>
          <MarcacoesAgendaAcoesToolbar
            canChange={canChange}
            canDelete={canDelete}
            modoDisponibilidade={modoDisponibilidade}
            selectedMarcacaoId={selectedMarcacaoId}
            onDisponibilidade={entrarDisponibilidade}
            onSairDisponibilidade={sairDisponibilidade}
            onEnvioSms={() => setSmsOpen(true)}
            onAssociarSala={openAssociarSalaSelecionada}
            onListagens={() => setRelatoriosOpen(true)}
            onDesmarcar={openDesmarcarSelecionada}
            onRefresh={refresh}
          />

          {!modoDisponibilidade ? (
            <MarcacoesAgendaMedicosToolbar
              criteria={listCriteria}
              onChange={handleListCriteriaChange}
            />
          ) : null}

          <MarcacoesAgendaCalendario
            criteria={listCriteria}
            listPermId={listPermId}
            canChange={canChange}
            modoDisponibilidade={modoDisponibilidade}
            selectedMarcacaoId={selectedMarcacaoId}
            onSelectMarcacao={setSelectedMarcacaoId}
            onWeekRangeChange={(dataDe, dataAte) =>
              handleListCriteriaChange({ ...listCriteria, dataDe, dataAte })
            }
            onPickMedicoDisponibilidade={handlePickMedicoDisponibilidade}
            onCreateSlot={(data, hora) => openCreate(data, hora)}
            onOpenMarcacao={(row) => openViewEdit(row, canChange ? 'edit' : 'view')}
            onOpenMarcacaoById={openMarcacaoById}
            onRefresh={refresh}
          />
          {!modoDisponibilidade ? <MarcacoesAgendaLegenda /> : null}
        </div>
      </DashboardPageContainer>

      <MarcacaoAdministrativoViewEditModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setCreateSlotData(undefined)
            setCreateSlotHora(undefined)
          }
        }}
        mode={modalMode}
        row={selectedRow}
        listPermId={listPermId}
        defaultMedicoId={listCriteria.medicoId}
        defaultEspecialidadeId={listCriteria.especialidadeId}
        defaultData={createSlotData}
        defaultHoraInicio={createSlotHora}
        initialCreatePrefill={createPrefill}
        onSaved={refresh}
      />

      <MarcacaoAdministrativoDesmarcarModal
        open={desmarcarOpen}
        onOpenChange={setDesmarcarOpen}
        row={selectedRow}
        listPermId={listPermId}
        onDesmarcada={() => {
          setSelectedMarcacaoId(null)
          refresh()
        }}
      />

      <MarcacaoAssociarSalaModal
        open={salaOpen}
        onOpenChange={(open) => {
          setSalaOpen(open)
          if (!open) {
            setSalaModalState(null)
          }
        }}
        marcacaoId={salaModalState?.marcacaoId ?? null}
        data={salaModalState?.data ?? ''}
        horaInicio={salaModalState?.horaInicio ?? ''}
        salaAtualNome={salaModalState?.salaAtualNome}
        listPermId={listPermId}
        onSaved={refresh}
      />

      <MarcacoesRelatoriosModal
        open={relatoriosOpen}
        onOpenChange={setRelatoriosOpen}
        listPermId={listPermId}
        criteria={listCriteria}
      />

      <MarcacoesEnvioSmsModal
        open={smsOpen}
        onOpenChange={setSmsOpen}
        listPermId={listPermId}
        defaultMedicoId={listCriteria.medicoId}
        defaultMedicoLabel={listCriteria.medicoLabel}
      />
    </>
  )
}
