import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
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

  const handleBack = () => navigateManagedWindow(navigate, ARTIGO_LISTAGEM_PATH)

  const handleSaveSuccess = () => {
    if (windowId) {
      setPageStateByWindowId(windowId, { artigoFormDraft: undefined })
    }
    void queryClient.invalidateQueries({ queryKey: ['artigos-paginated'] })
    void queryClient.invalidateQueries({ queryKey: ['artigos-light'] })
    handleBack()
  }

  return (
    <>
      <PageHead title={`${title} | Artigos | Faturação | Área Financeira | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumDashboardCard
          title={title}
          onBack={handleBack}
          headerClassName='border-b border-border/70'
          headerTrailing={
            <>
              {!isView ? (
                <Button
                  type='button'
                  onClick={() => void formRef.current?.save()}
                  disabled={loading}
                  size='sm'
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  <Save className='mr-2 h-4 w-4' />
                  {loading ? 'A guardar...' : 'Guardar'}
                </Button>
              ) : null}
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleBack}
              >
                {isView ? 'OK' : 'Cancelar'}
              </Button>
            </>
          }
          contentClassName='px-3 pb-5 pt-3 sm:px-4 sm:pb-6 sm:pt-4 md:px-5'
        >
          <ArtigoEditForm
            ref={formRef}
            mode={mode}
            artigoId={id}
            windowId={windowId}
            onSaveSuccess={handleSaveSuccess}
            onLoadingChange={setLoading}
          />
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
