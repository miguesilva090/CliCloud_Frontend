import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import {
  ArtigoEditForm,
  type ArtigoEditFormHandle,
} from '../modals/artigo-view-create-modal'
import {
  navigateManagedWindow,
  useCurrentWindowId,
} from '@/utils/window-utils'
import { usePagesStore } from '@/stores/use-pages-store'
import { ARTIGO_LISTAGEM_PATH } from '../constants/artigo-paths'

export function ArtigoEditPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const windowId = useCurrentWindowId()
  const setPageStateByWindowId = usePagesStore((s) => s.setPageStateByWindowId)
  const formRef = useRef<ArtigoEditFormHandle>(null)
  const [loading, setLoading] = useState(false)

  const isView = location.pathname.endsWith('/ver')
  const isNew = !id
  const mode = isView ? 'view' : isNew ? 'create' : 'edit'

  const title = isNew
    ? 'Novo artigo'
    : isView
      ? 'Artigo'
      : 'Editar artigo'

  const handleSaveSuccess = () => {
    if (windowId) {
      setPageStateByWindowId(windowId, { artigoFormDraft: undefined })
    }
    void queryClient.invalidateQueries({ queryKey: ['artigos-paginated'] })
    void queryClient.invalidateQueries({ queryKey: ['artigos-light'] })
    navigateManagedWindow(navigate, ARTIGO_LISTAGEM_PATH)
  }

  return (
    <>
      <PageHead title={`${title} | Artigos | Faturação | Área Financeira | CliCloud`} />
      <DashboardPageContainer>
        <div className='mb-4 flex items-center justify-between gap-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => navigateManagedWindow(navigate, ARTIGO_LISTAGEM_PATH)}
              title='Voltar'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h1 className='text-lg font-semibold'>{title}</h1>
          </div>
          <div className='flex items-center gap-2'>
            {!isView ? (
              <Button
                type='button'
                onClick={() => void formRef.current?.save()}
                disabled={loading}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <Save className='mr-2 h-4 w-4' />
                Guardar
              </Button>
            ) : null}
            <Button
              type='button'
              variant='outline'
              onClick={() => navigateManagedWindow(navigate, ARTIGO_LISTAGEM_PATH)}
            >
              {isView ? 'OK' : 'Cancelar'}
            </Button>
          </div>
        </div>

        <div className='rounded-b-lg border bg-background p-4'>
          <ArtigoEditForm
            ref={formRef}
            mode={mode}
            artigoId={id}
            windowId={windowId}
            onSaveSuccess={handleSaveSuccess}
            onLoadingChange={setLoading}
          />
        </div>
      </DashboardPageContainer>
    </>
  )
}
