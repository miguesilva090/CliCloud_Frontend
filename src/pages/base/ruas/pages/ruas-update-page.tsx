import { useGetRua } from '@/pages/base/ruas/queries/ruas-queries'
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
import { RuaUpdateForm } from '../components/ruas-forms/rua-update-form'

export function RuasUpdatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { removeFormState } = useFormsStore()
  const { findWindowByPathAndInstanceId, removeWindow } = useWindowsStore()
  const searchParams = new URLSearchParams(location.search)
  const ruaId = searchParams.get('ruaId')
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = instanceId

  const { data: ruaData, isLoading } = useGetRua(ruaId || '')

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

  // If no ruaId is provided, redirect to ruas page
  if (!ruaId) {
    navigateManagedWindow(navigate, '/utilitarios/tabelas/geograficas/ruas')
    return null
  }

  const currentRua = ruaData?.info?.data

  return (
    <PageContainer>
      <PageHead title='Atualizar Rua | Luma' />

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
              title: 'Ruas',
              link: '/utilitarios/tabelas/geograficas/ruas',
            },
            {
              title: 'Atualizar',
              link: `/utilitarios/tabelas/geograficas/ruas/update?ruaId=${ruaId}&instanceId=${instanceId}`,
            },
          ]}
        />
      </div>

      <div className='rounded-lg border bg-card'>
        <div className='border-b px-6 py-4'>
          <h2 className='text-base font-medium'>Atualizar Rua</h2>
        </div>
        <div className='p-6'>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : currentRua ? (
            <RuaUpdateForm
              modalClose={handleClose}
              ruaId={ruaId}
              initialData={{
                nome: currentRua.nome || '',
                freguesiaId: currentRua.freguesiaId || '',
                codigoPostalId: currentRua.codigoPostalId || '',
              }}
            />
          ) : (
            <div className='text-center text-gray-500'>Rua não encontrada</div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
