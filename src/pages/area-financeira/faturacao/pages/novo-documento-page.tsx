import { useEffect, useMemo, useState } from 'react'
import { ResponseStatus } from '@/types/api/responses'
import { useSearchParams } from 'react-router-dom'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { toast } from '@/utils/toast-utils'
import {
  useEmitirDocumentoDesdeAdmissaoMutation,
  useEmitirDocumentoDesdeConsultaMutation,
  useEmitirDocumentoMutation,
} from '@/pages/area-financeira/documentos/queries/documento-emissao-queries'
import type {
  EmitirDocumentoDesdeAdmissaoRequest,
  EmitirDocumentoDesdeConsultaRequest,
  EmitirDocumentoRequest,
} from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import { useGetTiposDocumentoLight } from '../queries/tipo-documento-queries'
import { useInvalidateDocumentosMutation } from '../queries/documento-queries'
import { SelecionarTipoDocumentoDialog } from '../components/selecionar-tipo-documento-dialog'
import { DocumentoEditor } from '../components/documento-editor'
import {
  getFaturacaoApiErrorMessage,
  isFaturacaoApiSuccess,
} from '../utils/faturacao-api-utils'
import {
  resolveSiglaFromSlug,
  type FicheiroEletronicoSiglaSlug,
} from '@/pages/area-financeira/ficheiros-eletronicos/constants/ficheiro-eletronico-siglas'

const ID_FUNCIONALIDADE = 'documentos'

function mapEmitirRequestParaOrigem(
  payload: EmitirDocumentoRequest,
): EmitirDocumentoDesdeAdmissaoRequest & EmitirDocumentoDesdeConsultaRequest {
  return {
    tipoDocumentoId: payload.tipoDocumentoId,
    anoFiscal: payload.anoFiscal,
    dataDocumento: payload.dataDocumento ?? null,
    dataVencimentoPagamento: payload.dataVencimentoPagamento ?? null,
    funcionarioId: payload.funcionarioId ?? null,
    condicaoPagamento: payload.condicaoPagamento ?? null,
    tipoModoPagamento: payload.tipoModoPagamento ?? null,
    moedaId: payload.moedaId ?? null,
    bancoId: payload.bancoId ?? null,
    descontoCliente: payload.descontoCliente ?? null,
    descontoPagamento: payload.descontoPagamento ?? null,
    outros: payload.outros ?? null,
    isentoIva: payload.isentoIva ?? false,
    ivaCaixa: payload.ivaCaixa ?? false,
    codigoTipoDocSaft: payload.codigoTipoDocSaft ?? null,
    nomeCliente: payload.nomeCliente ?? null,
    moradaCliente: payload.moradaCliente ?? null,
    localidadeCliente: payload.localidadeCliente ?? null,
    numeroContribuinteCliente: payload.numeroContribuinteCliente ?? null,
  }
}

export function NovoDocumentoPage() {
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const [searchParams, setSearchParams] = useSearchParams()
  const tipoIdParam = searchParams.get('tipoDocumentoId') ?? ''
  const admissaoId = searchParams.get('admissaoId') ?? ''
  const consultaId = searchParams.get('consultaId') ?? ''
  const siglaFicheiroSlug = searchParams.get(
    'siglaFicheiro',
  ) as FicheiroEletronicoSiglaSlug | null
  const origemFicheiroEletronico =
    searchParams.get('origem') === 'ficheiro-eletronico'
  const siglaFicheiroLabel = resolveSiglaFromSlug(siglaFicheiroSlug ?? undefined)
  const emContextoFicheiroEletronico =
    origemFicheiroEletronico && !!siglaFicheiroLabel

  const pageTitle = emContextoFicheiroEletronico
    ? `Novo Documento — Ficheiro Eletrónico ${siglaFicheiroLabel}`
    : 'Novo Documento'

  const { data, isError, error } = useGetTiposDocumentoLight('', ID_FUNCIONALIDADE)
  const tipos = useMemo(() => {
    const info = data?.info
    if (!info || info.status !== ResponseStatus.Success) return []
    return info.data ?? []
  }, [data])

  useEffect(() => {
    if (isError) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os tipos de documento.',
      )
      return
    }
    const info = data?.info
    if (info && info.status !== ResponseStatus.Success) {
      toast.error(getFaturacaoApiErrorMessage(info, 'Clínica ou tipos de documento indisponíveis.'))
    }
  }, [data, isError, error])

  const tipoSeleccionado = useMemo(
    () => tipos.find((t) => t.id === tipoIdParam) ?? null,
    [tipos, tipoIdParam],
  )

  const [modalAberto, setModalAberto] = useState(!tipoIdParam)

  const emitirMutation = useEmitirDocumentoMutation(ID_FUNCIONALIDADE)
  const emitirAdmissaoMutation = useEmitirDocumentoDesdeAdmissaoMutation(ID_FUNCIONALIDADE)
  const emitirConsultaMutation = useEmitirDocumentoDesdeConsultaMutation(ID_FUNCIONALIDADE)
  const invalidateMutation = useInvalidateDocumentosMutation()

  const isSubmitting =
    emitirMutation.isPending ||
    emitirAdmissaoMutation.isPending ||
    emitirConsultaMutation.isPending

  const handleTipoConfirmado = (tipo: TipoDocumentoLightDTO) => {
    const next = new URLSearchParams(searchParams)
    next.set('tipoDocumentoId', tipo.id)
    setSearchParams(next)
    setModalAberto(false)
  }

  const handleSubmit = async (payload: EmitirDocumentoRequest) => {
    try {
      const res = admissaoId
        ? await emitirAdmissaoMutation.mutateAsync({
            admissaoId,
            payload: mapEmitirRequestParaOrigem(payload),
          })
        : consultaId
          ? await emitirConsultaMutation.mutateAsync({
              consultaId,
              payload: mapEmitirRequestParaOrigem(payload),
            })
          : await emitirMutation.mutateAsync(payload)

      if (isFaturacaoApiSuccess(res.info)) {
        const d = res.info.data
        let msg = 'Documento emitido com sucesso.'
        if (d?.referenciaMbCodigo && d?.referenciaMbEntidade) {
          msg += ` Ref. MB: ${d.referenciaMbEntidade} ${d.referenciaMbCodigo}`
        } else if (d?.referenciaMbWay && d?.referenciaMbCodigo) {
          msg += ' Pedido MB Way registado.'
        }
        toast.success(msg)
        await invalidateMutation.mutateAsync()
        closeLikeTabBar()
      } else {
        toast.error(
          getFaturacaoApiErrorMessage(
            res.info,
            'Não foi possível emitir o documento.',
          ),
        )
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro inesperado ao emitir.',
      )
    }
  }

  return (
    <>
      <PageHead title={`${pageTitle} | Área Financeira | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={pageTitle}
          onBack={closeLikeTabBar}
        >
          <SelecionarTipoDocumentoDialog
            open={modalAberto || !tipoSeleccionado}
            tipos={tipos}
            onConfirm={handleTipoConfirmado}
            onCancel={closeLikeTabBar}
          />

          {tipoSeleccionado ? (
            <DocumentoEditor
              tipo={tipoSeleccionado}
              onSubmit={handleSubmit}
              onCancel={closeLikeTabBar}
              isSubmitting={isSubmitting}
              contextoFicheiroEletronicoSiglaSlug={
                emContextoFicheiroEletronico ? siglaFicheiroSlug : null
              }
            />
          ) : null}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}