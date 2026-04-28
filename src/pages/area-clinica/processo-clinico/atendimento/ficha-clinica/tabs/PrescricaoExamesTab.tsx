import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ExameService } from '@/lib/services/exames/exame-service'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import {
  useGetExamesByUtentePaginated,
  useGetExameById,
  useCreateExame,
  useUpdateExame,
  useDeleteExame,
} from '../queries/prescricao-exames-queries'
import { useGetResultadosByExame, useUpsertResultadoExame } from '../queries/resultado-exames-queries'
import type { CreateExameRequest, UpdateExameRequest } from '@/types/dtos/exames/exame'
import { useOrganismosLight } from '@/lib/services/utility/entity-quick-create/entity-quick-create-queries'
import { PrioridadeService } from '@/lib/services/prioridades/prioridade-service'
import { inputClass, selectTriggerClass, textareaClass } from '@/lib/form-styles'
import { TipoExamePickerModal } from '../modals/TipoExamePickerModal'
import { Eye, Pencil, Trash2, FileText, Printer } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useDeleteDocumentoFichaClinica,
  useGetDocumentosFichaClinicaByUtente,
  useUploadDocumentoFichaClinica,
} from '../queries/documentos-ficha-clinica-queries'
import { toast } from '@/utils/toast-utils'
import {
  useGetRelatorioExamesByUtente,
  useUpsertRelatorioExames,
} from '../queries/relatorio-exames-queries'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

type PrescricaoExamesTabProps = {
  utenteId?: string
}

type LinhaExameRow = {
  tempId: string
  tipoExameId: string
  tipoExameNome: string
  quantidade: number
  recomendacoes: string
}

type ModalMode = 'create' | 'edit' | 'view'
type ResultadoModalMode = 'view' | 'edit'

export function PrescricaoExamesTab({ utenteId }: PrescricaoExamesTabProps) {
  const fichaClinicaPermissionId = modules.areaClinica.permissions.fichaClinica.id
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(fichaClinicaPermissionId)
  const [pageNumber] = useState(1)
  const [pageSize] = useState(20)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingExameId, setEditingExameId] = useState<string | null>(null)
  const [selectedExameId, setSelectedExameId] = useState<string | null>(null)
  const [resultadoModalOpen, setResultadoModalOpen] = useState(false)
  const [resultadoModalMode, setResultadoModalMode] = useState<ResultadoModalMode>('edit')
  const [resultadoAnexosModalOpen, setResultadoAnexosModalOpen] = useState(false)
  const [resultadoValor, setResultadoValor] = useState('')
  const [resultadoReferencia, setResultadoReferencia] = useState('')
  const [resultadoNomeExame, setResultadoNomeExame] = useState('')
  const [resultadoAnexoDescricao, setResultadoAnexoDescricao] = useState('')
  const [resultadoAnexoFile, setResultadoAnexoFile] = useState<File | null>(null)
  const [resultadoAnexoIdToDelete, setResultadoAnexoIdToDelete] = useState<string | null>(null)

  const [dataPrescricao, setDataPrescricao] = useState('')
  const [prioridadeId, setPrioridadeId] = useState<string>('')
  const [numeroPrescricao, setNumeroPrescricao] = useState('')
  const [organismoId, setOrganismoId] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [linhas, setLinhas] = useState<LinhaExameRow[]>([])
  const [tipoExamePickerOpen, setTipoExamePickerOpen] = useState(false)
  const [editLinhaModalOpen, setEditLinhaModalOpen] = useState(false)
  const [editLinhaTempId, setEditLinhaTempId] = useState<string | null>(null)
  const [editLinhaQuantidade, setEditLinhaQuantidade] = useState<number>(1)
  const [editLinhaRecomendacoes, setEditLinhaRecomendacoes] = useState('')

  const [organismoQ, setOrganismoQ] = useState('')
  const [organismoQD] = useDebounce(organismoQ, 250)
  const { data: organismosRes, isFetching: organismosLoading } = useOrganismosLight(organismoQD)

  const { data: prioridadesRes } = useQuery({
    queryKey: ['prioridades-light-prescricao-exames'],
    queryFn: () => PrioridadeService('ficha-clinica').getPrioridadesLight(),
    staleTime: 5 * 60 * 1000,
  })


  const auth = useAuthStore()
  const medicoId = auth.userId

  // Anexos de resultados de exames (categoria dedicada por utente)
  const anexosCategoria = 'Exames'
  const { data: anexosResultado = [] } = useGetDocumentosFichaClinicaByUtente(
    utenteId,
    anexosCategoria
  )
  const uploadAnexoResultado = useUploadDocumentoFichaClinica()
  const deleteAnexoResultado = useDeleteDocumentoFichaClinica(utenteId, anexosCategoria)

  const { data: examesRes } = useGetExamesByUtentePaginated(
    utenteId,
    pageNumber,
    pageSize,
    null,
    null
  )

  const createExame = useCreateExame()
  const updateExame = useUpdateExame()
  const deleteExame = useDeleteExame()

  const exames = useMemo(() => examesRes?.info?.data ?? [], [examesRes])
  const exameSelecionado = useMemo(
    () => (selectedExameId ? (exames as any[]).find((e) => e.id === selectedExameId) ?? null : null),
    [exames, selectedExameId]
  )

  const { data: exameDetalheRes } = useGetExameById(editingExameId)
  const { data: resultadosSelecionadosRes } = useGetResultadosByExame(selectedExameId)
  const upsertResultadoMutation = useUpsertResultadoExame(selectedExameId)

  // Relatório de Exames (texto livre por utente/médico)
  const { data: relatorioExames } = useGetRelatorioExamesByUtente(utenteId)
  const upsertRelatorioExames = useUpsertRelatorioExames()
  const [relatorioTexto, setRelatorioTexto] = useState('')

  useEffect(() => {
    setRelatorioTexto(relatorioExames?.texto ?? '')
  }, [relatorioExames?.id])

  type OrganismoLight = { id: string; nome?: string | null; abreviatura?: string | null }
  const organismoItems = useMemo(
    () =>
      ((organismosRes?.info?.data ?? []) as OrganismoLight[]).map((o) => ({
        value: o.id,
        label: o.nome ?? o.abreviatura ?? o.id,
        secondary: o.abreviatura ?? undefined,
      })),
    [organismosRes]
  )

  type PrioridadeLight = { id: string; descricao: string }
  const prioridadeItems = useMemo(
    () =>
      ((prioridadesRes?.info?.data ?? []) as PrioridadeLight[]).map((p) => ({
        value: p.id,
        label: p.descricao,
      })),
    [prioridadesRes]
  )

  const prioridadeLabelById = useMemo(() => {
    const map = new Map<string, string>()
    prioridadeItems.forEach((p) => map.set(p.value, p.label))
    return map
  }, [prioridadeItems])

  const organismoLabelById = useMemo(() => {
    const map = new Map<string, string>()
    organismoItems.forEach((o) => map.set(o.value, o.label))
    return map
  }, [organismoItems])


  const handleOpenCreate = () => {
    setModalMode('create')
    setEditingExameId(null)
    setDataPrescricao(new Date().toISOString().slice(0, 10))
    setPrioridadeId('')
    setNumeroPrescricao('')
    setOrganismoId('')
    setObservacoes('')
    setLinhas([])
    setModalOpen(true)
  }

  const handleAddLinha = () => {
    setTipoExamePickerOpen(true)
  }

  const handleDeleteLinha = (tempId: string) => {
    setLinhas((prev) => prev.filter((l) => l.tempId !== tempId))
  }

  const handleOpenEditLinha = (linha: LinhaExameRow) => {
    setEditLinhaTempId(linha.tempId)
    setEditLinhaQuantidade(linha.quantidade)
    setEditLinhaRecomendacoes(linha.recomendacoes)
    setEditLinhaModalOpen(true)
  }

  const buildCreatePayload = (): CreateExameRequest | null => {
    if (!utenteId || !medicoId) return null
    if (!dataPrescricao) return null
    if (linhas.length === 0) return null

    return {
      utenteId,
      medicoId,
      dataPrescricao,
      prioridadeId: prioridadeId || null,
      numeroPrescricao: numeroPrescricao || null,
      organismoId: organismoId || null,
      observacoes: observacoes || null,
      linhas: linhas.map((l) => ({
        tipoExameId: l.tipoExameId,
        quantidade: l.quantidade,
        recomendacoes: l.recomendacoes || null,
      })),
    }
  }

  const buildUpdatePayload = (): UpdateExameRequest | null => {
    if (!utenteId || !medicoId) return null
    if (!dataPrescricao) return null
    if (linhas.length === 0) return null

    return {
      utenteId,
      medicoId,
      dataPrescricao,
      prioridadeId: prioridadeId || null,
      numeroPrescricao: numeroPrescricao || null,
      organismoId: organismoId || null,
      observacoes: observacoes || null,
      linhas: linhas.map((l) => ({
        tipoExameId: l.tipoExameId,
        quantidade: l.quantidade,
        recomendacoes: l.recomendacoes || null,
      })),
    }
  }

  const handleGuardarPrescricao = async () => {
    if (modalMode === 'create') {
      const payload = buildCreatePayload()
      if (!payload) return
      await createExame.mutateAsync(payload)
    } else if (modalMode === 'edit' && editingExameId) {
      const payload = buildUpdatePayload()
      if (!payload) return
      await updateExame.mutateAsync({ id: editingExameId, data: payload })
    }
    setModalOpen(false)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exameToDelete, setExameToDelete] = useState<any | null>(null)

  const buildPrescricaoExameHtml = (exame: any): string => {
    const dataLabel = exame.dataPrescricao
      ? new Date(exame.dataPrescricao).toLocaleDateString('pt-PT')
      : ''
    const numeroLabel = exame.numeroPrescricao ?? ''
    const organismoLabel = exame.organismoNome ?? ''
    const prioridadeLabel = exame.prioridadeDescricao ?? ''
    const obsLabel = exame.observacoes ?? ''
    const linhasExame = (exame.linhas ?? []) as Array<{
      codigo?: string | null
      tipoExameDesignacao?: string | null
      quantidade: number
    }>

    const linhasHtml = linhasExame
      .map(
        (l) => `
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #000; text-align: left;">${l.codigo ?? ''}</td>
          <td style="padding: 4px 8px; border: 1px solid #000; text-align: left;">${
            l.tipoExameDesignacao ?? ''
          }</td>
          <td style="padding: 4px 8px; border: 1px solid #000; text-align: center;">${l.quantidade}</td>
        </tr>`
      )
      .join('')

    return `
      <div style="font-family: Arial, sans-serif; font-size: 11px; padding: 24px; color: #000;">
        <h2 style="text-align: center; margin-bottom: 16px;">Pedido de Exame</h2>

        <table style="width: 100%; margin-bottom: 12px; font-size: 11px;">
          <tr>
            <td><strong>Nº Prescrição:</strong> ${numeroLabel}</td>
            <td style="text-align: right;"><strong>Data:</strong> ${dataLabel}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Organismo:</strong> ${organismoLabel}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Prioridade:</strong> ${prioridadeLabel}</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr>
              <th style="padding: 4px 8px; border: 1px solid #000; text-align: left;">Código</th>
              <th style="padding: 4px 8px; border: 1px solid #000; text-align: left;">Designação</th>
              <th style="padding: 4px 8px; border: 1px solid #000; text-align: center;">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${linhasHtml || `<tr><td colspan="3" style="padding: 8px; border: 1px solid #000; text-align: center;">Sem exames associados.</td></tr>`}
          </tbody>
        </table>

        ${
          obsLabel
            ? `<div style="margin-top: 8px;"><strong>Observações:</strong><br />${obsLabel}</div>`
            : ''
        }
      </div>
    `
  }

  const handleImprimirExame = async (exameId: string) => {
    try {
      const client = ExameService('ficha-clinica')
      const res = await client.getExameById(exameId)
      const exame = (res as any)?.info?.data

      if (!exame) {
        toast.error('Nenhuma prescrição de exame encontrada para impressão.')
        return
      }

      const bodyHtml = buildPrescricaoExameHtml(exame)

      const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Pedido de Exame</title>
  </head>
  <body onload="window.print()">
    ${bodyHtml}
  </body>
</html>`

      const win = window.open('', '_blank')
      if (!win) return
      win.document.open()
      win.document.write(html)
      win.document.close()
      win.focus()
    } catch (error) {
      console.error('Erro ao imprimir prescrição de exame:', error)
      toast.error('Erro ao preparar a impressão da prescrição de exame.')
    }
  }

  const handleOpenEdit = (e: any) => {
    setModalMode('edit')
    setEditingExameId(e.id)
    setModalOpen(true)
  }

  const handleOpenDelete = (e: any) => {
    setExameToDelete(e)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!exameToDelete?.id) return
    try {
      await deleteExame.mutateAsync(exameToDelete.id as string)
      toast.success('Prescrição de exames eliminada com sucesso.')
      setDeleteDialogOpen(false)
      setExameToDelete(null)
    } catch (error) {
      toast.error('Falha ao eliminar prescrição de exames.')
    }
  }

  useEffect(() => {
    if (!editingExameId || !exameDetalheRes?.info?.data) return

    const detalhe = exameDetalheRes.info.data as any

    setDataPrescricao(
      detalhe.dataPrescricao
        ? new Date(detalhe.dataPrescricao).toISOString().slice(0, 10)
        : ''
    )
    setNumeroPrescricao(detalhe.numeroPrescricao ?? '')
    setPrioridadeId(detalhe.prioridadeId ?? '')
    setOrganismoId(detalhe.organismoId ?? '')
    setObservacoes(detalhe.observacoes ?? '')

    const linhasDto = (detalhe.linhas ?? []) as Array<{
      id: string
      tipoExameId: string
      tipoExameDesignacao?: string | null
      quantidade: number
      recomendacoes?: string | null
    }>

    setLinhas(
      linhasDto.map((l) => ({
        tempId: l.id ?? `linha-${l.tipoExameId}`,
        tipoExameId: l.tipoExameId,
        tipoExameNome: l.tipoExameDesignacao ?? l.tipoExameId,
        quantidade: l.quantidade,
        recomendacoes: l.recomendacoes ?? '',
      }))
    )
  }, [editingExameId, exameDetalheRes])

  const [resultadoLinhaId, setResultadoLinhaId] = useState<string | null>(null)

  const handleOpenResultado = (r: any, mode: ResultadoModalMode) => {
    setResultadoLinhaId(r.id as string)
    setResultadoNomeExame(r.nomeExame ?? '')
    setResultadoReferencia(r.referencia ?? '')
    setResultadoValor(r.valor ?? '')
    setResultadoModalMode(mode)
    setResultadoModalOpen(true)
  }

  const handleOpenResultadoAnexos = (r: any) => {
    setResultadoNomeExame(r.nomeExame ?? '')
    setResultadoAnexosModalOpen(true)
  }

  // Selecionar automaticamente a primeira prescrição quando existirem dados
  useEffect(() => {
    if (!selectedExameId && exames.length > 0) {
      setSelectedExameId(exames[0].id as string)
    }
  }, [exames, selectedExameId])

  const handleGuardarRelatorioExames = async () => {
    if (!utenteId) {
      toast.error('Selecione um utente antes de guardar o relatório de exames.')
      return
    }

    try {
      await upsertRelatorioExames.mutateAsync({
        utenteId,
        texto: relatorioTexto || null,
      })
      toast.success('Relatório de exames guardado com sucesso.')
    } catch (error) {
      console.error('Erro ao guardar relatório de exames:', error)

      const rawMessage =
        error instanceof Error ? error.message : 'Falha ao guardar relatório de exames.'

      if (rawMessage.includes('Médico não associado ao utente')) {
        toast.error(
          'O utente selecionado não tem médico associado. Associe um médico ao utente antes de guardar o relatório de exames.'
        )
      } else {
        toast.error(rawMessage)
      }
    }
  }

  return (
    <>
      <Tabs defaultValue='exames-prescritos' className='flex flex-col gap-2'>
        <TabsList className='w-full justify-start bg-transparent border-none p-0 shadow-none'>
          <TabsTrigger value='exames-prescritos' className='tabs-pill px-2 py-1'>
            Exames Prescritos
          </TabsTrigger>
          <TabsTrigger value='relatorio-exames' className='tabs-pill px-2 py-1'>
            Relatório de Exames
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value='exames-prescritos'
          className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
        >
          <div className='mb-3 flex items-center justify-between'>
            <span className='font-medium text-foreground'>
              Prescrições de Exames do utente
            </span>
            <Button size='sm' onClick={handleOpenCreate} disabled={!utenteId || !canAdd}>
              Nova prescrição
            </Button>
          </div>

          <div className='rounded-md border bg-background'>
            <table className='w-full text-sm'>
              <thead className='bg-muted'>
                <tr>
                  <th className='px-3 py-2 text-left'>Data</th>
                  <th className='px-3 py-2 text-left'>Nº Prescrição</th>
                  <th className='px-3 py-2 text-left'>Prioridade</th>
                  <th className='px-3 py-2 text-left'>Organismo</th>
                  <th className='px-3 py-2 text-center'>Opções</th>
                </tr>
              </thead>
              <tbody>
                {exames.map((e: any) => {
                  const isSelected = e.id === selectedExameId
                  return (
                  <tr
                    key={e.id}
                    className={`border-t cursor-pointer ${isSelected ? 'bg-muted/40' : ''}`}
                    onClick={() => setSelectedExameId(e.id as string)}
                  >
                    <td className='px-3 py-2'>
                      {e.dataPrescricao
                        ? new Date(e.dataPrescricao).toLocaleDateString('pt-PT')
                        : ''}
                    </td>
                    <td className='px-3 py-2'>{e.numeroPrescricao ?? ''}</td>
                    <td className='px-3 py-2'>
                      {e.prioridadeId
                        ? prioridadeLabelById.get(e.prioridadeId) ?? e.prioridadeId
                        : ''}
                    </td>
                    <td className='px-3 py-2'>
                      {e.organismoId
                        ? organismoLabelById.get(e.organismoId) ?? e.organismoId
                        : ''}
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex items-center justify-center gap-1'>
                        {canChange ? (
                          <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Editar'
                          onClick={() => handleOpenEdit(e)}
                        >
                          <Pencil className='h-4 w-4' />
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-destructive hover:text-destructive'
                          title='Eliminar'
                          onClick={() => handleOpenDelete(e)}
                        >
                          <Trash2 className='h-4 w-4' />
                          </Button>
                        ) : null}
                        {canView ? (
                          <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Imprimir prescrição'
                          onClick={(evt) => {
                            evt.stopPropagation()
                            void handleImprimirExame(e.id as string)
                          }}
                        >
                          <Printer className='h-4 w-4' />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )})}
                {exames.length === 0 && (
                  <tr>
                    <td className='px-3 py-4 text-center text-muted-foreground' colSpan={5}>
                      Sem prescrições de exames para este utente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resultados de Exames – detalhe simples das linhas da prescrição selecionada */}
          <div className='mt-4 rounded-md border bg-background'>
            <div className='border-b bg-muted/40 px-3 py-2'>
              <span className='text-sm font-semibold text-teal-700'>Resultados de Exames</span>
            </div>
            {!selectedExameId ? (
              <div className='px-3 py-4 text-xs text-muted-foreground'>
                Selecione uma prescrição de exames para ver o detalhe.
              </div>
            ) : !resultadosSelecionadosRes?.info?.data ? (
              <div className='px-3 py-4 text-xs text-muted-foreground'>
                A carregar resultados da prescrição selecionada…
              </div>
            ) : (
              <table className='w-full text-sm'>
                <thead className='bg-muted'>
                  <tr>
                    <th className='px-3 py-2 text-left'>Código Exame</th>
                    <th className='px-3 py-2 text-left'>Designação</th>
                    <th className='px-3 py-2 text-left'>Resultados/Valor</th>
                    <th className='px-3 py-2 text-left'>Valores Referência</th>
                    <th className='px-3 py-2 text-center'>Quant.</th>
                    <th className='px-3 py-2 text-center'>Opções</th>
                  </tr>
                </thead>
                <tbody>
                  {(resultadosSelecionadosRes.info.data ?? []).map((r) => (
                    <tr key={r.id} className='border-t'>
                      {/* Não mostramos o código porque é um Guid no projeto novo.
                          Quando houver um código legível vindo do backend, podemos preencher aqui. */}
                      <td className='px-3 py-2'>-</td>
                      <td className='px-3 py-2'>{r.nomeExame ?? ''}</td>
                      <td className='px-3 py-2'>{r.valor ?? '-'}</td>
                      <td className='px-3 py-2'>{r.referencia ?? '-'}</td>
                      <td className='px-3 py-2 text-center'>{r.quantidade}</td>
                      <td className='px-3 py-2'>
                        <div className='flex items-center justify-center gap-1'>
                          {canView ? (
                            <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Ver Resultado'
                            onClick={() => handleOpenResultado(r, 'view')}
                          >
                            <Eye className='h-4 w-4' />
                            </Button>
                          ) : null}
                          {canChange ? (
                            <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Editar Resultado'
                            onClick={() => handleOpenResultado(r, 'edit')}
                          >
                            <Pencil className='h-4 w-4' />
                            </Button>
                          ) : null}
                          {canView ? (
                            <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Anexos do Resultado'
                            onClick={() => handleOpenResultadoAnexos(r)}
                          >
                            <FileText className='h-4 w-4' />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(resultadosSelecionadosRes.info.data ?? []).length === 0 && (
                    <tr>
                      <td
                        className='px-3 py-4 text-center text-muted-foreground'
                        colSpan={5}
                      >
                        Nenhum exame associado a esta prescrição.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value='relatorio-exames'
          className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
        >
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-foreground'>Relatório de Exames</span>
              <Button
                size='sm'
                onClick={handleGuardarRelatorioExames}
                disabled={!utenteId || !canChange || upsertRelatorioExames.isPending}
              >
                Guardar
              </Button>
            </div>

            <div className='space-y-1'>
              <Label htmlFor='relatorioExamesTexto'>Descrito</Label>
              <Textarea
                id='relatorioExamesTexto'
                className={textareaClass + ' min-h-[220px]'}
                value={relatorioTexto}
                onChange={(e) => setRelatorioTexto(e.target.value)}
                placeholder='Escreva aqui o relatório de exames...'
                disabled={!canChange}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Resultado de Exames (valor / referência / resultado) */}
      <Dialog open={resultadoModalOpen} onOpenChange={setResultadoModalOpen}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>Resultados de Exames</DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label>Nº Prescrição</Label>
              <Input
                value={exameSelecionado?.numeroPrescricao ?? ''}
                readOnly
                className={inputClass}
              />
            </div>
            <div>
              <Label>Designação</Label>
              <Input value={resultadoNomeExame} readOnly className={inputClass} />
            </div>
          </div>

          <div className='mt-4 space-y-2'>
            <Label>Valores de Referência</Label>
            <Input
              value={resultadoReferencia}
              onChange={(e) => setResultadoReferencia(e.target.value)}
              className={inputClass}
              placeholder='-'
              readOnly={resultadoModalMode === 'view'}
            />
          </div>

          <div className='mt-4 space-y-2'>
            <Label>Resultado</Label>
            <Textarea
              value={resultadoValor}
              onChange={(e) => setResultadoValor(e.target.value)}
              className={textareaClass + ' min-h-[160px]'}
              placeholder='Resultado...'
              readOnly={resultadoModalMode === 'view'}
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setResultadoModalOpen(false)}>
              Fechar
            </Button>
            {resultadoModalMode === 'edit' && canChange && (
              <Button
                type='button'
                disabled={!selectedExameId || !resultadoLinhaId || upsertResultadoMutation.isPending}
                onClick={async () => {
                  if (!selectedExameId || !resultadoLinhaId) return
                  try {
                    await upsertResultadoMutation.mutateAsync({
                      linhaId: resultadoLinhaId,
                      valor: resultadoValor || null,
                      referencia: resultadoReferencia || null,
                      obs: null,
                    })
                    toast.success('Resultado de exame guardado com sucesso.')
                    setResultadoModalOpen(false)
                  } catch (error) {
                    console.error('Erro ao guardar resultado de exame:', error)
                    toast.error('Falha ao guardar resultado de exame.')
                  }
                }}
              >
                Guardar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Anexos de Resultados de Exames */}
      <Dialog open={resultadoAnexosModalOpen} onOpenChange={setResultadoAnexosModalOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Resultados de Exames - Anexos</DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label>Nº Prescrição</Label>
              <Input
                value={exameSelecionado?.numeroPrescricao ?? ''}
                readOnly
                className={inputClass}
              />
            </div>
            <div>
              <Label>Designação</Label>
              <Input value={resultadoNomeExame} readOnly className={inputClass} />
            </div>
          </div>

          <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label>Descrição</Label>
              <Input
                placeholder='Descrição...'
                className={inputClass}
                value={resultadoAnexoDescricao}
                onChange={(e) => setResultadoAnexoDescricao(e.target.value)}
                disabled={!utenteId}
              />
            </div>
            <div>
              <Label>Ficheiro</Label>
              <Input
                type='file'
                className={inputClass}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setResultadoAnexoFile(file)
                }}
                disabled={!utenteId}
              />
            </div>
          </div>

          <div className='mt-4 space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Ficheiros Carregados</Label>
              <Button
                type='button'
                size='sm'
                disabled={!utenteId || !resultadoAnexoFile || !resultadoAnexoDescricao.trim()}
                hidden={!canAdd}
                onClick={() => {
                  if (!utenteId || !resultadoAnexoFile || !resultadoAnexoDescricao.trim()) return
                  uploadAnexoResultado.mutate({
                    data: {
                      utenteId,
                      descricao: `${resultadoNomeExame || 'Resultado de exame'} - ${resultadoAnexoDescricao.trim()}`,
                      categoria: anexosCategoria,
                    },
                    file: resultadoAnexoFile,
                  })
                  setResultadoAnexoDescricao('')
                  setResultadoAnexoFile(null)
                }}
              >
                Anexar ficheiro
              </Button>
            </div>

            <div className='mt-2 max-h-64 overflow-y-auto rounded-md border bg-background'>
              <table className='min-w-full text-sm'>
                <thead className='bg-muted'>
                  <tr>
                    <th className='px-3 py-2 text-left'>Data</th>
                    <th className='px-3 py-2 text-left'>Descrição</th>
                    <th className='px-3 py-2 text-left'>Tipo</th>
                    <th className='px-3 py-2 text-right'>Opções</th>
                  </tr>
                </thead>
                <tbody>
                  {(!utenteId || anexosResultado.length === 0) && (
                    <tr>
                      <td
                        className='px-3 py-3 text-center text-xs text-muted-foreground'
                        colSpan={4}
                      >
                        {!utenteId
                          ? 'Selecione um utente para gerir anexos.'
                          : 'Nenhum anexo registado para este utente.'}
                      </td>
                    </tr>
                  )}
                  {utenteId &&
                    anexosResultado.map((doc) => (
                      <tr key={doc.id} className='border-t'>
                        <td className='px-3 py-2'>
                          {doc.createdOn
                            ? new Date(doc.createdOn).toLocaleString('pt-PT')
                            : '-'}
                        </td>
                        <td className='px-3 py-2'>{doc.descricao}</td>
                        <td className='px-3 py-2'>{doc.tipo}</td>
                        <td className='px-3 py-2 text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            {canView ? (
                              <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              title='Ver ficheiro'
                              onClick={() => {
                                const apiBase = (window?.location?.origin ?? '').replace(/\/+$/, '')
                                const path = doc.caminhoRelativo.startsWith('/')
                                  ? doc.caminhoRelativo
                                  : `/${doc.caminhoRelativo}`
                                const url = `${apiBase}${path}`
                                window.open(url, '_blank')
                              }}
                            >
                              <Eye className='h-4 w-4' />
                              </Button>
                            ) : null}
                            {canDelete ? (
                              <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-destructive hover:text-destructive'
                              title='Eliminar ficheiro'
                              onClick={() => setResultadoAnexoIdToDelete(doc.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setResultadoAnexosModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de eliminação de anexo */}
      <AlertDialog
        open={resultadoAnexoIdToDelete != null}
        onOpenChange={(open) => {
          if (!open) setResultadoAnexoIdToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar anexo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar este anexo? Esta ação não pode ser anulada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (!resultadoAnexoIdToDelete) return
                deleteAnexoResultado.mutate(resultadoAnexoIdToDelete)
                setResultadoAnexoIdToDelete(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create'
                ? 'Nova Prescrição de Exames'
                : modalMode === 'edit'
                ? 'Editar Prescrição de Exames'
                : 'Ver Prescrição de Exames'}
            </DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='dataPrescricao'>Data da prescrição</Label>
              <Input
                id='dataPrescricao'
                type='date'
                className={inputClass}
                value={dataPrescricao}
                onChange={(e) => setDataPrescricao(e.target.value)}
                disabled={modalMode !== 'create'}
              />
            </div>

            <div>
              <Label htmlFor='prioridade'>Prioridade</Label>
              <Select
                value={prioridadeId}
                onValueChange={(v) => setPrioridadeId(v)}
                disabled={modalMode === 'view'}
              >
                <SelectTrigger id='prioridade' className={selectTriggerClass}>
                  <SelectValue placeholder='Selecione a prioridade' />
                </SelectTrigger>
                <SelectContent>
                  {prioridadeItems.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='numeroPrescricao'>Nº Prescrição</Label>
              <Input
                id='numeroPrescricao'
                className={inputClass}
                value={numeroPrescricao}
                onChange={(e) => setNumeroPrescricao(e.target.value)}
                disabled={modalMode !== 'create'}
              />
            </div>

            <div>
              <Label htmlFor='organismoId'>Organismo</Label>
              <AsyncCombobox
                value={organismoId}
                onChange={(v) => setOrganismoId(v || '')}
                items={organismoItems}
                isLoading={organismosLoading}
                placeholder='Organismo...'
                searchPlaceholder='Procurar organismo...'
                searchValue={organismoQ}
                onSearchValueChange={setOrganismoQ}
                className={inputClass}
                disabled={modalMode !== 'create'}
              />
            </div>
          </div>

          <div className='mt-4 space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Exames prescritos</Label>
              <Button
                size='sm'
                variant='outline'
                onClick={handleAddLinha}
                disabled={modalMode === 'view'}
              >
                Inserir exame
              </Button>
            </div>

            <div className='rounded-md border bg-background'>
              <table className='w-full text-sm'>
                <thead className='bg-muted'>
                  <tr>
                    <th className='px-3 py-2 text-left'>Tipo de Exame</th>
                    <th className='px-3 py-2 text-left'>Quantidade</th>
                    <th className='px-3 py-2 text-left'>Opções</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l) => (
                    <tr key={l.tempId} className='border-t'>
                      <td className='px-3 py-2'>{l.tipoExameNome}</td>
                      <td className='px-3 py-2'>{l.quantidade}</td>
                      <td className='px-3 py-2'>
                        {modalMode !== 'view' && (
                          <div className='flex items-center gap-1'>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='h-7 w-7'
                              title='Editar linha'
                              onClick={() => handleOpenEditLinha(l)}
                            >
                              <Pencil className='h-3 w-3' />
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='h-7 w-7 text-destructive hover:text-destructive'
                              title='Eliminar linha'
                              onClick={() => handleDeleteLinha(l.tempId)}
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {linhas.length === 0 && (
                    <tr>
                      <td
                        className='px-3 py-4 text-center text-muted-foreground'
                        colSpan={4}
                      >
                        Nenhum exame adicionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className='mt-4'>
            <Label htmlFor='observacoes'>Observações da prescrição</Label>
            <Textarea
              id='observacoes'
              className={textareaClass}
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={modalMode !== 'create'}
            />
          </div>

          <DialogFooter className='flex w-full justify-between'>
            <div className='flex gap-2'>
              {modalMode === 'edit' && editingExameId && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => void handleImprimirExame(editingExameId)}
                >
                  <Printer className='mr-2 h-4 w-4' />
                  Imprimir
                </Button>
              )}
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setModalOpen(false)}
              >
                {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
              </Button>
              {modalMode !== 'view' && canChange && (
                <Button
                  type='button'
                  onClick={handleGuardarPrescricao}
                  disabled={linhas.length === 0 || !dataPrescricao || !utenteId || !medicoId}
                >
                  Guardar prescrição
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={canDelete ? deleteDialogOpen : false}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Prescrição de Exames</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar esta prescrição de exames?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExame.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
              disabled={deleteExame.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteExame.isPending ? 'A eliminar...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TipoExamePickerModal
        open={tipoExamePickerOpen}
        onOpenChange={setTipoExamePickerOpen}
        onSelect={({ id, designacao }) => {
          setLinhas((prev) => [
            ...prev,
            {
              tempId: `linha-${Date.now()}`,
              tipoExameId: id,
              tipoExameNome: designacao,
              quantidade: 1,
              recomendacoes: '',
            },
          ])
        }}
      />

      {/* Modal para editar quantidade/recomendações de uma linha de exame */}
      <Dialog open={editLinhaModalOpen} onOpenChange={setEditLinhaModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Editar linha de exame</DialogTitle>
          </DialogHeader>

          {editLinhaTempId && (
            <div className='space-y-4'>
              <div className='space-y-1'>
                <Label>Exame</Label>
                <Input
                  value={linhas.find((l) => l.tempId === editLinhaTempId)?.tipoExameNome ?? ''}
                  readOnly
                  className={inputClass}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-1'>
                  <Label>Quantidade</Label>
                  <Input
                    type='number'
                    min={1}
                    value={editLinhaQuantidade}
                    onChange={(e) => setEditLinhaQuantidade(Number(e.target.value) || 1)}
                    className={inputClass}
                  />
                </div>
                <div className='space-y-1 md:col-span-2'>
                  <Label>Recomendações</Label>
                  <Textarea
                    value={editLinhaRecomendacoes}
                    onChange={(e) => setEditLinhaRecomendacoes(e.target.value)}
                    className={textareaClass}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setEditLinhaModalOpen(false)}>
              Fechar
            </Button>
            <Button
              type='button'
              onClick={() => {
                if (!editLinhaTempId) return
                setLinhas((prev) =>
                  prev.map((l) =>
                    l.tempId === editLinhaTempId
                      ? { ...l, quantidade: editLinhaQuantidade, recomendacoes: editLinhaRecomendacoes }
                      : l
                  )
                )
                setEditLinhaModalOpen(false)
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


