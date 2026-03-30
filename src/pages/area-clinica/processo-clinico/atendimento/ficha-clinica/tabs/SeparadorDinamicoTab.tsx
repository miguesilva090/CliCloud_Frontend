import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FichaClinicaSecoesService } from '@/lib/services/processo-clinico/ficha-clinica-secoes-service'
import type {
  FichaClinicaSecaoCampoDTO,
  FichaClinicaSecaoConteudoDTO,
} from '@/types/dtos/processo-clinico/ficha-clinica-secoes.dtos'
import { toast } from '@/utils/toast-utils'
import { useAuthStore } from '@/stores/auth-store'

export interface SeparadorDinamicoTabProps {
  separadorId: string
  utenteId: string
}

export function SeparadorDinamicoTab({ separadorId, utenteId }: SeparadorDinamicoTabProps) {
  const queryClient = useQueryClient()
  const nomeUtilizador = useAuthStore((state) => state.name) || 'Utilizador'
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [historicos, setHistoricos] = useState<Record<string, string>>({})

  const camposQuery = useQuery<FichaClinicaSecaoCampoDTO[]>({
    queryKey: ['ficha-clinica-secao-campos', separadorId],
    queryFn: async () => {
      const client = FichaClinicaSecoesService()
      const res = await client.getCamposBySeparador(separadorId)
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoCampoDTO[] } }
      return (api.info?.data ?? []) as FichaClinicaSecaoCampoDTO[]
    },
    enabled: !!separadorId,
    staleTime: 5 * 60 * 1000,
  })

  const conteudosQuery = useQuery<FichaClinicaSecaoConteudoDTO[]>({
    queryKey: ['ficha-clinica-secao-conteudos', separadorId, utenteId],
    enabled: !!utenteId && !!camposQuery.data?.length,
    queryFn: async () => {
      const client = FichaClinicaSecoesService()
      const res = await client.getConteudos('')
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoConteudoDTO[] } }
      const todos = (api.info?.data ?? []) as FichaClinicaSecaoConteudoDTO[]
      return todos.filter(
        (c) => c.utenteId === utenteId && c.separadorId === separadorId,
      )
    },
  })

  useEffect(() => {
    const campos = camposQuery.data ?? []
    const conteudos = conteudosQuery.data ?? []

    const novosHistoricos: Record<string, string> = {}
    const novosInputs: Record<string, string> = {}

    for (const campo of campos) {
      const existente = conteudos.find((c) => c.campoId === campo.id)
      if (existente) {
        novosHistoricos[campo.id] = existente.texto ?? ''
        novosInputs[campo.id] = ''
      } else {
        novosHistoricos[campo.id] = ''
        novosInputs[campo.id] = ''
      }
    }

    setHistoricos(novosHistoricos)
    setInputs(novosInputs)
  }, [camposQuery.data, conteudosQuery.data, utenteId])

  const hasChanges = useMemo(() => {
    for (const texto of Object.values(inputs)) {
      if (texto.trim().length > 0) return true
    }
    return false
  }, [inputs])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const client = FichaClinicaSecoesService()
      const campos = camposQuery.data ?? []
      const operacoes: Promise<unknown>[] = []

      const conteudos = conteudosQuery.data ?? []

      for (const campo of campos) {
        const campoId = campo.id
        const novoTexto = inputs[campoId]?.trim()
        if (!novoTexto) continue

        const agora = new Date()
        const dataStr = agora.toLocaleDateString('pt-PT')
        const horaStr = agora.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
        const entradaFormatada = `[${dataStr} ${horaStr}] ${nomeUtilizador}: ${novoTexto}`

        const historicoAtual = historicos[campoId] ?? ''
        const textoFinal = historicoAtual
          ? `${historicoAtual}

${entradaFormatada}`
          : entradaFormatada

        const existente = conteudos.find((c) => c.campoId === campoId)

        if (existente) {
          operacoes.push(
            client.updateConteudo(existente.id, {
              id: existente.id,
              texto: textoFinal,
            }),
          )
        } else {
          operacoes.push(
            client.createConteudo({
              utenteId,
              campoId,
              texto: textoFinal,
            }),
          )
        }
      }

      await Promise.all(operacoes)
    },
    onSuccess: async () => {
      toast.success('Secção guardada com sucesso.')
      await queryClient.invalidateQueries({
        queryKey: ['ficha-clinica-secao-conteudos', separadorId, utenteId],
      })
    },
    onError: (error: unknown) => {
      console.error('Erro ao guardar secção dinâmica:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao guardar a secção dinâmica.'
      toast.error(message)
    },
  })

  const handleChange = (campoId: string, texto: string) => {
    setInputs((prev) => ({
      ...prev,
      [campoId]: texto,
    }))
  }

  const isLoading = camposQuery.isLoading || conteudosQuery.isLoading

  const camposOrdenados: FichaClinicaSecaoCampoDTO[] = useMemo(
    () =>
      (camposQuery.data ?? []).slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)),
    [camposQuery.data],
  )

  return (
    <div className='space-y-3'>
      {isLoading && (
        <p className='text-sm text-muted-foreground'>A carregar secção…</p>
      )}

      <div className='grid grid-cols-1 gap-4'>
        {camposOrdenados.map((campo) => {
          const inputValue = inputs[campo.id] ?? ''
          const historicoValue = historicos[campo.id] ?? ''

          return (
            <div key={campo.id} className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-muted-foreground'>{campo.nome}</span>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 ml-2'>
                <Textarea
                  value={inputValue}
                  onChange={(e) => handleChange(campo.id, e.target.value)}
                  rows={campo.numeroLinhas || 4}
                  placeholder='Escreva aqui a nova entrada...'
                />
                <Textarea value={historicoValue} rows={campo.numeroLinhas || 4} readOnly />
              </div>
            </div>
          )
        })}
      </div>

      <div className='flex justify-end gap-2 pt-2'>
        <Button
          size='sm'
          variant='default'
          disabled={!hasChanges || !utenteId}
          onClick={() => saveMutation.mutate()}
        >
          Guardar
        </Button>
      </div>
    </div>
  )
}


