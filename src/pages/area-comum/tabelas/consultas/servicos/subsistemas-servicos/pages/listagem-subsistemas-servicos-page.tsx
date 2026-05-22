import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { ListagemSubsistemasServicosPanel } from '../components/listagem-subsistemas-servicos-panel'
import { toast } from '@/utils/toast-utils'
import {
  resolveSubsistemasServicosPickerWindowId,
  resolveWindowIdForClose,
  returnToAdmissaoAfterSubsistemasPicker,
} from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  clearAdmissaoSubsistemasPickerOpeningFlag,
  sendSubsistemasPickerResult,
} from '../subsistemas-servicos-admissao-flow'
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'

export function ListagemSubsistemasServicosPage() {
  const [searchParams] = useSearchParams()
  const removeWindow = useWindowsStore((s) => s.removeWindow)

  const organismoIdFromUrl = searchParams.get('organismoId') ?? undefined
  const fromAdmissao = searchParams.get('fromAdmissao') ?? undefined

  useEffect(() => {
    if (fromAdmissao) {
      clearAdmissaoSubsistemasPickerOpeningFlag()
    }
  }, [fromAdmissao])

  const closePickerAndReturnToAdmissao = useCallback(() => {
    if (!fromAdmissao) return
    const wid =
      resolveSubsistemasServicosPickerWindowId() ||
      resolveWindowIdForClose()
    returnToAdmissaoAfterSubsistemasPicker(wid || undefined, fromAdmissao, removeWindow)
  }, [fromAdmissao, removeWindow])

  const handleAddToAdmissao = useCallback(
    (rows: SubsistemaServicoTableDTO[]) => {
      if (!fromAdmissao) return
      const res = sendSubsistemasPickerResult(fromAdmissao, rows)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(
        res.count === 1
          ? '1 linha enviada para o formulário de admissão.'
          : `${res.count} linhas enviadas para o formulário de admissão.`
      )
      closePickerAndReturnToAdmissao()
    },
    [fromAdmissao, closePickerAndReturnToAdmissao]
  )

  return (
    <>
      <PageHead title='Subsistemas de Serviços | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <ListagemSubsistemasServicosPanel
          organismoIdFromUrl={organismoIdFromUrl}
          onBack={fromAdmissao ? closePickerAndReturnToAdmissao : undefined}
          admissaoSelecao={
            fromAdmissao ? { onAddToAdmissao: handleAddToAdmissao } : undefined
          }
        />
      </DashboardPageContainer>
    </>
  )
}
