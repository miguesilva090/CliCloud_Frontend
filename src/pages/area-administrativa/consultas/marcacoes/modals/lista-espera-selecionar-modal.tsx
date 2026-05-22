import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  usePageData,
} from '@/utils/page-data-utils'
import { ListagemListaEsperaTable } from '@/pages/area-administrativa/consultas/lista-espera/components/listagem-lista-espera-table'
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import {
  useGetListaEsperaPaginated,
  usePrefetchAdjacentListaEspera,
} from '@/pages/area-administrativa/consultas/lista-espera/queries/listagem-lista-espera-queries'
import type { ListaEsperaDTO } from '@/types/dtos/consultas/lista-espera-administrativo.dtos'
import { toast } from '@/utils/toast-utils'

export type ListaEsperaSelecionada = {
  listaEsperaId: string
  utenteId: string
  utenteLabel: string
  organismoId?: string
  organismoLabel?: string
  medicoId?: string
  especialidadeId?: string
  tipoConsultaId?: string
  credencial?: string
  obs?: string
  horaInicio?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listPermId: string
  /** Equivalente legado ListaEsperaLst?c_medico= — filtro compatível agenda */
  medicoAgendaId?: string
  onSelected: (row: ListaEsperaSelecionada) => void
}

export function ListaEsperaSelecionarModal({
  open,
  onOpenChange,
  listPermId,
  medicoAgendaId,
  onSelected,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const defaultFilters = useMemo(() => {
    if (!medicoAgendaId) return []
    return [{ id: 'medicoAgendaId', value: medicoAgendaId }]
  }, [medicoAgendaId])

  const {
    data,
    isLoading,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetListaEsperaPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentListaEspera,
    defaultFilters,
  })

  useEffect(() => {
    if (!open) return
    if (medicoAgendaId) {
      applyFiltersIfChanged(
        filters,
        buildFiltersWithValue(
          filters.filter((f) => f.id !== 'medicoId'),
          'medicoAgendaId',
          medicoAgendaId
        ),
        handleFiltersChange
      )
    } else {
      const next = filters.filter((f) => f.id !== 'medicoAgendaId')
      if (next.length !== filters.length) {
        handleFiltersChange(next)
      }
    }
  }, [open, medicoAgendaId, filters, handleFiltersChange])

  const handlePick = async (listaEsperaId: string) => {
    setLoadingId(listaEsperaId)
    try {
      const res = await ListaEsperaAdministrativoService(listPermId).getById(listaEsperaId)
      const dto: ListaEsperaDTO | undefined = res.info?.data
      if (!dto?.utenteId) {
        toast.error('Não foi possível carregar o registo.')
        return
      }
      onSelected({
        listaEsperaId: dto.id,
        utenteId: dto.utenteId,
        utenteLabel: dto.utenteNome ?? '',
        organismoId: dto.organismoId ?? undefined,
        organismoLabel: dto.organismoNome ?? undefined,
        medicoId: dto.medicoId ?? undefined,
        especialidadeId: dto.especialidadeId ?? undefined,
        tipoConsultaId: dto.tipoConsultaId ?? undefined,
        credencial: dto.credencial ?? undefined,
        obs: dto.obs ?? undefined,
        horaInicio: dto.horaInicio?.slice(0, 5),
      })
      onOpenChange(false)
    } catch {
      toast.error('Erro ao carregar lista de espera.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-5xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Escolher utente — Lista de espera</DialogTitle>
        </DialogHeader>
        <p className='text-sm text-muted-foreground'>
          {medicoAgendaId
            ? 'Registos do médico da agenda e compatíveis (mesma especialidade ou sem médico).'
            : 'Selecione o utente para preencher a marcação.'}
        </p>
        <ListagemListaEsperaTable
          data={data?.info?.data ?? []}
          isLoading={isLoading || !!loadingId}
          pageCount={data?.info?.totalPages ?? 0}
          totalRows={data?.info?.totalCount ?? 0}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          canView={false}
          canChange={false}
          canDelete={false}
          onOpenView={(row) => void handlePick(row.id)}
          renderExtraActions={(row) =>
            !row.convertido ? (
              <Button
                type='button'
                variant='secondary'
                size='sm'
                className='h-8'
                disabled={loadingId === row.id}
                onClick={() => void handlePick(row.id)}
              >
                Selecionar
              </Button>
            ) : null
          }
        />
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
