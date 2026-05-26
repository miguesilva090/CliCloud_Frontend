import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RotateCw } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { usePageData, type PageFilter } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { PedidosConsultaAdministrativoService } from '@/lib/services/consultas/pedidos-consulta-administrativo-service'
import type { PedidoConsultaTableDTO } from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'
import { ListagemGlobalBookingTable } from '../components/listagem-global-booking-table'
import { GlobalBookingRowActions } from '../components/global-booking-row-actions'
import type { GlobalBookingRowActionsHandlers } from '../components/global-booking-row-actions'
import { GlobalBookingToolbarPresets } from '../components/global-booking-toolbar-presets'
import { GlobalBookingAgendarModal } from '../modals/global-booking-agendar-modal'
import {
  invalidateGlobalBookingQueries,
  useGetGlobalBookingPaginated,
  usePrefetchAdjacentGlobalBooking,
} from '../queries/listagem-global-booking-queries'
import { buildUtenteCandidatosConfirmMessage } from '../utils/global-booking-utente-candidatos'
const listPermId = modules.areaAdministrativa.permissions.globalBooking.id
const PAGE_TITLE = 'Pedidos de Consulta'

export function ListagemGlobalBookingPage() {
  const queryClient = useQueryClient()
  const { canView, canChange } = useAreaComumEntityListPermissions(listPermId)
  const [agendarOpen, setAgendarOpen] = useState(false)
  const [agendarCodigo, setAgendarCodigo] = useState<number | null>(null)

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetGlobalBookingPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentGlobalBooking,
  })

  const rows = data?.info?.data ?? []
  const total = data?.info?.totalCount ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const refresh = () => invalidateGlobalBookingQueries(queryClient)

  const downloadFicheiro = async (codigo: number) => {
    try {
      const res = await PedidosConsultaAdministrativoService(listPermId).downloadFicheiro(codigo)
      if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
        toast.error('Não foi possível obter o ficheiro.')
        return
      }
      const link = document.createElement('a')
      link.href = `data:application/octet-stream;base64,${res.info.data.conteudoBase64}`
      link.download = res.info.data.nome
      link.click()
    } catch {
      toast.error('Erro no download.')
    }
  }

  const addUtente = async (row: PedidoConsultaTableDTO, forcar = false) => {
    if (row.agendado) {
      toast.info('Este pedido de consulta já foi agendado.')
      return
    }
    try {
      const cand = await PedidosConsultaAdministrativoService(listPermId).getUtentesCandidatos(
        row.codigo
      )
      if (
        !forcar &&
        cand.info?.status === ResponseStatus.Success &&
        cand.info.data &&
        (cand.info.data.existeNif ||
          cand.info.data.existeNome ||
          cand.info.data.existeEmail ||
          cand.info.data.existeTelemovel)
      ) {
        const ok = window.confirm(buildUtenteCandidatosConfirmMessage(cand.info.data))
        if (!ok) return
        return addUtente(row, true)
      }
      const res = await PedidosConsultaAdministrativoService(listPermId).criarUtente(
        row.codigo,
        forcar
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Utente criado.')
        refresh()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível criar utente.')
      }
    } catch {
      toast.error('Erro ao criar utente.')
    }
  }

  const setRecusado = async (row: PedidoConsultaTableDTO, recusado: boolean) => {
    try {
      const res = await PedidosConsultaAdministrativoService(listPermId).setRecusado(
        row.codigo,
        recusado
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success(recusado ? 'Pedido recusado.' : 'Recusa revertida.')
        refresh()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Erro ao atualizar.')
      }
    } catch {
      toast.error('Erro ao atualizar pedido.')
    }
  }

  const enviarEmail = async (codigo: number, tipo: number) => {
    try {
      const res = await PedidosConsultaAdministrativoService(listPermId).enviarEmail(codigo, tipo)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Email enviado.')
        refresh()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Falha no envio.')
      }
    } catch {
      toast.error('Erro ao enviar email.')
    }
  }

  const enviarSms = async (codigo: number, tipo: number) => {
    try {
      const res = await PedidosConsultaAdministrativoService(listPermId).enviarSms(codigo, tipo)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('SMS enviado.')
        refresh()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Falha no envio.')
      }
    } catch {
      toast.error('Erro ao enviar SMS.')
    }
  }

  const rowHandlers: GlobalBookingRowActionsHandlers = {
    onMarcar: (row) => {
      setAgendarCodigo(row.codigo)
      setAgendarOpen(true)
    },
    onDownloadFicheiro: (codigo) => void downloadFicheiro(codigo),
    onAddUtente: (row) => void addUtente(row),
    onRecusar: (row) => void setRecusado(row, true),
    onReverterRecusado: (row) => void setRecusado(row, false),
    onEmailAgendado: (codigo) => void enviarEmail(codigo, 2),
    onSmsAgendado: (codigo) => void enviarSms(codigo, 4),
    onEmailPedido: (codigo) => void enviarEmail(codigo, 1),
    onSmsPedido: (codigo) => void enviarSms(codigo, 3),
  }

  if (!canView) {
    return (
      <AreaComumListagemPageShell title={PAGE_TITLE}>
        <p className='text-muted-foreground text-sm'>Sem permissão para ver pedidos de consulta.</p>
      </AreaComumListagemPageShell>
    )
  }

  return (
    <AreaComumListagemPageShell title={PAGE_TITLE}>
      <DashboardPageContainer>
        <PageHead title={PAGE_TITLE} />
        <GlobalBookingToolbarPresets
          filters={filters as PageFilter[]}
          onFiltersChange={handleFiltersChange}
        />
        <ListagemGlobalBookingTable
          data={rows}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={total}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          toolbarActions={[
            {
              label: 'Atualizar',
              icon: <RotateCw className='h-4 w-4' />,
              onClick: refresh,
              variant: 'outline',
            },
          ]}
          renderRowActions={(row) => (
            <GlobalBookingRowActions row={row} canChange={canChange} handlers={rowHandlers} />
          )}
        />
        {isError ? (
          <p className='text-destructive text-sm mt-2'>
            {error instanceof Error ? error.message : 'Erro ao carregar pedidos.'}
          </p>
        ) : null}
      </DashboardPageContainer>

      <GlobalBookingAgendarModal
        open={agendarOpen}
        onOpenChange={setAgendarOpen}
        codigo={agendarCodigo}
        listPermId={listPermId}
        onSaved={refresh}
      />
    </AreaComumListagemPageShell>
  )
}
