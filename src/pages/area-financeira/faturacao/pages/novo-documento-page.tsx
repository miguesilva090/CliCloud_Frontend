import { useEffect, useMemo, useState } from 'react'
import { ResponseStatus } from '@/types/api/responses'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { toast } from '@/utils/toast-utils'
import { useEmitirDocumentoMutation } from '@/pages/area-financeira/documentos/queries/documento-emissao-queries'
import type { EmitirDocumentoRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import { useGetTiposDocumentoLight } from '../queries/tipo-documento-queries'
import { useInvalidateDocumentosMutation } from '../queries/documento-queries'
import { SelecionarTipoDocumentoDialog } from '../components/selecionar-tipo-documento-dialog'
import { DocumentoEditor } from '../components/documento-editor'
import {
  getFaturacaoApiErrorMessage,
  isFaturacaoApiSuccess,
} from '../utils/faturacao-api-utils'

const ID_FUNCIONALIDADE = 'documentos'

export function NovoDocumentoPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tipoIdParam = searchParams.get('tipoDocumentoId') ?? ''

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
  const invalidateMutation = useInvalidateDocumentosMutation()

  const handleTipoConfirmado = (tipo: TipoDocumentoLightDTO) => {
    setSearchParams({ tipoDocumentoId: tipo.id })
    setModalAberto(false)
  }

  const handleSubmit = async (payload: EmitirDocumentoRequest) => {
    try {
      const res = await emitirMutation.mutateAsync(payload)
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
        navigate('/area-financeira/faturacao/faturacao')
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
      <PageHead title='Novo Documento | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Faturação'
          onRefresh={() => navigate('/area-financeira/faturacao/faturacao')}
        >
          <SelecionarTipoDocumentoDialog
            open={modalAberto || !tipoSeleccionado}
            tipos={tipos}
            onConfirm={handleTipoConfirmado}
            onCancel={() => navigate('/area-financeira/faturacao/faturacao')}
          />

          {tipoSeleccionado ? (
            <DocumentoEditor
              tipo={tipoSeleccionado}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/area-financeira/faturacao/faturacao')}
              isSubmitting={emitirMutation.isPending}
            />
          ) : null}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
