import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FichaClinicaSecoesService } from '@/lib/services/processo-clinico/ficha-clinica-secoes-service'
import {
  SeparadorPersonalizadoDocumentoService,
  type SeparadorPersonalizadoModeloDTO,
} from '@/lib/services/processo-clinico/separador-personalizado-documento-service'
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
  const [modeloOpen, setModeloOpen] = useState(false)
  const [modeloTexto, setModeloTexto] = useState('')

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
      const res = await client.getConteudosByUtenteAndSeparador(utenteId, separadorId)
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoConteudoDTO[] } }
      return (api.info?.data ?? []) as FichaClinicaSecaoConteudoDTO[]
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
      const itens: Array<{ campoId: string; texto: string }> = []

      for (const campo of campos) {
        const campoId = campo.id
        const novoTexto = inputs[campoId]?.trim()
        if (!novoTexto) continue

        const agora = new Date()
        const dataStr = agora.toLocaleDateString('pt-PT')
        const horaStr = agora.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
        const entradaFormatada = `${nomeUtilizador} ${dataStr} ${horaStr}
${novoTexto}`

        const historicoAtual = historicos[campoId] ?? ''
        const textoFinal = historicoAtual
          ? `${historicoAtual}

${entradaFormatada}`
          : entradaFormatada
        itens.push({ campoId, texto: textoFinal })
      }

      if (itens.length === 0) return

      await client.upsertConteudosLote({
        utenteId,
        separadorId,
        itens,
      })
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

  const separadorNome = camposOrdenados[0]?.separadorNome ?? 'Separador Personalizado'
  const modeloQuery = useQuery<SeparadorPersonalizadoModeloDTO>({
    queryKey: ['separador-personalizado-modelo', separadorId],
    enabled: !!separadorId,
    queryFn: async () => {
      const client = SeparadorPersonalizadoDocumentoService()
      const res = await client.getModelo(separadorId)
      const api = res as unknown as { info?: { data?: SeparadorPersonalizadoModeloDTO } }
      return (
        api.info?.data ?? {
          existe: false,
          textoHtml: '',
        }
      )
    },
  })

  useEffect(() => {
    if (!modeloOpen) return
    setModeloTexto(modeloQuery.data?.textoHtml ?? '')
  }, [modeloOpen, modeloQuery.data])

  const handleSaveModelo = async () => {
    const texto = modeloTexto.trim()
    if (!texto) {
      toast.error('O texto do modelo é obrigatório.')
      return
    }

    try {
      const client = SeparadorPersonalizadoDocumentoService()
      await client.upsertModelo({
        separadorId,
        tituloSeparador: separadorNome,
        textoHtml: texto,
      })

      toast.success('Modelo guardado com sucesso.')
      setModeloOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['separador-personalizado-modelo', separadorId] })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao guardar modelo.'
      toast.error(message)
    }
  }

  const handleImprimir = async (somenteHoje: boolean) => {
    const camposPayload = camposOrdenados.map((campo) => ({
      nomeCampo: campo.nome,
      historicoTexto: historicos[campo.id] ?? '',
    }))

    if (!camposPayload.some((c) => (c.historicoTexto ?? '').trim().length > 0)) {
      toast.error('Sem conteúdo para imprimir neste separador.')
      return
    }

    try {
      const client = SeparadorPersonalizadoDocumentoService()
      const res = await client.gerarImpressao({
        separadorId,
        tituloSeparador: separadorNome,
        apenasHoje: somenteHoje,
        campos: camposPayload,
      })
      const api = res as unknown as { info?: { data?: { modeloVazio?: boolean; html?: string } } }
      const html = api.info?.data?.html ?? ''
      const modeloVazio = !!api.info?.data?.modeloVazio

      if (!html.trim()) {
        toast.error('Não foi possível gerar a impressão.')
        return
      }

      if (modeloVazio) {
        const criarModelo = window.confirm(
          'Não existe modelo para este separador. Deseja criar/editar o modelo agora?',
        )
        if (criarModelo) {
          setModeloOpen(true)
        }
        return
      }

      const win = window.open('', '_blank')
      if (!win) return
      win.document.open()
      win.document.write(html)
      win.document.close()
      win.print()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar impressão.'
      toast.error(message)
    }
  }

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
          variant='outline'
          disabled={!utenteId}
          onClick={() => setModeloOpen(true)}
        >
          Editar Modelo
        </Button>
        <Button
          size='sm'
          variant='outline'
          disabled={!utenteId}
          onClick={() => {
            const apenasHoje = window.confirm('Deseja imprimir apenas o relatório de hoje?')
            void handleImprimir(apenasHoje)
          }}
        >
          Imprimir
        </Button>
        <Button
          size='sm'
          variant='default'
          disabled={!hasChanges || !utenteId}
          onClick={() => saveMutation.mutate()}
        >
          Guardar
        </Button>
      </div>

      <Dialog open={modeloOpen} onOpenChange={setModeloOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Modelo do Separador</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <p className='text-xs text-muted-foreground'>
              Use {'{{CONTEUDO}}'} para posicionar o conteúdo clínico no documento final.
            </p>
            <Textarea
              value={modeloTexto}
              onChange={(e) => setModeloTexto(e.target.value)}
              rows={12}
              placeholder='<h3>Relatório</h3>{{CONTEUDO}}'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setModeloOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModelo}>Guardar modelo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


