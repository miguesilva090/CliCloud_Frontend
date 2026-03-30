import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FichaClinicaSecoesService } from '@/lib/services/processo-clinico/ficha-clinica-secoes-service'
import type { FichaClinicaSecaoTemplateDTO } from '@/types/dtos/processo-clinico/ficha-clinica-secoes.dtos'
import { SeparadorDinamicoTab } from './SeparadorDinamicoTab'

export interface TerapiaFalaTabProps {
  utenteId: string
}

export function TerapiaFalaTab({ utenteId }: TerapiaFalaTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['ficha-clinica-secao-template', 'TERAPIA_FALA'],
    queryFn: async () => {
      const client = FichaClinicaSecoesService()
      const res = await client.getTemplates('TERAPIA_FALA')
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoTemplateDTO[] } }
      return (api.info?.data ?? []) as FichaClinicaSecaoTemplateDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const separador = useMemo(() => {
    const templates = (data ?? []) as FichaClinicaSecaoTemplateDTO[]
    return templates.find((t) => t.codigo === 'TERAPIA_FALA' && t.ativo) ?? null
  }, [data])

  if (!utenteId) {
    return <p className='text-sm text-muted-foreground'>Selecione um utente para continuar.</p>
  }

  if (isLoading) {
    return (
      <p className='text-sm text-muted-foreground'>
        A carregar configuração de Terapia da Fala…
      </p>
    )
  }

  if (!separador) {
    return (
      <p className='text-sm text-muted-foreground'>
        Não existe nenhum separador configurado com o código{' '}
        <span className='font-mono'>TERAPIA_FALA</span>. Crie-o em &quot;Separadores
        Personalizados&quot; e adicione os campos desejados.
      </p>
    )
  }

  return <SeparadorDinamicoTab separadorId={separador.id} utenteId={utenteId} />
}
