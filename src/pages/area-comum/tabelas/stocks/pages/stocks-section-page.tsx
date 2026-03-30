import { useNavigate } from 'react-router-dom'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'

export function StocksSectionPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)

  return (
    <>
      <PageHead title='Stocks | Tabelas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='space-y-6'>
          <h1 className='text-lg font-semibold'>Stocks</h1>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <button
              type='button'
              className='flex flex-col items-start gap-1 rounded-lg border bg-card px-4 py-3 text-left shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer'
              onClick={() =>
                openPathInApp(
                  navigate,
                  addWindow,
                  '/area-comum/tabelas/stocks/vias-administracao',
                  'Vias de Administração'
                )
              }
            >
              <span className='text-sm font-medium'>Vias de Administração</span>
              <span className='text-xs text-muted-foreground'>
                Manutenção das vias de administração.
              </span>
            </button>
            <button
              type='button'
              className='flex flex-col items-start gap-1 rounded-lg border bg-card px-4 py-3 text-left shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer'
              onClick={() =>
                openPathInApp(
                  navigate,
                  addWindow,
                  '/area-comum/tabelas/stocks/grupo-vias-administracao',
                  'Grupo de Vias de Administração'
                )
              }
            >
              <span className='text-sm font-medium'>
                Grupo de Vias de Administração
              </span>
              <span className='text-xs text-muted-foreground'>
                Manutenção dos grupos de vias de administração.
              </span>
            </button>
          </div>
        </div>
      </DashboardPageContainer>
    </>
  )
}
