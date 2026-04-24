import { useGetConcelho } from '@/pages/base/concelhos/queries/concelhos-queries'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { handleWindowClose, navigateManagedWindow } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PageContainer } from '@/components/shared/page-container'
import { PageHead } from '@/components/shared/page-head'
import { ConcelhoUpdateForm } from '../components/concelhos-forms/concelho-update-form'

export function ConcelhosUpdatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { removeFormState } = useFormsStore()
  const { findWindowByPathAndInstanceId, removeWindow } = useWindowsStore()
  const searchParams = new URLSearchParams(location.search)
  const concelhoId = searchParams.get('concelhoId')
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = instanceId

  const { data: concelhoData, isLoading } = useGetConcelho(concelhoId || '')

  const handleClose = () => {
    // Remove form data from the form store
    removeFormState(formId)

    // Find the current window and remove it
    const currentWindow = findWindowByPathAndInstanceId(
      location.pathname,
      instanceId
    )

    if (currentWindow) {
      handleWindowClose(currentWindow.id, navigate, removeWindow)
    }
  }

  // If no concelhoId is provided, redirect to concelhos page
  if (!concelhoId) {
    navigateManagedWindow(navigate, '/utilitarios/tabelas/geograficas/concelhos')
    return null
  }

  const currentConcelho = concelhoData

  return (
    <PageContainer>
      <PageHead title='Atualizar Concelho | Luma' />

      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleClose}
          className='h-8 w-8'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <Breadcrumbs
          items={[
            {
              title: 'Geográficas',
              link: '/utilitarios/tabelas/geograficas',
            },
            {
              title: 'Países',
              link: '/utilitarios/tabelas/geograficas/paises',
            },
            {
              title: 'Distritos',
              link: '/utilitarios/tabelas/geograficas/distritos',
            },
            {
              title: 'Concelhos',
              link: '/utilitarios/tabelas/geograficas/concelhos',
            },
            {
              title: 'Atualizar',
              link: `/utilitarios/tabelas/geograficas/concelhos/update?concelhoId=${concelhoId}&instanceId=${instanceId}`,
            },
          ]}
        />
      </div>

      <div className='rounded-lg border bg-card'>
        <div className='border-b px-6 py-4'>
          <h2 className='text-base font-medium'>Atualizar Concelho</h2>
        </div>
        <div className='p-6'>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : currentConcelho ? (
            <ConcelhoUpdateForm
              modalClose={handleClose}
              concelhoId={concelhoId}
              initialData={{
                nome: currentConcelho.nome || '',
                distritoId: currentConcelho.distritoId || '',
              }}
            />
          ) : (
            <div className='text-center text-gray-500'>
              Concelho não encontrado
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
