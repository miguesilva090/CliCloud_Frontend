import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openEntityEditInApp, navigateManagedWindow } from '@/utils/window-utils'
import { useGetGrupoViasAdministracao } from '../queries/listagem-grupo-vias-administracao-queries'

const LISTAGEM_PATH = '/area-comum/tabelas/stocks/grupo-vias-administracao'

export function GrupoViasAdministracaoDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)

  const { data: response, isLoading } = useGetGrupoViasAdministracao(id ?? null)
  const grupo = response?.info?.data

  const handleVoltar = () => navigateManagedWindow(navigate, LISTAGEM_PATH)
  const handleEditar = () => {
    if (!id) return
    const path = `${LISTAGEM_PATH}/${id}/editar`
    const descricao = grupo?.descricao
    openEntityEditInApp(
      navigate,
      addWindow,
      path,
      id,
      descricao ? `Grupo Vias: ${descricao}` : null,
    )
  }

  if (!id || (!isLoading && !grupo)) {
    return (
      <>
        <PageHead title='Grupo de Vias de Administração | Stocks | CliCloud' />
        <DashboardPageContainer>
          <p className='text-muted-foreground'>Grupo não encontrado.</p>
          <Button variant='outline' onClick={handleVoltar} className='mt-4'>
            Voltar
          </Button>
        </DashboardPageContainer>
      </>
    )
  }

  return (
    <>
      <PageHead title='Grupo de Vias de Administração | Stocks | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>
            Grupo de Vias de Administração
          </h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleVoltar}
              className='gap-1'
            >
              <ArrowLeft className='h-4 w-4' />
              Voltar
            </Button>
            <Button
              size='sm'
              onClick={handleEditar}
              className='gap-1'
              variant='secondary'
            >
              <Pencil className='h-4 w-4' />
              Editar
            </Button>
          </div>
        </div>

        <div className='rounded-b-lg border border-t-0 bg-card p-4 space-y-6'>
          <div className='grid gap-2 max-w-md'>
            <span className='text-sm font-medium text-muted-foreground'>
              Designação
            </span>
            <p className='text-sm'>{isLoading ? '...' : grupo?.descricao ?? '—'}</p>
          </div>

          {grupo?.vias != null && grupo.vias.length > 0 && (
            <div className='space-y-2'>
              <span className='text-sm font-medium text-muted-foreground'>
                Vias de Administração associadas
              </span>
              <div className='border rounded-md overflow-hidden'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b bg-muted/50'>
                      <th className='p-2 text-left font-medium'>Código</th>
                      <th className='p-2 text-left font-medium'>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.vias.map((via, idx) => (
                      <tr
                        key={via.id ?? idx}
                        className='border-b last:border-b-0 hover:bg-muted/30'
                      >
                        <td className='p-2'>{idx + 1}</td>
                        <td className='p-2'>{via.viaDescricao ?? via.descricao ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {grupo && (!grupo.vias || grupo.vias.length === 0) && !isLoading && (
            <div className='text-sm text-muted-foreground'>
              Nenhuma via de administração associada a este grupo.
            </div>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}

