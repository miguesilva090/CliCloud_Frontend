import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { toast } from '@/utils/toast-utils'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'
import { exportMarcacoesRelatorioCsv } from '../utils/marcacoes-export-relatorio'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listPermId: string
  criteria: MarcacoesListCriteria
}

export function MarcacoesRelatoriosModal({
  open,
  onOpenChange,
  listPermId,
  criteria,
}: Props) {
  const [exporting, setExporting] = useState(false)
  const [utenteId, setUtenteId] = useState('')
  const [utSearch, setUtSearch] = useState('')
  const [debouncedUt] = useDebounce(utSearch, 300)

  const utentesQuery = useQuery({
    queryKey: ['marc-relatorio', 'ut', debouncedUt],
    queryFn: () => UtentesService(listPermId).getUtentesLight(debouncedUt),
    enabled: open,
  })

  const utenteItems = (utentesQuery.data?.info?.data ?? []).map(
    (u: { id: string; nome: string; numeroUtente?: string | null }) => ({
      value: u.id,
      label: u.nome,
      secondary: u.numeroUtente ?? undefined,
    })
  )

  const runExport = async (tipo: 'data' | 'medico' | 'utente') => {
    setExporting(true)
    try {
      const result = await exportMarcacoesRelatorioCsv(listPermId, {
        tipo,
        criteria,
        utenteId: tipo === 'utente' ? utenteId : undefined,
      })
      if (result.ok) {
        toast.success('Relatório exportado (CSV).')
        onOpenChange(false)
      } else {
        toast.error(result.message ?? 'Exportação falhou.')
      }
    } catch {
      toast.error('Erro na exportação.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Listagens / exportar</DialogTitle>
        </DialogHeader>
        <p className='text-sm text-muted-foreground'>
          Exportação CSV com base na API administrativa (até 5000 registos).
        </p>
        <div className='space-y-3'>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            disabled={exporting}
            onClick={() => runExport('data')}
          >
            Marcações por data (período da agenda)
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            disabled={exporting}
            onClick={() => runExport('medico')}
          >
            Marcações por médico (médico selecionado na agenda)
          </Button>
          <div className='space-y-2 rounded-md border p-3'>
            <Label className='text-xs'>Marcações por utente</Label>
            <AsyncCombobox
              value={utenteId}
              onChange={setUtenteId}
              searchValue={utSearch}
              onSearchValueChange={setUtSearch}
              items={utenteItems}
              isLoading={utentesQuery.isFetching}
              placeholder='Utente…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
            <Button
              type='button'
              size='sm'
              disabled={exporting || !utenteId}
              onClick={() => runExport('utente')}
            >
              Exportar CSV
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
