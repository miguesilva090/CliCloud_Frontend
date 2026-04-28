import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import type {
  CreateHistoriaClinicaRequest,
  HistoriaClinicaTableDTO,
  UpdateHistoriaClinicaRequest,
} from '@/types/dtos/saude/historia-clinica.dtos'
import type { EspecialidadeLightItem } from '@/lib/services/especialidades/especialidade-service/especialidade-client'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { HistoriaClinicaService } from '@/lib/services/historia-clinica/historia-clinica-service'
import { useGetUtente } from '@/pages/utentes/queries/utentes-queries'
import state from '@/states/state'
import { toast } from '@/utils/toast-utils'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export interface HistoriaClinicaTabProps {
  utenteId: string
  historias: HistoriaClinicaTableDTO[]
  isLoading: boolean
  isError: boolean
  errorMessage: string
  page: number
  pageCount: number
  pageSize: number
  totalRows: number
  onPaginationChange: (page: number, pageSize: number) => void
  isActive?: boolean
  onAutoSaved?: () => void
}

export function HistoriaClinicaTab({
  utenteId,
  historias,
  isLoading,
  isError,
  errorMessage,
  page,
  pageCount,
  pageSize,
  totalRows,
  onPaginationChange,
  isActive = true,
  onAutoSaved,
}: HistoriaClinicaTabProps) {
  const fichaClinicaPermissionId = modules.areaClinica.permissions.fichaClinica.id
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(fichaClinicaPermissionId)
  const ALL_ESPECIALIDADES_VALUE = '__all__'
  const [obs, setObs] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedEspecialidadeId, setSelectedEspecialidadeId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const utenteQuery = useGetUtente(utenteId)
  const utente = utenteQuery.data?.info?.data as { medicoId?: string | null } | undefined
  const medicoIdFromUtente = utente?.medicoId ?? null
  const medicoId = medicoIdFromUtente ?? (state.UserId || null)

  const especialidadesQuery = useQuery({
    queryKey: ['especialidades-light'],
    queryFn: () => EspecialidadeService('historia-clinica').getEspecialidadesLight(''),
    staleTime: 60_000,
  })

  const especialidades = (especialidadesQuery.data?.info?.data ??
    []) as EspecialidadeLightItem[]

  // Quando muda o utente, limpar completamente o estado local
  useEffect(() => {
    setObs('')
    setEditingId(null)
    setSelectedEspecialidadeId(null)
    setSearchText('')
    setDeleteDialogOpen(false)
    setPendingDeleteId(null)
    setHasChanges(false)
  }, [utenteId])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return HistoriaClinicaService('historia-clinica').delete(id)
    },
    onSuccess: async () => {
      toast.success('Entrada de história clínica eliminada com sucesso.')
      await queryClient.invalidateQueries({
        queryKey: ['historias-clinicas-paginated'],
      })
    },
    onError: (error: unknown) => {
      console.error('Erro ao eliminar história clínica:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao eliminar entrada.'
      toast.error(message)
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload: CreateHistoriaClinicaRequest) => {
      return HistoriaClinicaService('historia-clinica').create(payload)
    },
    onSuccess: async () => {
      toast.success('História clínica guardada com sucesso.')
      setObs('')
      setHasChanges(false)
      await queryClient.invalidateQueries({
        queryKey: ['historias-clinicas-paginated'],
      })
    },
    onError: (error: unknown) => {
      console.error('Erro ao guardar história clínica:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao guardar história clínica.'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateHistoriaClinicaRequest) => {
      return HistoriaClinicaService('historia-clinica').update(payload.id, payload)
    },
    onSuccess: async () => {
      toast.success('História clínica atualizada com sucesso.')
      setHasChanges(false)
      await queryClient.invalidateQueries({
        queryKey: ['historias-clinicas-paginated'],
      })
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar história clínica:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao atualizar história clínica.'
      toast.error(message)
    },
  })

  const filteredHistorias = useMemo(() => {
    let result = historias

    if (selectedEspecialidadeId) {
      result = result.filter((h) => h.especialidadeId === selectedEspecialidadeId)
    }

    const term = searchText.trim().toLowerCase()
    if (!term) return result

    // Pesquisa apenas no texto da história clínica (Obs), tal como no legado
    return result.filter((h) => {
      const obsText = h.obs?.toLowerCase() ?? ''
      return obsText.includes(term)
    })
  }, [historias, selectedEspecialidadeId, searchText])

  // Apenas a última entrada (mais recente) e dentro de 24h pode ser eliminada,
  // de acordo com a regra de negócio da História Clínica.
  const deletableHistoryId = useMemo(() => {
    if (!historias.length) return null

    const sortedByCreated = [...historias].sort((a, b) => {
      const da = new Date(a.createdOn).getTime()
      const db = new Date(b.createdOn).getTime()
      return db - da
    })

    const last = sortedByCreated[0]
    if (!last) return null

    const created = new Date(last.createdOn)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours <= 24) {
      return last.id
    }

    return null
  }, [historias])

  // Entrada atualmente editável: última dentro de 24h
  const editableHistory = useMemo(
    () => (deletableHistoryId ? historias.find((h) => h.id === deletableHistoryId) ?? null : null),
    [deletableHistoryId, historias],
  )

  useEffect(() => {
    if (editableHistory) {
      setEditingId(editableHistory.id)
      setObs(editableHistory.obs ?? '')
      setSelectedEspecialidadeId(editableHistory.especialidadeId ?? null)
      setHasChanges(false)
    } else {
      setEditingId(null)
      setObs('')
      setHasChanges(false)
    }
  }, [editableHistory])

  const handlePrint = () => {
    if (!historias.length) {
      toast.error('Não existem entradas de história clínica para imprimir.')
      return
    }

    const now = new Date()
    const dataTrabalho = format(now, 'dd/MM/yyyy HH:mm')

    const rowsHtml = historias
      .map((h) => {
        const dataLabel = h.data ? format(new Date(h.data), 'dd/MM/yyyy') : '-'
        const horaLabel = h.hora ?? ''
        const dataHora =
          horaLabel && dataLabel !== '-' ? `${dataLabel} ${horaLabel}` : dataLabel

        const medico = h.medicoNome ?? ''
        const esp = h.especialidadeNome ?? ''
        const titulo = esp ? `${medico} - ${esp}` : medico

        const obsHtml = (h.obs || '').replace(/\\n/g, '<br />')

        return `
          <div style="margin-bottom: 16px;">
            <div style="font-weight:bold;">${titulo}</div>
            <div style="font-size:11px;color:#555;">${dataHora}</div>
            <div style="margin-top:4px;font-size:12px;">${obsHtml}</div>
          </div>
        `
      })
      .join('')

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>História Clínica</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 32px; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            .header { margin-bottom: 16px; border-bottom: 1px solid #000; padding-bottom: 8px; }
            .footer { margin-top: 24px; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>História Clínica</h1>
            <div>Data de trabalho: ${dataTrabalho}</div>
          </div>
          ${rowsHtml}
          <div class="footer">
            Documento gerado pela aplicação CliCloud.
          </div>
        </body>
      </html>
    `

    try {
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)

      const doc = iframe.contentWindow?.document
      if (!doc) {
        document.body.removeChild(iframe)
        toast.error('Não foi possível preparar a impressão.')
        return
      }

      doc.open()
      doc.write(html)
      doc.close()

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 500)
        }
      }
    } catch {
      toast.error('Não foi possível preparar a impressão.')
    }
  }

  const handleSave = () => {
    if (!utenteId) {
      toast.error('Selecione um utente antes de guardar a história clínica.')
      return
    }

    if (!medicoId) {
      toast.error(
        'Não foi possível identificar o médico. Associe um médico ao utente ou inicie sessão com um utilizador médico.'
      )
      return
    }

    if (!obs.trim()) {
      // Nada para gravar
      return
    }

    if (!hasChanges) {
      // Texto igual ao último registo carregado – não gravar de novo
      return
    }

    // Se existir uma entrada editável (última dentro de 24h), atualiza em vez de criar nova
    if (editableHistory && editingId === editableHistory.id) {
      const payload: UpdateHistoriaClinicaRequest = {
        id: editableHistory.id,
        utenteId: editableHistory.utenteId,
        medicoId: editableHistory.medicoId,
        especialidadeId: selectedEspecialidadeId ?? editableHistory.especialidadeId ?? null,
        data: editableHistory.data,
        hora: editableHistory.hora ?? '',
        obs,
      }

      updateMutation.mutate(payload, {
        onSuccess: () => {
          if (onAutoSaved) {
            onAutoSaved()
          }
        },
      })
      return
    }

    // Caso contrário, cria uma nova entrada
    const now = new Date()
    const data = now.toISOString().slice(0, 10) // yyyy-MM-dd
    const hora = now.toTimeString().slice(0, 5) // HH:mm

    const payloadCreate: CreateHistoriaClinicaRequest = {
      utenteId,
      medicoId,
      // A especialidade da história clínica será inferida a partir do médico no backend.
      especialidadeId: selectedEspecialidadeId ?? null,
      data,
      hora,
      obs,
    }

    createMutation.mutate(payloadCreate, {
      onSuccess: () => {
        if (onAutoSaved) {
          onAutoSaved()
        }
      },
    })
  }

  // Auto‑save ao sair da tab (comportamento tipo legado)
  useEffect(() => {
    // Quando deixa de estar ativa e há texto, tenta guardar automaticamente
    if (isActive === false && obs.trim() && hasChanges) {
      handleSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  return (
    <div className='flex flex-col gap-2 rounded-lg border bg-card'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3 bg-muted/40'>
        <h2 className='text-sm font-semibold'>História Clínica</h2>
      </div>

      <div className='border-b px-4 py-3'>
        <Textarea
          className='min-h-[120px]'
          placeholder='Área para observações da história clínica.'
          disabled={!utenteId}
          value={obs}
          onChange={(e) => {
            if (!(canAdd || canChange)) return
            setObs(e.target.value)
            setHasChanges(true)
          }}
        />
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={handlePrint} disabled={!historias.length}>
            Imprimir
          </Button>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={!utenteId || !(canAdd || canChange)}
          >
            Guardar
          </Button>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>Especialidade</span>
            <Select
              value={selectedEspecialidadeId ?? ALL_ESPECIALIDADES_VALUE}
              onValueChange={(value) =>
                setSelectedEspecialidadeId(
                  value === ALL_ESPECIALIDADES_VALUE ? null : value,
                )
              }
            >
              <SelectTrigger className='h-8 min-w-[220px]'>
                <SelectValue
                  placeholder={
                    especialidadesQuery.isLoading ? 'A carregar...' : 'Especialidade...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ESPECIALIDADES_VALUE}>Todas</SelectItem>
                {especialidades
                  .filter((e) => e.id)
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome ?? e.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='whitespace-nowrap'
              // Apenas visual, não precisa de onClick específico (o filtro é reativo)
            >
              Procurar
            </Button>
            <input
              type='text'
              className='h-8 w-56 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              placeholder='Introduza o texto que pretende procurar...'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isError ? (
        <div className='px-4 py-3 text-sm text-destructive'>
          {errorMessage || 'Erro ao carregar história clínica.'}
        </div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-start'>Histórico</TableHead>
                  <TableHead className='w-[60px] text-center'>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!utenteId ? (
                  <TableRow>
                    <TableCell colSpan={2} className='py-8 text-center text-muted-foreground'>
                      Selecione um utente para ver a história clínica.
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className='py-8 text-center text-muted-foreground'>
                      A carregar...
                    </TableCell>
                  </TableRow>
                ) : filteredHistorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className='py-8 text-center text-muted-foreground'>
                      Nenhuma entrada de história clínica para este utente.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistorias.map((row) => {
                    const dataLabel = row.data ? format(new Date(row.data), 'dd/MM/yyyy') : '-'
                    const horaLabel = row.hora ?? ''
                    const dataHora =
                      horaLabel && dataLabel !== '-' ? `${dataLabel} ${horaLabel}` : dataLabel

                    const canDelete = deletableHistoryId === row.id

                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className='flex flex-col gap-1 py-2 text-xs sm:text-sm'>
                            <div className='font-semibold'>
                              {row.medicoNome ?? 'Médico'}{' '}
                              {row.especialidadeNome ? `- ${row.especialidadeNome}` : ''}
                            </div>
                            <div className='text-muted-foreground'>{dataHora}</div>
                            <div className='mt-1 whitespace-pre-wrap'>{row.obs || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell className='text-center align-middle'>
                          {canDelete && canView && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7 text-destructive hover:text-destructive'
                              title='Eliminar entrada'
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                setPendingDeleteId(row.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className='flex items-center justify-between border-t px-4 py-2 text-sm text-muted-foreground'>
            <span>
              Página {page} de {pageCount || 1} | Mostrar {pageSize} registos | Encontrados {totalRows}{' '}
              registos
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => onPaginationChange(page - 1, pageSize)}
              >
                Anterior
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= pageCount}
                onClick={() => onPaginationChange(page + 1, pageSize)}
              >
                Seguinte
              </Button>
            </div>
          </div>
        </>
      )}

      <AlertDialog
        open={canDelete ? deleteDialogOpen : false}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover entrada de história clínica</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende remover esta entrada? Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (pendingDeleteId) {
                  deleteMutation.mutate(pendingDeleteId, {
                    onSettled: () => {
                      setDeleteDialogOpen(false)
                      setPendingDeleteId(null)
                    },
                  })
                }
              }}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending ? 'A remover…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
