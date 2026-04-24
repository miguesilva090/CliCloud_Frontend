import { useGetDistrito } from '@/pages/base/distritos/queries/distritos-queries'
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
import { DistritoUpdateForm } from '../components/distritos-forms/distrito-update-form'

export function DistritosUpdatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { removeFormState } = useFormsStore()
  const { findWindowByPathAndInstanceId, removeWindow } = useWindowsStore()
  const searchParams = new URLSearchParams(location.search)
  const distritoId = searchParams.get('distritoId')
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = instanceId

  const { data: distritoData, isLoading } = useGetDistrito(distritoId || '')

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

  // If no distritoId is provided, redirect to distritos page
  if (!distritoId) {
    navigateManagedWindow(navigate, '/utilitarios/tabelas/geograficas/distritos')
    return null
  }

  const currentDistrito = distritoData

  return (
    <PageContainer>
      <PageHead title='Atualizar Distrito | Luma' />

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
              title: 'Atualizar',
              link: `/utilitarios/tabelas/geograficas/distritos/update?distritoId=${distritoId}&instanceId=${instanceId}`,
            },
          ]}
        />
      </div>

      <div className='rounded-lg border bg-card'>
        <div className='border-b px-6 py-4'>
          <h2 className='text-base font-medium'>Atualizar Distrito</h2>
        </div>
        <div className='p-6'>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : currentDistrito ? (
            <DistritoUpdateForm
              modalClose={handleClose}
              distritoId={distritoId}
              initialData={{
                nome: currentDistrito.nome || '',
                paisId: currentDistrito.paisId || '',
              }}
            />
          ) : (
            <div className='text-center text-gray-500'>
              Distrito não encontrado
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
