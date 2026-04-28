import { useMemo, useState } from 'react'
import { Loader2, Printer, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  useCreateHistoriaDentaria,
  useGetHistoriaDentariaByUtente,
} from '@/pages/area-clinica/processo-clinico/atendimento/ficha-clinica/queries/historia-dentaria-queries'
import { RelatorioDentariaRichEditor } from './RelatorioDentariaRichEditor'

function formatRegistoPt(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function buildHistoriaAcumulada(htmlParts: string[]) {
  const clean = htmlParts.filter((x) => x.replace(/<[^>]+>/g, '').trim().length > 0)
  return clean.join('<hr class="my-3 border-border"/>')
}

export interface RelatorioDentariaTabProps {
  utenteId: string
}

export function RelatorioDentariaTab({ utenteId }: RelatorioDentariaTabProps) {
  const { toast } = useToast()
  const [sessaoHtml, setSessaoHtml] = useState('<p></p>')

  const { data: entradas = [], isLoading } = useGetHistoriaDentariaByUtente(utenteId)
  const createMutation = useCreateHistoriaDentaria()

  const historiaAcumuladaHtml = useMemo(() => {
    const blocks = entradas.map((e) => {
      const cab =
        `<p class="mb-2 text-xs font-medium text-muted-foreground">${formatRegistoPt(e.dataRegisto)}</p>` +
        `<div class="historia-conteudo">${e.historiaHtml || ''}</div>`
      return cab
    })
    return buildHistoriaAcumulada(blocks)
  }, [entradas])

  const handleGuardar = async () => {
    const textoPlano = sessaoHtml.replace(/<[^>]+>/g, '').trim()
    if (!textoPlano) {
      toast({
        title: 'Relatório vazio',
        description: 'Escreva o texto do relatório antes de guardar.',
        variant: 'destructive',
      })
      return
    }

    try {
      await createMutation.mutateAsync({
        utenteId,
        historiaHtml: sessaoHtml,
      })
      setSessaoHtml('<p></p>')
      toast({ title: 'Relatório guardado', description: 'A entrada foi adicionada ao histórico.' })
    } catch (e) {
      toast({
        title: 'Erro ao guardar',
        description: e instanceof Error ? e.message : 'Não foi possível guardar.',
        variant: 'destructive',
      })
    }
  }

  const handleImprimir = () => {
    const w = window.open('', '_blank', 'noopener,noreferrer')
    if (!w) {
      toast({
        title: 'Impressão bloqueada',
        description: 'Permita janelas emergentes para imprimir.',
        variant: 'destructive',
      })
      return
    }

    const doc = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8"/>
<title>Relatório dentário</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 16px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.1rem; color: #0d9488; margin-top: 0; }
  .sec { margin-bottom: 24px; }
</style>
</head>
<body>
  <h1>Histórico</h1>
  <div class="sec">${historiaAcumuladaHtml || '<p><em>Sem registos.</em></p>'}</div>
  <h1>Relatório atual (sessão)</h1>
  <div class="sec">${sessaoHtml || '<p></p>'}</div>
</body>
</html>`
    w.document.write(doc)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  return (
    <div className='flex flex-col gap-3'>
      <h2 className='text-lg font-semibold text-teal-600 dark:text-teal-400'>Relatório</h2>

      {/*
        Legado: caixa histórico → linha só com botões (Imprimir | Guardar) alinhados à direita → editor.
      */}
      <div className='flex flex-col gap-3'>
        <div className='flex min-w-0 flex-col gap-1'>
          <span className='text-xs font-medium text-muted-foreground'>Histórico acumulado</span>
          <div
            className='min-h-[140px] max-h-[min(40vh,320px)] resize-y overflow-auto rounded-md border border-border bg-background px-3 py-2 prose prose-sm max-w-none dark:prose-invert [&_.historia-conteudo]:mt-0'
            dangerouslySetInnerHTML={{
              __html:
                historiaAcumuladaHtml ||
                '<p class="text-sm text-muted-foreground"><em>Ainda não existem relatórios guardados.</em></p>',
            }}
          />
        </div>

        <div className='flex flex-shrink-0 flex-row flex-wrap items-center justify-end gap-2 py-0.5'>
          <Button
            type='button'
            variant='outline'
            className='gap-2 rounded-md border-amber-600/35 bg-[#e8d5a3] px-4 py-2 font-medium text-amber-950 shadow-sm hover:bg-[#dfc990] dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-50 dark:hover:bg-amber-900/60'
            onClick={handleImprimir}
          >
            <Printer className='h-4 w-4 shrink-0' />
            Imprimir
          </Button>
          <Button
            type='button'
            className='gap-2 rounded-md bg-teal-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500'
            onClick={() => void handleGuardar()}
            disabled={createMutation.isPending || isLoading}
          >
            {createMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4 shrink-0' />
            )}
            Guardar relatório
          </Button>
        </div>

        <div className='flex min-w-0 flex-col gap-1'>
          <span className='text-xs font-medium text-muted-foreground'>Nova entrada (sessão atual)</span>
          <RelatorioDentariaRichEditor value={sessaoHtml} onChange={setSessaoHtml} />
        </div>
      </div>
    </div>
  )
}
