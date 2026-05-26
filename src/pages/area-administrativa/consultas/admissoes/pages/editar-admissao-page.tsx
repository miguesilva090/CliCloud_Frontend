import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import { AdmissaoViewEditModal } from '../modals/admissao-view-edit-modal'
import { invalidateAdmissoesListQueries } from '../queries/listagem-admissoes-queries'

export function EditarAdmissaoPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  const row = useMemo(() => (id ? ({ id } as AdmissaoTableDTO) : null), [id])

  const handleSaved = () => {
    invalidateAdmissoesListQueries(queryClient)
    closeWindowTab()
  }

  return (
    <>
      <PageHead title='Editar admissão | CliCloud' />
      <DashboardPageContainer>
        <AdmissaoViewEditModal
          open
          renderAsPage
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeWindowTab()
            }
          }}
          mode='edit'
          row={row}
          onSaved={handleSaved}
        />
      </DashboardPageContainer>
    </>
  )
}
