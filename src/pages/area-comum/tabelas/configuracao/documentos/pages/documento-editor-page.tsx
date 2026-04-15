import { useCallback, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Loader2, Save, X } from 'lucide-react'
import { DocumentoEditor } from '@/components/documentos/documento-editor'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { getRuntimeConfig } from '@/lib/config/runtime-config'
import { MotorDocumentalService } from '@/lib/services/documentos/motor-documental-service'
import { useAuthStore } from '@/stores/auth-store'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

export function DocumentoEditorPage() {
  const { modeloId } = useParams<{ modeloId: string }>()
  const closeTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()

  const [html, setHtml] = useState('')
  const [nome, setNome] = useState('')
  const htmlRef = useRef(html)
  htmlRef.current = html

  const { isLoading, isError } = useQuery({
    queryKey: ['motor-documental-modelo', modeloId],
    queryFn: async () => {
      if (!modeloId) throw new Error('ID do modelo não fornecido.')
      const res = await MotorDocumentalService().getModeloById(modeloId)
      const modelo = res.info.data
      if (!modelo) throw new Error('Modelo não encontrado.')
      setHtml(modelo.conteudoHtml || '<p></p>')
      setNome(modelo.nome)
      return modelo
    },
    enabled: !!modeloId,
    refetchOnWindowFocus: false,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!modeloId) throw new Error('ID do modelo inválido.')
      return MotorDocumentalService().updateModelo(modeloId, {
        nome,
        conteudoHtml: htmlRef.current,
        ativo: true,
      })
    },
    onSuccess: async (response) => {
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Documento guardado com sucesso.')
        await queryClient.invalidateQueries({ queryKey: ['motor-documental-modelos'] })
        return
      }
      const msg = response.info.messages
        ? Object.values(response.info.messages).flat()[0]
        : 'Falha ao guardar.'
      toast.error(msg ?? 'Falha ao guardar.')
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao guardar o documento.')
    },
  })

  const handleSave = useCallback(() => {
    saveMutation.mutate()
  }, [saveMutation])

  const handleDownloadDocx = useCallback(async () => {
    if (!modeloId) return
    try {
      const url = MotorDocumentalService().getDownloadModeloDocxUrl(modeloId)
      const token = useAuthStore.getState().token
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-API-Key': getRuntimeConfig().apiKey || '',
          tenant: 'root',
        },
      })
      if (!res.ok) throw new Error('Falha ao gerar ficheiro.')
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${nome || 'documento'}.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch {
      toast.error('Não foi possível descarregar o documento.')
    }
  }, [modeloId, nome])

  if (!modeloId) {
    return (
      <div className='flex h-full items-center justify-center pt-20'>
        <p className='text-muted-foreground'>Nenhum modelo selecionado.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center pt-20'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex h-full items-center justify-center pt-20'>
        <p className='text-destructive'>Erro ao carregar o modelo.</p>
      </div>
    )
  }

  return (
    <div className='flex h-screen flex-col pt-4 pb-16 md:pt-20 md:pb-14'>
      <PageHead title={`Editor - ${nome}`} />

      {/* Title bar - separate from app header, like legacy "Editor de Texto" bar */}
      <div className='flex items-center justify-between border-b bg-muted/30 px-4 py-1.5'>
        <h3 className='text-sm font-semibold'>Editor de Texto — {nome}</h3>
        <div className='flex items-center gap-2'>
          <Button size='sm' className='h-7 text-xs' onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className='mr-1 h-3 w-3 animate-spin' /> : <Save className='mr-1 h-3 w-3' />}
            Guardar
          </Button>
          <Button variant='outline' size='sm' className='h-7 text-xs' onClick={handleDownloadDocx}>
            <Download className='mr-1 h-3 w-3' />
            Exportar .docx
          </Button>
          <Button variant='outline' size='sm' className='h-7 text-xs' onClick={closeTab}>
            <X className='mr-1 h-3 w-3' />
            Fechar
          </Button>
        </div>
      </div>

      {/* Editor fills remaining space */}
      <div className='min-h-0 flex-1 overflow-hidden'>
        <DocumentoEditor value={html} onChange={setHtml} />
      </div>
    </div>
  )
}
