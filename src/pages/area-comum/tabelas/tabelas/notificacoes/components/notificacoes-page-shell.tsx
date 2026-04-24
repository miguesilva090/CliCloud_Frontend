import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, X } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { ListagemNotificacoesSection } from './listagem-notificacoes-section'

export function NotificacoesPageShell({
  pageHeadTitle,
  heading,
  listMode,
}: {
  pageHeadTitle: string
  heading: string
  listMode: number
}) {
  const queryClient = useQueryClient()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  return (
    <>
      <PageHead title={pageHeadTitle} />
      <DashboardPageContainer>
        <div className='flex flex-col gap-3 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <div className='flex items-center justify-between gap-4'>
            <h1 className='text-lg font-semibold'>{heading}</h1>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: ['notificacoes-paginated', listMode],
                  })
                }}
                title='Atualizar'
              >
                <RefreshCw className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={closeWindowTab}
                title='Fechar'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        <ListagemNotificacoesSection listMode={listMode} />
      </DashboardPageContainer>
    </>
  )
}
