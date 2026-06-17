import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { ResponseStatus } from '@/types/api/responses'
import type { EmitirDocumentoRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import { toast } from '@/utils/toast-utils'
import { useAtualizarDocumentoEmissaoMutation } from '@/pages/area-financeira/documentos/queries/documento-emissao-queries'
import {
  useGetDocumentoById,
  useInvalidateDocumentosMutation,
} from '../queries/documento-queries'
import { useGetTiposDocumentoLight } from '../queries/tipo-documento-queries'
import { useClinicaFaturacaoConfig } from '../queries/documento-editor-queries'
import { DocumentoEditor } from '../components/documento-editor'
import { mapDocumentoToEditorState } from '../utils/map-documento-to-editor-state'
import {
  getFaturacaoApiErrorMessage,
  isFaturacaoApiSuccess,
} from '../utils/faturacao-api-utils'
import { getDocumentoNumeroLabel } from '../utils/faturacao-documento-display'

const ID_FUNCIONALIDADE = 'documentos'

export function DocumentoEdicaoPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const editMode = searchParams.get('edit') === '1'
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()

  const docQ = useGetDocumentoById(id ?? '', ID_FUNCIONALIDADE)
  const tiposQ = useGetTiposDocumentoLight('', ID_FUNCIONALIDADE)
  const clinicaQ = useClinicaFaturacaoConfig()
  const atualizarMutation = useAtualizarDocumentoEmissaoMutation(ID_FUNCIONALIDADE)
  const invalidateMutation = useInvalidateDocumentosMutation()

  const documento = docQ.data?.info?.data
  const tipos =
    tiposQ.data?.info?.status === ResponseStatus.Success
      ? (tiposQ.data.info.data ?? [])
      : []

  const tipo: TipoDocumentoLightDTO | null = useMemo(() => {
    if (!documento) return null
    const found = tipos.find((t) => t.id === documento.tipoDocumentoId)
    if (found) return found
    return {
      id: documento.tipoDocumentoId,
      abreviatura: documento.tipoDocumento?.abreviatura ?? '?',
      descricao: documento.tipoDocumento?.descricao ?? 'Documento',
      inactivo: false,
      mostraFaturacao: true,
    }
  }, [documento, tipos])

  const initialState = useMemo(() => {
    if (!documento || !tipo) return null
    return mapDocumentoToEditorState(
      documento,
      tipo,
      clinicaQ.data?.regraFaturacao,
    )
  }, [documento, tipo, clinicaQ.data?.regraFaturacao])

  const documentoLabel = documento
    ? getDocumentoNumeroLabel({
        numeroExibicao: documento.numeroExibicao,
        tipoDocumentoAbreviatura: documento.tipoDocumento?.abreviatura,
        numeroDocumento: documento.numeroDocumento,
      })
    : 'Documento'

  const canEdit = editMode && !!documento && !documento.anulado
  const pageTitle = canEdit
    ? `Editar — ${documentoLabel}`
    : `Ver — ${documentoLabel}`

  const isLoading = docQ.isLoading || tiposQ.isLoading

  const loadErrorMessage = useMemo(() => {
    if (docQ.isError && docQ.error instanceof Error) return docQ.error.message
    const info = docQ.data?.info
    if (info && info.status !== ResponseStatus.Success) {
      return getFaturacaoApiErrorMessage(info, 'Documento não encontrado.')
    }
    return null
  }, [docQ.isError, docQ.error, docQ.data?.info])

  const handleSubmit = async (payload: EmitirDocumentoRequest) => {
    if (!id || !documento) return
    try {
      const res = await atualizarMutation.mutateAsync({
        documentoId: id,
        payload: {
          ...payload,
          liquidado: documento.liquidado,
          rectificado: documento.rectificado,
        },
      })
      if (isFaturacaoApiSuccess(res.info)) {
        toast.success('Documento atualizado com sucesso.')
        await invalidateMutation.mutateAsync()
        closeLikeTabBar()
      } else {
        toast.error(
          getFaturacaoApiErrorMessage(
            res.info,
            'Não foi possível atualizar o documento.',
          ),
        )
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro inesperado ao atualizar.',
      )
    }
  }

  return (
    <>
      <PageHead title='Documento | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={pageTitle}
          onBack={closeLikeTabBar}
          onRefresh={() => {
            void docQ.refetch()
          }}
        >
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>A carregar documento…</p>
          ) : loadErrorMessage || !documento || !tipo || !initialState ? (
            <p className='text-sm text-muted-foreground'>
              {loadErrorMessage ?? 'Documento não encontrado.'}
            </p>
          ) : editMode && documento.anulado ? (
            <p className='text-sm text-muted-foreground'>
              Documento anulado — só consulta.
            </p>
          ) : (
            <DocumentoEditor
              tipo={tipo}
              mode={canEdit ? 'create' : 'view'}
              initialState={initialState}
              onSubmit={canEdit ? handleSubmit : undefined}
              onCancel={closeLikeTabBar}
              isSubmitting={atualizarMutation.isPending}
            />
          )}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
