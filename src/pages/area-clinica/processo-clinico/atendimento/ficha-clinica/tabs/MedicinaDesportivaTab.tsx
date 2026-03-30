import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FichaClinicaSecoesService } from '@/lib/services/processo-clinico/ficha-clinica-secoes-service'
import type { FichaClinicaSecaoTemplateDTO } from '@/types/dtos/processo-clinico/ficha-clinica-secoes.dtos'
import { SeparadorDinamicoTab } from './SeparadorDinamicoTab'

export interface MedicinaDesportivaTabProps {
  utenteId: string
}

export function MedicinaDesportivaTab({ utenteId }: MedicinaDesportivaTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['ficha-clinica-secao-template', 'MEDICINA_DESPORTIVA'],
    queryFn: async () => {
      const client = FichaClinicaSecoesService()
      const res = await client.getTemplates('MEDICINA_DESPORTIVA')
      return res
    },
    staleTime: 5 * 60 * 1000,
  })

  const separador = useMemo(() => {
    const apiData = (data as { info?: { data?: FichaClinicaSecaoTemplateDTO[] } } | undefined)
      ?.info?.data
    const templates = (apiData ?? []) as FichaClinicaSecaoTemplateDTO[]
    // Código gerado automaticamente a partir do nome "Medicina Desportiva"
    return templates.find((t) => t.codigo === 'MEDICINA_DESPORTIVA' && t.ativo) ?? null
  }, [data])

  if (!utenteId) {
    return <p className='text-sm text-muted-foreground'>Selecione um utente para continuar.</p>
  }

  if (isLoading) {
    return (
      <p className='text-sm text-muted-foreground'>
        A carregar configuração de Medicina Desportiva…
      </p>
    )
  }

  if (!separador) {
    return (
      <p className='text-sm text-muted-foreground'>
        Não existe nenhum separador configurado com o código{' '}
        <span className='font-mono'>MEDICINA_DESPORTIVA</span>. Crie-o em &quot;Separadores
        Personalizados&quot; para utilizar esta secção.
      </p>
    )
  }

  return <SeparadorDinamicoTab separadorId={separador.id} utenteId={utenteId} />
}
