import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Pencil, Trash2, Printer, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import {
  useAssinarRelatorioAtestado,
  useCreateRelatorioAtestado,
  useDeleteRelatorioAtestado,
  useGetRelatoriosAtestadoByUtente,
  useUpdateRelatorioAtestado,
} from '../queries/relatorio-atestado-queries'
import {
  useCreateModeloRelatorioAtestado,
  useDeleteModeloRelatorioAtestado,
  useGetModelosRelatorioAtestado,
  useUpdateModeloRelatorioAtestado,
} from '../queries/modelos-relatorio-atestado-queries'
import type { ModeloRelatorioAtestadoDTO } from '@/lib/services/processo-clinico/modelos-relatorio-atestado-service'
import { useGetUtente } from '@/pages/utentes/queries/utentes-queries'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type {
  CreateRelatorioAtestadoRequest,
  UpdateRelatorioAtestadoRequest,
  RelatorioAtestadoDTO,
} from '@/lib/services/processo-clinico/relatorio-atestado-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
// JsBarcode só é usado no cliente (preview/impressão)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import JsBarcode from 'jsbarcode'

type RelatorioAtestadoTabProps = {
  utenteId?: string
}

type ModalMode = 'create' | 'edit' | 'view'
type ModeloModalMode = 'list' | 'create' | 'edit' | 'view'

export function RelatorioAtestadoTab({ utenteId }: RelatorioAtestadoTabProps) {
  const auth = useAuthStore()
  const medicoId = auth.userId ?? ''

  // Dados do utente (para placeholders e documento)
  const utenteQuery = useGetUtente(utenteId ?? '')
  const utenteData = utenteQuery.data?.info?.data as UtenteDTO | undefined

  const { data: relatorios = [], isLoading } = useGetRelatoriosAtestadoByUtente(utenteId)
  const createMutation = useCreateRelatorioAtestado()
  const updateMutation = useUpdateRelatorioAtestado()
  const deleteMutation = useDeleteRelatorioAtestado()
  const assinarMutation = useAssinarRelatorioAtestado()

  // Modelos de relatório/atestado
  const { data: modelos = [] } = useGetModelosRelatorioAtestado()
  const createModeloMutation = useCreateModeloRelatorioAtestado()
  const updateModeloMutation = useUpdateModeloRelatorioAtestado()
  const deleteModeloMutation = useDeleteModeloRelatorioAtestado()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editing, setEditing] = useState<RelatorioAtestadoDTO | null>(null)

  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<RelatorioAtestadoDTO | null>(null)

  // Estado do modal de modelos
  const [modelosModalOpen, setModelosModalOpen] = useState(false)
  const [modeloModalMode, setModeloModalMode] = useState<ModeloModalMode>('list')
  const [editingModelo, setEditingModelo] = useState<ModeloRelatorioAtestadoDTO | null>(null)
  const [modeloTitulo, setModeloTitulo] = useState('')
  const [modeloTexto, setModeloTexto] = useState('')

  // Dados do médico atual (para placeholders de médico nos modelos)
  const [medicoNomeFromApi, setMedicoNomeFromApi] = useState<string>('')
  const [medicoNumeroProfFromApi, setMedicoNumeroProfFromApi] = useState<string>('')
  const [medicoEspecialidadeFromApi, setMedicoEspecialidadeFromApi] = useState<string>('')

  useEffect(() => {
    const loadMedicoAtual = async () => {
      try {
        const svc = MedicosService('processo-clinico')
        const res = await svc.getCurrentMedico()
        const medico = res.info?.data
        if (medico) {
          setMedicoNomeFromApi(medico.nome ?? '')
          setMedicoNumeroProfFromApi(medico.carteira ?? '')
          // Especialidade pode vir como objeto com nome ou campo direto
          // @ts-expect-error – DTO pode não tipar especialidade em detalhe
          const especialidadeNome = medico.especialidade?.nome ?? medico.especialidadeNome ?? ''
          setMedicoEspecialidadeFromApi(especialidadeNome)
        }
      } catch {
        // silencioso – usamos fallbacks de auth / vazio
      }
    }
    void loadMedicoAtual()
  }, [])

  const insertIntoModeloTexto = (snippet: string) => {
    setModeloTexto((prev) => {
      if (!prev) return snippet
      const needsSpace = !/\s$/.test(prev)
      return `${prev}${needsSpace ? ' ' : ''}${snippet}`
    })
  }

  const sortedRelatorios = useMemo(
    () =>
      [...relatorios].sort((a, b) =>
        a.createdOn < b.createdOn ? 1 : a.createdOn > b.createdOn ? -1 : 0,
      ),
    [relatorios],
  )

  useEffect(() => {
    if (!modalOpen) return
    if (modalMode === 'edit' && editing) {
      setTitulo(editing.titulo)
      setTexto(editing.textoHtml)
    }
  }, [modalOpen, modalMode, editing])

  const canSubmit = !!utenteId && !!medicoId && titulo.trim().length > 0 && texto.trim().length > 0

  const handleOpenCreate = () => {
    if (!utenteId) {
      toast.error('Selecione um utente antes de criar um Relatório/Atestado.')
      return
    }
    setModalMode('create')
    setEditing(null)
    setTitulo('')
    setTexto('')
    setModalOpen(true)
  }

  const handleInsertDataAtual = () => {
    const data = format(new Date(), 'dd/MM/yyyy')
    setTexto((prev) => (prev ? `${prev}
${data}` : data))
  }

  const handleOpenModelos = () => {
    setModeloModalMode('list')
    setEditingModelo(null)
    setModelosModalOpen(true)
  }

  const handleOpenEdit = (r: RelatorioAtestadoDTO) => {
    setModalMode('edit')
    setEditing(r)
    setModalOpen(true)
  }

  const handleOpenDelete = (r: RelatorioAtestadoDTO) => {
    setToDelete(r)
    setDeleteDialogOpen(true)
  }

  const buildCreatePayload = (): CreateRelatorioAtestadoRequest | null => {
    if (!utenteId || !medicoId) return null
    return {
      utenteId,
      medicoId,
      titulo: titulo.trim(),
      textoHtml: texto.trim(),
    }
  }

  const buildUpdatePayload = (): UpdateRelatorioAtestadoRequest | null => {
    if (!editing || !utenteId || !medicoId) return null
    return {
      utenteId,
      medicoId,
      titulo: titulo.trim(),
      textoHtml: texto.trim(),
    }
  }

  const handleSave = async () => {
    if (!canSubmit) {
      toast.error('Preencha título e texto do Relatório/Atestado.')
      return
    }

    try {
      if (modalMode === 'create') {
        const payload = buildCreatePayload()
        if (!payload) return
        await createMutation.mutateAsync(payload)
        toast.success('Relatório/Atestado criado com sucesso.')
      } else if (modalMode === 'edit' && editing) {
        const payload = buildUpdatePayload()
        if (!payload) return
        await updateMutation.mutateAsync({ id: editing.id, data: payload })
        toast.success('Relatório/Atestado atualizado com sucesso.')
      }
      setModalOpen(false)
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Falha ao guardar Relatório/Atestado.'
      toast.error(msg)
    }
  }

  const handleConfirmDelete = async () => {
    if (!toDelete || !utenteId) return
    try {
      await deleteMutation.mutateAsync({ id: toDelete.id, utenteId })
      toast.success('Relatório/Atestado eliminado com sucesso.')
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Falha ao eliminar Relatório/Atestado.'
      toast.error(msg)
    } finally {
      setDeleteDialogOpen(false)
      setToDelete(null)
    }
  }

  const handleAssinar = async (r: RelatorioAtestadoDTO) => {
    if (!utenteId) {
      toast.error('Selecione um utente antes de assinar.')
      return
    }
    try {
      await assinarMutation.mutateAsync({ id: r.id, utenteId })
      toast.success('Relatório/Atestado assinado com sucesso.')
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Falha ao assinar Relatório/Atestado.'
      toast.error(msg)
    }
  }

  const [viewing, setViewing] = useState<RelatorioAtestadoDTO | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const handleOpenView = (r: RelatorioAtestadoDTO) => {
    setViewing(r)
    setViewDialogOpen(true)
  }

  const buildDocumentoBodyHtml = (r: RelatorioAtestadoDTO): string => {
    const nomeUtente = utenteData?.nome ?? ''
    const numeroUtente = utenteData?.numeroUtente ?? ''
    const nifUtente = utenteData?.numeroContribuinte ?? ''

    const moradaPartes: string[] = []
    if (utenteData?.rua?.nome) moradaPartes.push(utenteData.rua.nome)
    if (utenteData?.numeroPorta) moradaPartes.push(utenteData.numeroPorta)
    if (utenteData?.andarRua) moradaPartes.push(utenteData.andarRua)
    const moradaUtente = moradaPartes.join(', ')

    const localidadeUtente =
      (utenteData as any)?.codigoPostal?.localidade ??
      utenteData?.concelho?.nome ??
      (utenteData as any)?.freguesia?.concelho?.nome ??
      ''

    const organismoUtente = utenteData?.organismo?.nome ?? ''
    const beneficiarioUtente = utenteData?.subsistemaLinhas?.[0]?.nomeBeneficiario ?? ''
    const dataNascimentoUtente = utenteData?.dataNascimento ?? ''
    const profissaoUtente = utenteData?.profissao?.descricao ?? ''
    const telemovelUtente =
      utenteData?.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 2)?.valor ?? ''

    const medicoNome = r.medicoNome ?? auth.name ?? ''
    const especialidadeMedico = medicoEspecialidadeFromApi ?? ''

    const hoje = new Date()
    const dataCabecalho = format(hoje, 'dd-MM-yyyy')

    const textoHtml = r.textoHtml

    return `
        <div style="font-family: Arial, sans-serif; font-size: 12px; margin: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <div style="font-size: 11px; line-height: 1.4;">
            <div style="margin-bottom: 2px;">Av. João Branco, 1678</div>
            <div style="margin-bottom: 2px;">2660-273 Santo António dos Cavaleiros</div>
            <div style="margin-bottom: 2px;">Tel. e-mail. global@</div>
            <div style="margin-bottom: 2px;">CRC nº | Capital Social.</div>
            <div style="margin-bottom: 2px;">NIF. 99999999</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold;">${r.titulo}</div>
            <div><strong>Data:</strong> ${dataCabecalho}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 11px; line-height: 1.4;">
          <div>
            <div style="margin-bottom: 2px;"><strong>Nome:</strong> ${nomeUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Organismo:</strong> ${organismoUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Nº Utente:</strong> ${numeroUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Beneficiário:</strong> ${beneficiarioUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Data Nascimento:</strong> ${dataNascimentoUtente}</div>
          </div>
          <div>
            <div style="margin-bottom: 2px;"><strong>Morada:</strong> ${moradaUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Localidade:</strong> ${localidadeUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Profissão:</strong> ${profissaoUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Contribuinte:</strong> ${nifUtente}</div>
            <div style="margin-bottom: 2px;"><strong>Telemóvel:</strong> ${telemovelUtente}</div>
          </div>
        </div>

        <hr style="margin: 8px 0 16px 0;" />

        <div style="margin-top: 16px; font-size: 12px;">
          ${textoHtml}
        </div>

        <div style="margin-top: 32px; display: flex; justify-content: space-between; font-size: 11px;">
          <div>
            <div>______________________________</div>
            <div>Assinatura</div>
          </div>
          <div style="text-align: center;">
            <div>${medicoNome}</div>
            <div>${especialidadeMedico}</div>
            <div style="margin-top: 8px;">
              <svg id="medico-barcode" style="width: 160px; height: 40px;"></svg>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px; text-align: center; font-size: 9px;">
          (DOCUMENTO PROCESSADO POR COMPUTADOR)
        </div>

        <div style="margin-top: 8px; text-align: right; font-size: 9px;">
          Copyright© Globalsoft 1992-2026
        </div>
      </div>
    `
  }

  const applyPlaceholders = (html: string): string => {
    const medicoFromRelatorio = relatorios[0]
    const medicoNome =
      (medicoFromRelatorio?.medicoNome || medicoNomeFromApi || auth.name || '').trim()
    const medicoNumeroProfissional =
      (medicoFromRelatorio?.medicoNumeroProfissional || medicoNumeroProfFromApi || '').trim()
    const especialidadeMedico = (medicoEspecialidadeFromApi || '').trim()

    const nomeUtente = utenteData?.nome ?? ''
    const numeroUtente = utenteData?.numeroUtente ?? ''
    const nifUtente = utenteData?.numeroContribuinte ?? ''

    const moradaPartes: string[] = []
    if (utenteData?.rua?.nome) moradaPartes.push(utenteData.rua.nome)
    if (utenteData?.numeroPorta) moradaPartes.push(utenteData.numeroPorta)
    if (utenteData?.andarRua) moradaPartes.push(utenteData.andarRua)
    const moradaUtente = moradaPartes.join(', ')

    const localidadeUtente =
      (utenteData as any)?.codigoPostal?.localidade ??
      utenteData?.concelho?.nome ??
      (utenteData as any)?.freguesia?.concelho?.nome ??
      ''

    const organismoUtente = utenteData?.organismo?.nome ?? ''
    const beneficiarioUtente = utenteData?.subsistemaLinhas?.[0]?.nomeBeneficiario ?? ''
    const dataNascimentoUtente = utenteData?.dataNascimento ?? ''
    const profissaoUtente = utenteData?.profissao?.descricao ?? ''
    const telemovelUtente =
      utenteData?.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 2)?.valor ?? ''

    return html
      // Sintaxe {{Campo}}
      .replace(/{{\s*NomeUtente\s*}}/gi, nomeUtente)
      .replace(/{{\s*MoradaUtente\s*}}/gi, moradaUtente)
      .replace(/{{\s*LocalidadeUtente\s*}}/gi, localidadeUtente)
      .replace(/{{\s*NumeroUtente\s*}}/gi, numeroUtente)
      .replace(/{{\s*NifUtente\s*}}/gi, nifUtente)
      .replace(/{{\s*OrganismoUtente\s*}}/gi, organismoUtente)
      .replace(/{{\s*BeneficiarioUtente\s*}}/gi, beneficiarioUtente)
      .replace(/{{\s*DataNascimentoUtente\s*}}/gi, dataNascimentoUtente)
      .replace(/{{\s*ProfissaoUtente\s*}}/gi, profissaoUtente)
      .replace(/{{\s*TelemovelUtente\s*}}/gi, telemovelUtente)
      .replace(/{{\s*NomeMedico\s*}}/gi, medicoNome)
      .replace(/{{\s*NumeroProfissionalMedico\s*}}/gi, medicoNumeroProfissional)
      .replace(/{{\s*EspecialidadeMedico\s*}}/gi, especialidadeMedico)
      // Sintaxe [[Campo]] – suportar modelos antigos/legado
      .replace(/\[\[\s*NomeUtente\s*\]\]/gi, nomeUtente)
      .replace(/\[\[\s*MoradaUtente\s*\]\]/gi, moradaUtente)
      .replace(/\[\[\s*LocalidadeUtente\s*\]\]/gi, localidadeUtente)
      .replace(/\[\[\s*NumeroUtente\s*\]\]/gi, numeroUtente)
      .replace(/\[\[\s*NifUtente\s*\]\]/gi, nifUtente)
      .replace(/\[\[\s*OrganismoUtente\s*\]\]/gi, organismoUtente)
      .replace(/\[\[\s*BeneficiarioUtente\s*\]\]/gi, beneficiarioUtente)
      .replace(/\[\[\s*DataNascimentoUtente\s*\]\]/gi, dataNascimentoUtente)
      .replace(/\[\[\s*ProfissaoUtente\s*\]\]/gi, profissaoUtente)
      .replace(/\[\[\s*TelemovelUtente\s*\]\]/gi, telemovelUtente)
      .replace(/\[\[\s*NomeMedico\s*\]\]/gi, medicoNome)
      .replace(/\[\[\s*NumeroProfissionalMedico\s*\]\]/gi, medicoNumeroProfissional)
      .replace(/\[\[\s*EspecialidadeMedico\s*\]\]/gi, especialidadeMedico)
  }

  const handleImprimir = (r: RelatorioAtestadoDTO) => {
    const documentoBodyHtml = buildDocumentoBodyHtml(r)
    const medicoNumeroProfissional = (r.medicoNumeroProfissional ?? '').trim()

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title> </title>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  </head>
  <body onload="(function() {
    try {
      var value = '${medicoNumeroProfissional.replace(/'/g, "\\'")}';
      if (value && typeof JsBarcode !== 'undefined') {
        JsBarcode('#medico-barcode', value, { format: 'CODE128', width: 1, height: 40, displayValue: false, margin: 0 });
      }
    } catch (e) {}
    window.print();
  })()">
    ${documentoBodyHtml}
  </body>
</html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
  }

  // Gerar código de barras também no preview "Ver Relatório/Atestado"
  useEffect(() => {
    if (!viewDialogOpen || !viewing) return
    const value = (viewing.medicoNumeroProfissional ?? '').trim()
    if (!value) return
    try {
      const svg = document.getElementById('medico-barcode') as SVGSVGElement | null
      if (!svg) return
      JsBarcode(svg, value, {
        format: 'CODE128',
        width: 1,
        height: 40,
        displayValue: false,
        margin: 0,
      })
    } catch {
      // silencioso – se falhar, continua a mostrar o número em texto
    }
  }, [viewDialogOpen, viewing])

  return (
    <div className='flex flex-col gap-4 rounded-lg border bg-card p-4'>
      <div className='flex items-center justify-between gap-2'>
        <h3 className='text-sm font-semibold'>Relatórios e Atestados</h3>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handleOpenModelos} disabled={!utenteId}>
            Modelos
          </Button>
          <Button variant='outline' size='sm' onClick={handleOpenCreate} disabled={!utenteId}>
            Adicionar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className='text-sm text-muted-foreground'>A carregar relatórios/atestados…</div>
      ) : sortedRelatorios.length === 0 ? (
        <div className='text-sm text-muted-foreground'>
          Ainda não existem Relatórios/Atestados para este utente.
        </div>
      ) : (
        <div className='space-y-3'>
          {sortedRelatorios.map((r) => (
            <div
              key={r.id}
              className='flex flex-col gap-2 rounded-md border bg-background p-3 md:flex-row md:items-center md:justify-between'
            >
              <div>
                <div className='text-sm font-semibold'>{r.titulo}</div>
                <div className='text-xs text-muted-foreground'>
                  {format(new Date(r.createdOn), 'dd/MM/yyyy HH:mm')}
                  {r.assinadoEm && (
                    <span className='ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-700'>
                      <Check className='h-3 w-3' /> Assinado em{' '}
                      {format(new Date(r.assinadoEm), 'dd/MM/yyyy HH:mm')}
                    </span>
                  )}
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleOpenView(r)}
                  className='flex items-center gap-1'
                >
                  <Eye className='h-3 w-3' />
                  Ver
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleOpenEdit(r)}
                  className='flex items-center gap-1'
                >
                  <Pencil className='h-3 w-3' />
                  Editar
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleOpenDelete(r)}
                  className='flex items-center gap-1'
                >
                  <Trash2 className='h-3 w-3' />
                  Apagar
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleImprimir(r)}
                  className='flex items-center gap-1'
                >
                  <Printer className='h-3 w-3' />
                  Imprimir
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleAssinar(r)}
                  disabled={!!r.assinadoEm}
                  className={cn(
                    'flex items-center gap-1',
                    r.assinadoEm && 'opacity-60 cursor-default',
                  )}
                >
                  <Check className='h-3 w-3' />
                  {r.assinadoEm ? 'Já assinado' : 'Assinar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar/Ver */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create'
                ? 'Adicionar Relatório/Atestado'
                : modalMode === 'edit'
                ? 'Editar Relatório/Atestado'
                : 'Ver Relatório/Atestado'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-medium text-muted-foreground'>
                Descrição
              </label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={modalMode === 'view'}
                placeholder='Descrição...'
              />
            </div>
            <div>
              <div className='mb-1 flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>
                  Texto do Relatório/Atestado
                </span>
                {modalMode !== 'view' && (
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      type='button'
                      onClick={handleInsertDataAtual}
                    >
                      Data atual
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      type='button'
                      onClick={handleOpenModelos}
                    >
                      Modelos de Relatório/Atestado
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={10}
                disabled={modalMode === 'view'}
              />
            </div>
          </div>
          {modalMode !== 'view' && (
            <DialogFooter>
              <Button variant='outline' onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!canSubmit}>
                Guardar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Ver Relatório/Atestado (preview rico) */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Relatório/Atestado</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className='space-y-4'>
              <div
                className='rounded-md border bg-background p-4 text-sm'
                dangerouslySetInnerHTML={{ __html: buildDocumentoBodyHtml(viewing) }}
              />
              <DialogFooter className='flex items-center justify-between gap-2'>
                <Button
                  variant='outline'
                  type='button'
                  onClick={async () => {
                    if (!utenteId || !viewing) return
                    try {
                      await assinarMutation.mutateAsync({ id: viewing.id, utenteId })
                      toast.success('Relatório/Atestado assinado com sucesso.')
                    } catch (error) {
                      const msg =
                        error instanceof Error
                          ? error.message
                          : 'Falha ao assinar Relatório/Atestado.'
                      toast.error(msg)
                    }
                  }}
                  disabled={!viewing || !!viewing.assinadoEm}
                >
                  Assinar Relatório/Atestado
                </Button>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={() => viewing && handleImprimir(viewing)}
                  >
                    Imprimir
                  </Button>
                  <Button type='button' onClick={() => setViewDialogOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Modelos Relatório/Atestado */}
      <Dialog open={modelosModalOpen} onOpenChange={setModelosModalOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Modelos de Relatório/Atestado</DialogTitle>
          </DialogHeader>
          {modeloModalMode === 'list' ? (
            <div className='space-y-4'>
              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setModeloModalMode('create')
                    setEditingModelo(null)
                    setModeloTitulo('')
                    setModeloTexto('')
                  }}
                >
                  Novo modelo
                </Button>
              </div>
              {modelos.length === 0 ? (
                <div className='text-sm text-muted-foreground'>
                  Ainda não existem modelos de Relatório/Atestado.
                </div>
              ) : (
                <div className='space-y-2'>
                  {modelos.map((m) => (
                    <div
                      key={m.id}
                      className='flex flex-col gap-2 rounded-md border bg-background p-3 md:flex-row md:items-center md:justify-between'
                    >
                      <div>
                        <div className='text-sm font-semibold'>{m.titulo}</div>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setModeloModalMode('view')
                            setEditingModelo(m)
                            setModeloTitulo(m.titulo)
                            setModeloTexto(m.textoHtml)
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setModeloModalMode('edit')
                            setEditingModelo(m)
                            setModeloTitulo(m.titulo)
                            setModeloTexto(m.textoHtml)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            const aplicado = applyPlaceholders(m.textoHtml)
                            setTexto(aplicado)
                            if (!titulo) {
                              setTitulo(m.titulo)
                            }
                            setModelosModalOpen(false)
                            if (!modalOpen) {
                              setModalMode('create')
                              setEditing(null)
                              setModalOpen(true)
                            }
                          }}
                        >
                          Usar
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={async () => {
                            try {
                              await deleteModeloMutation.mutateAsync(m.id)
                              toast.success('Modelo eliminado com sucesso.')
                            } catch (error) {
                              const msg =
                                error instanceof Error
                                  ? error.message
                                  : 'Falha ao eliminar modelo.'
                              toast.error(msg)
                            }
                          }}
                        >
                          Apagar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              <div>
                <label className='block text-xs font-medium text-muted-foreground'>Título</label>
                <Input
                  value={modeloTitulo}
                  onChange={(e) => setModeloTitulo(e.target.value)}
                  disabled={modeloModalMode === 'view'}
                />
              </div>
              <div>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Texto do modelo (HTML simples permitido)
                  </span>
                  {modeloModalMode !== 'view' && (
                    <div className='flex items-center gap-2'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='outline' size='sm' type='button'>
                            + Utente
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => insertIntoModeloTexto('{{NomeUtente}}')}>
                            Nome
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{MoradaUtente}}')}
                          >
                            Morada
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{LocalidadeUtente}}')}
                          >
                            Localidade
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{NumeroUtente}}')}
                          >
                            Nº Utente
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => insertIntoModeloTexto('{{NifUtente}}')}>
                            Nº Contribuinte
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{OrganismoUtente}}')}
                          >
                            Organismo
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{BeneficiarioUtente}}')}
                          >
                            Nº Beneficiário
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{DataNascimentoUtente}}')}
                          >
                            Data Nascimento
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{ProfissaoUtente}}')}
                          >
                            Profissão
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{TelemovelUtente}}')}
                          >
                            Telemóvel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='outline' size='sm' type='button'>
                            + Médico
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => insertIntoModeloTexto('{{NomeMedico}}')}>
                            Nome
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{NumeroProfissionalMedico}}')}
                          >
                            Carteira Profissional
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertIntoModeloTexto('{{EspecialidadeMedico}}')}
                          >
                            Especialidade
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                <Textarea
                  value={modeloTexto}
                  onChange={(e) => setModeloTexto(e.target.value)}
                  rows={10}
                  disabled={modeloModalMode === 'view'}
                />
                <p className='mt-1 text-[11px] text-muted-foreground'>
                  Pode utilizar placeholders como {'{{NomeUtente}}'}, {'{{MoradaUtente}}'},
                  {'{{LocalidadeUtente}}'}, {'{{NumeroUtente}}'}, {'{{NifUtente}}'},
                  {'{{OrganismoUtente}}'}, {'{{BeneficiarioUtente}}'}, {'{{DataNascimentoUtente}}'},
                  {'{{ProfissaoUtente}}'}, {'{{TelemovelUtente}}'}, {'{{NomeMedico}}'},
                  {'{{NumeroProfissionalMedico}}'} e {'{{EspecialidadeMedico}}'}, que serão
                  substituídos automaticamente.
                </p>
              </div>
              {modeloModalMode !== 'view' && (
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setModeloModalMode('list')
                      setEditingModelo(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!modeloTitulo.trim() || !modeloTexto.trim()) {
                        toast.error('Preencha título e texto do modelo.')
                        return
                      }
                      try {
                        if (modeloModalMode === 'create') {
                          await createModeloMutation.mutateAsync({
                            titulo: modeloTitulo.trim(),
                            textoHtml: modeloTexto.trim(),
                          })
                          toast.success('Modelo criado com sucesso.')
                        } else if (modeloModalMode === 'edit' && editingModelo) {
                          await updateModeloMutation.mutateAsync({
                            id: editingModelo.id,
                            data: {
                              titulo: modeloTitulo.trim(),
                              textoHtml: modeloTexto.trim(),
                            },
                          })
                          toast.success('Modelo atualizado com sucesso.')
                        }
                        setModeloModalMode('list')
                        setEditingModelo(null)
                      } catch (error) {
                        const msg =
                          error instanceof Error
                            ? error.message
                            : 'Falha ao guardar modelo de relatório/atestado.'
                        toast.error(msg)
                      }
                    }}
                  >
                    Guardar
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog apagar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Relatório/Atestado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende apagar este Relatório/Atestado? Esta ação não pode ser
              anulada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

