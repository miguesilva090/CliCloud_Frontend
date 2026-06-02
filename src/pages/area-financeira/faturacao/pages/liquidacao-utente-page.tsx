import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import {
  useGetDocumentoLiquidacaoContexto,
  useLiquidarDocumentoMutation,
} from '../queries/documento-queries'

const ID_FUNCIONALIDADE = 'documentos'

export function LiquidacaoUtentePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const documentoId = searchParams.get('documentoId') ?? ''
  const liquidarMutation = useLiquidarDocumentoMutation(ID_FUNCIONALIDADE)
  const { data, isLoading, isError, error } = useGetDocumentoLiquidacaoContexto(
    documentoId,
    ID_FUNCIONALIDADE,
  )

  const ctx = data?.info?.data
  const errorMessage = useMemo(
    () => (error instanceof Error ? error.message : 'Falha ao obter contexto de liquidação.'),
    [error],
  )

  return (
    <>
      <PageHead title='Liquidação de Utente | Área Financeira | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Liquidação de Utente'>
          {!documentoId ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Documento inválido</AlertTitle>
              <AlertDescription>Falta o parâmetro `documentoId`.</AlertDescription>
            </Alert>
          ) : null}

          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar liquidação</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? <p className='text-sm text-muted-foreground'>A carregar...</p> : null}

          {ctx ? (
            <div className='space-y-3 rounded-md border p-4'>
              <p>
                <strong>Documento:</strong> {ctx.numeroExibicao}
              </p>
              <p>
                <strong>Total líquido:</strong> {ctx.totalLiquido.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>
                Este passo marca o documento como liquidado, conforme o fluxo operacional mínimo.
              </p>
              <Button
                type='button'
                disabled={liquidarMutation.isPending || !documentoId}
                onClick={async () => {
                  try {
                    const res = await liquidarMutation.mutateAsync(documentoId)
                    const reciboId = res.info?.data
                    toast.success('Documento liquidado com sucesso.')
                    if (reciboId) {
                      navigate(`/area-financeira/faturacao/documento/${reciboId}`)
                      return
                    }
                    navigate('/area-financeira/faturacao/faturacao')
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Falha ao liquidar documento.'
                    toast.error(msg)
                  }
                }}
              >
                Confirmar liquidação
              </Button>
            </div>
          ) : null}

          <div className='mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate('/area-financeira/faturacao/faturacao')}
            >
              Voltar à listagem
            </Button>
          </div>
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
