import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { toast } from '@/utils/toast-utils'
import { FeriadoService } from '@/lib/services/utility/feriados-service'
import { EmpresaService } from '@/lib/services/saude/empresa-service'
import { ResponseStatus } from '@/types/api/responses'
import type { EmpresaTableDTO } from '@/types/dtos/saude/empresas.dtos'

interface FeriadoImportarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function FeriadoImportarModal({
  open,
  onOpenChange,
  onSuccess,
}: FeriadoImportarModalProps) {
  const [clinicaOrigemId, setClinicaOrigemId] = useState('')
  const [empresaQ, setEmpresaQ] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [empresaQD] = useDebounce(empresaQ, 250)

  const empresasQuery = useQuery({
    queryKey: ['feriados', 'empresas-origem', empresaQD],
    queryFn: () =>
      EmpresaService('empresas').getEmpresasPaginated({
        pageNumber: 1,
        pageSize: 100,
        filters: empresaQD ? [{ id: 'nome', value: empresaQD }] : undefined,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  })

  const empresas = (empresasQuery.data?.info?.data ?? []) as EmpresaTableDTO[]
  const empresaItems = useMemo(
    () =>
      empresas.map((e) => ({
        value: e.id,
        label: e.nome ?? e.id,
      })),
    [empresas]
  )

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  const handleImportar = async () => {
    const origem = clinicaOrigemId.trim()
    if (!origem) {
      toast.error('Selecione a clínica de origem.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await FeriadoService().importarFeriados({
        clinicaOrigemId: origem,
      })

      if (response.info.status === ResponseStatus.Success) {
        toast.success('Feriados importados com sucesso.')
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao importar feriados.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao importar feriados.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Importar Feriados</DialogTitle>
          <DialogDescription>
            Selecione a clínica de origem para importar os feriados que ainda não
            existem na clínica atual.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Clínica de origem</Label>
            <AsyncCombobox
              value={clinicaOrigemId}
              onChange={setClinicaOrigemId}
              items={empresaItems}
              isLoading={empresasQuery.isLoading}
              placeholder='Selecione a clínica de origem'
              searchPlaceholder='Pesquisar clínica...'
              emptyText='Sem clínicas disponíveis.'
              searchValue={empresaQ}
              onSearchValueChange={setEmpresaQ}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleImportar} disabled={isSubmitting}>
            {isSubmitting ? 'A importar...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
