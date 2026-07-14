import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { ListagemSubsistemasServicosPanel } from '../components/listagem-subsistemas-servicos-panel'
import { toast } from '@/utils/toast-utils'
import {
  resolveSubsistemasServicosPickerWindowId,
  resolveWindowIdForClose,
  returnToAdmissaoAfterSubsistemasPicker,
  returnToListaEsperaAfterSubsistemasPicker,
} from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  clearAdmissaoSubsistemasPickerOpeningFlag,
  sendSubsistemasPickerResult,
} from '../subsistemas-servicos-admissao-flow'
import {
  clearListaEsperaSubsistemasPickerOpeningFlag,
  sendSubsistemasPickerResultForListaEspera,
} from '@/pages/area-administrativa/tratamentos/lista-espera/lista-espera-subsistemas-servicos-flow'
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'

export function ListagemSubsistemasServicosPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const removeWindow = useWindowsStore((s) => s.removeWindow)

  const organismoIdFromUrl = searchParams.get('organismoId') ?? undefined
  const fromAdmissao = searchParams.get('fromAdmissao') ?? undefined
  const fromListaEspera = searchParams.get('fromListaEspera') ?? undefined

  useEffect(() => {
    if (fromAdmissao) {
      clearAdmissaoSubsistemasPickerOpeningFlag()
    }
    if (fromListaEspera) {
      clearListaEsperaSubsistemasPickerOpeningFlag()
    }
  }, [fromAdmissao, fromListaEspera])

  const resolvePickerWindowId = useCallback(
    () => resolveSubsistemasServicosPickerWindowId() || resolveWindowIdForClose(),
    []
  )

  const closePickerAndReturnToAdmissao = useCallback(() => {
    if (!fromAdmissao) return
    returnToAdmissaoAfterSubsistemasPicker(
      resolvePickerWindowId() || undefined,
      fromAdmissao,
      removeWindow
    )
  }, [fromAdmissao, removeWindow, resolvePickerWindowId])

  const closePickerAndReturnToListaEspera = useCallback(() => {
    if (!fromListaEspera) return
    returnToListaEsperaAfterSubsistemasPicker(
      resolvePickerWindowId() || undefined,
      fromListaEspera,
      removeWindow,
      navigate
    )
  }, [fromListaEspera, removeWindow, resolvePickerWindowId, navigate])

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

  const handleAddToListaEspera = useCallback(
    (rows: SubsistemaServicoTableDTO[]) => {
      if (!fromListaEspera) return
      const res = sendSubsistemasPickerResultForListaEspera(fromListaEspera, rows)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(
        res.count === 1
          ? '1 serviço enviado para a lista de espera.'
          : `${res.count} serviços enviados para a lista de espera.`
      )
      closePickerAndReturnToListaEspera()
    },
    [fromListaEspera, closePickerAndReturnToListaEspera]
  )

  const pickerSelecao = useMemo(() => {
    if (fromListaEspera) {
      return {
        submitLabel: 'Enviar seleção',
        onSubmit: handleAddToListaEspera,
      }
    }
    if (fromAdmissao) {
      return {
        submitLabel: 'Adicionar à admissão',
        onSubmit: handleAddToAdmissao,
      }
    }
    return undefined
  }, [fromListaEspera, fromAdmissao, handleAddToListaEspera, handleAddToAdmissao])

  const onBack = useMemo(() => {
    if (fromListaEspera) {
      return closePickerAndReturnToListaEspera
    }
    if (fromAdmissao) {
      return closePickerAndReturnToAdmissao
    }
    return undefined
  }, [fromListaEspera, fromAdmissao, closePickerAndReturnToListaEspera, closePickerAndReturnToAdmissao])

  return (
    <>
      <PageHead title='Subsistemas de Serviços | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <ListagemSubsistemasServicosPanel
          organismoIdFromUrl={organismoIdFromUrl}
          onBack={onBack}
          pickerSelecao={pickerSelecao}
        />
      </DashboardPageContainer>
    </>
  )
}
