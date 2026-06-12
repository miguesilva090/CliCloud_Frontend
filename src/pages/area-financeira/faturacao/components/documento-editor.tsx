import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/utils/toast-utils'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import type { EmitirDocumentoRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import { useDocumentoEditor } from '../hooks/use-documento-editor'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import { linhaDocumentoTemConteudo } from '../utils/documento-linha-utils'
import { isConsumidorFinalNif } from '../utils/documento-cliente-utils'
import { DocumentoCabecalhoSection } from './documento-cabecalho-section'
import { DocumentoTabObservacoesBancoSection } from './documento-tab-observacoes-banco-section'
import { DocumentoTabClienteSection } from './documento-tab-cliente-section'
import { DocumentoTabLinhasSection } from './documento-tab-linhas-section'
import { DocumentoTabRetencaoSection } from './documento-tab-retencao-section'
import { DocumentoTabReferenciasMbSection } from './documento-tab-referencias-mb-section'
import { DocumentoTabMovimentosUtenteSection } from './documento-tab-movimentos-utente-section'
import { DocumentoTotaisPanel } from './documento-totais-panel'
import { DocumentoEditorToolbar } from './documento-editor-toolbar'
import { DocumentoDescontosModal } from './documento-descontos-modal'
import { DocumentoFaturaGlobalDialog } from './documento-fatura-global-dialog'
import { DocumentoSinistradosInfoDialog } from './documento-sinistrados-info-dialog'
import { mapFaturaGlobalObterToEditorPatch } from '../utils/map-fatura-global-obter'
import { mapSinistradosInfoToEditorPatch } from '../utils/map-sinistrados-info-faturacao'
import type { FicheiroEletronicoSiglaSlug } from '@/pages/area-financeira/ficheiros-eletronicos/constants/ficheiro-eletronico-siglas'
import {
  ORGANISMO_DESCONTO_BLOQUEADO_MSG,
  descontosBloqueadosNoEditor,
  organismoRestringeDescontosPorSiglaFicheiro,
} from '../utils/organismo-desconto-utils'

export function DocumentoEditor({
  tipo,
  mode = 'create',
  initialState,
  onSubmit,
  onCancel,
  isSubmitting,
  contextoFicheiroEletronicoSiglaSlug,
  initialPatch: initialPatchProp,
}: {
  tipo: TipoDocumentoLightDTO
  mode?: 'create' | 'view'
  initialState?: DocumentoEditorState
  initialPatch?: Partial<DocumentoEditorState> | null
  onSubmit?: (payload: EmitirDocumentoRequest) => void
  onCancel?: () => void
  isSubmitting?: boolean
  contextoFicheiroEletronicoSiglaSlug?: FicheiroEletronicoSiglaSlug | null
}) {
  const readOnly = mode === 'view'
  const [descontosOpen, setDescontosOpen] = useState(false)
  const [faturaGlobalOpen, setFaturaGlobalOpen] = useState(false)
  const [sinistradosOpen, setSinistradosOpen] = useState(false)

  const contextoInitialPatch = useMemo(() => {
    const base = contextoFicheiroEletronicoSiglaSlug
      ? {
          tipoCliente: 'organismo' as const,
          utenteId: null,
          organismoRestringeDescontos: organismoRestringeDescontosPorSiglaFicheiro(
            contextoFicheiroEletronicoSiglaSlug,
          ),
        }
      : null
    if (!base && !initialPatchProp) return null
    return { ...base, ...initialPatchProp }
  }, [contextoFicheiroEletronicoSiglaSlug, initialPatchProp])

  const {
    state,
    perfil,
    totais,
    opcoesCalculo,
    patch,
    toEmitirRequest,
    moedaItems,
    motivoIsencaoItems,
    condicaoPagamentoItems,
    modoPagamentoItems,
    tipoSerieItems,
    referenciaMbItems,
    impostosRetencaoItems,
  } = useDocumentoEditor(tipo, {
      initialState: initialState ?? null,
      initialPatch: contextoInitialPatch,
      freezeTipoReset: readOnly,
    })

  const clienteBloqueado = readOnly || state.linhas.some(linhaDocumentoTemConteudo)
  const descontosBloqueados = descontosBloqueadosNoEditor(state)

  const handleGuardar = () => {
    if (!onSubmit) return
    const payload = toEmitirRequest()
    if (!payload) {
      if (state.retencaoAtiva && !state.retencaoMotivo.trim()) {
        toast.error('Preencha o motivo da retenção na fonte.')
        return
      }
      if (
        state.retencaoAtiva &&
        state.retencaoTaxa <= 0 &&
        state.retencaoValor <= 0
      ) {
        toast.error('Indique taxa ou valor da retenção na fonte.')
        return
      }
      if (
        perfil.mostraDocOrigem &&
        !state.documentoOrigemId &&
        !state.identificadorUnicoDocumentoOrigem.trim()
      ) {
        toast.error('Indique o documento de origem no cabeçalho.')
        return
      }
      if (state.isentoIva && !state.motivoIsencaoId) {
        toast.error('Indique o motivo de isenção de IVA.')
        return
      }
      toast.error(
        'Preencha cliente (nome e morada) e pelo menos uma linha válida.',
      )
      return
    }
    if (
      isConsumidorFinalNif(payload.numeroContribuinteCliente) &&
      totais.mercadorias > 1000
    ) {
      toast.error(
        'Consumidor final com NIF 999999990/123456789 não pode exceder 1000,00€.',
      )
      return
    }
    if (descontosBloqueados && totais.descontos > 0) {
      toast.error(ORGANISMO_DESCONTO_BLOQUEADO_MSG)
      return
    }
    onSubmit(payload)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <h2 className='text-lg font-semibold'>
          {state.tipoAbreviatura} — {state.tipoDescricao}
        </h2>
        {readOnly ? (
          <Badge variant='secondary'>Consulta (emitido)</Badge>
        ) : null}
      </div>

      <DocumentoEditorToolbar
        readOnly={readOnly}
        descontosBloqueados={descontosBloqueados}
        onDescontos={readOnly ? undefined : () => setDescontosOpen(true)}
        onFaturaGlobal={readOnly ? undefined : () => setFaturaGlobalOpen(true)}
        onSinistrados={readOnly ? undefined : () => setSinistradosOpen(true)}
        onGuardar={handleGuardar}
        onVoltar={onCancel}
        isSubmitting={isSubmitting}
      />

      <DocumentoFaturaGlobalDialog
        open={faturaGlobalOpen}
        onOpenChange={setFaturaGlobalOpen}
        organismoId={state.organismoId}
        dataDe={state.faturaGlobalDesde}
        dataAte={state.faturaGlobalAte}
        onApply={(data) => patch(mapFaturaGlobalObterToEditorPatch(data))}
      />
      <DocumentoSinistradosInfoDialog
        open={sinistradosOpen}
        onOpenChange={setSinistradosOpen}
        onApply={(data) => patch(mapSinistradosInfoToEditorPatch(data))}
      />

      <DocumentoDescontosModal
        open={descontosOpen}
        onOpenChange={setDescontosOpen}
        state={state}
        descontosBloqueados={descontosBloqueados}
        onChange={patch}
      />

      <fieldset
        disabled={readOnly}
        className='grid gap-6 xl:grid-cols-[1fr_300px] disabled:opacity-100'
      >
        <div className='space-y-4'>
          <DocumentoCabecalhoSection
            state={state}
            perfil={perfil}
            onChange={patch}
            readOnly={readOnly}
            motivoIsencaoItems={motivoIsencaoItems}
            condicaoPagamentoItems={condicaoPagamentoItems}
            modoPagamentoItems={modoPagamentoItems}
            tipoSerieItems={tipoSerieItems}
          />
          <DocumentoTabObservacoesBancoSection
            state={state}
            onChange={patch}
            readOnly={readOnly}
          />
          <Tabs defaultValue='cliente'>
            <TabsList className='flex h-auto flex-wrap'>
              <TabsTrigger value='cliente'>Cliente</TabsTrigger>
              <TabsTrigger value='linhas'>Linhas de Faturação</TabsTrigger>
              {perfil.mostraTabAdmissoes && !readOnly ? (
                <TabsTrigger value='movimentos'>
                  Movimentos do Utente
                </TabsTrigger>
              ) : null}
              {perfil.mostraRetencao ? (
                <TabsTrigger value='retencao'>Retenção na Fonte</TabsTrigger>
              ) : null}
              {perfil.mostraReferenciasMb && !readOnly ? (
                <TabsTrigger value='mb'>Ref. MB / MBWay</TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent value='cliente' className='pt-4'>
              <DocumentoTabClienteSection
                state={state}
                onChange={patch}
                clienteBloqueado={clienteBloqueado}
                contextoFicheiroEletronicoSiglaSlug={
                  contextoFicheiroEletronicoSiglaSlug
                }
              />
            </TabsContent>
            <TabsContent value='linhas' className='pt-4'>
              <DocumentoTabLinhasSection
                state={state}
                perfil={perfil}
                opcoesCalculo={opcoesCalculo}
                descontosBloqueados={descontosBloqueados}
                onChange={patch}
              />
            </TabsContent>
            {perfil.mostraTabAdmissoes && !readOnly ? (
              <TabsContent value='movimentos' className='pt-4'>
                <DocumentoTabMovimentosUtenteSection state={state} onChange={patch} />
              </TabsContent>
            ) : null}
            {perfil.mostraRetencao ? (
              <TabsContent value='retencao' className='pt-4'>
                <DocumentoTabRetencaoSection
                  state={state}
                  totais={totais}
                  onChange={patch}
                  impostos={impostosRetencaoItems}
                />
              </TabsContent>
            ) : null}
            {perfil.mostraReferenciasMb && !readOnly ? (
              <TabsContent value='mb' className='pt-4'>
                <DocumentoTabReferenciasMbSection
                  state={state}
                  onChange={patch}
                  opcoes={referenciaMbItems}
                />
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
        <DocumentoTotaisPanel
          totais={totais}
          moedaId={state.moedaId}
          moedaCodigo={state.moedaCodigo}
          cambio={state.cambio}
          moedas={moedaItems}
          readOnly={readOnly}
          onMoedaChange={(moedaId, moedaLabel) => 
            patch({
              moedaId,
              moedaCodigo: moedaLabel,
              cambio: !moedaId ? 1 : state.cambio,
            })
          }
          onCambioChange={(v) => patch({ cambio: v })}
        />
      </fieldset>
    </div>
  )
}
