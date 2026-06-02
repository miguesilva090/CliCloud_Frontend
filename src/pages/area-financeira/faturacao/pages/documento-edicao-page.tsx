import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { ResponseStatus } from '@/types/api/responses'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import { useGetDocumentoById } from '../queries/documento-queries'
import { useGetTiposDocumentoLight } from '../queries/tipo-documento-queries'
import { useClinicaFaturacaoConfig } from '../queries/documento-editor-queries'
import { DocumentoEditor } from '../components/documento-editor'
import { mapDocumentoToEditorState } from '../utils/map-documento-to-editor-state'

const ID_FUNCIONALIDADE = 'documentos'

export function DocumentoEdicaoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const docQ = useGetDocumentoById(id ?? '', ID_FUNCIONALIDADE)
  const tiposQ = useGetTiposDocumentoLight('', ID_FUNCIONALIDADE)
  const clinicaQ = useClinicaFaturacaoConfig()

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

  const isLoading = docQ.isLoading || tiposQ.isLoading

  return (
    <>
      <PageHead title='Documento | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Faturação — Ver documento'
          onRefresh={() => docQ.refetch()}
        >
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>A carregar documento…</p>
          ) : !documento || !tipo || !initialState ? (
            <p className='text-sm text-muted-foreground'>
              Documento não encontrado.
            </p>
          ) : (
            <DocumentoEditor
              tipo={tipo}
              mode='view'
              initialState={initialState}
              onCancel={() => navigate('/area-financeira/faturacao/faturacao')}
            />
          )}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
