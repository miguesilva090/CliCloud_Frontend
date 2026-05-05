import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'

interface SelecionarClinicaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClinicaSelecionada?: () => void
}

export function SelecionarClinicaModal({
  open,
  onOpenChange,
  onClinicaSelecionada,
}: SelecionarClinicaModalProps) {
  const [clinicaId, setClinicaId] = useState('')

  const clinicasQuery = useQuery({
    queryKey: ['contexto-clinica', 'disponiveis'],
    queryFn: () => ClinicaService('tabelas').getClinicasDisponiveisContexto(),
    enabled: open,
  })

  const clinicas = useMemo(
    () => clinicasQuery.data?.info?.data ?? [],
    [clinicasQuery.data]
  )

  const selecionarMutation = useMutation({
    mutationFn: (id: string) => ClinicaService('tabelas').selecionarClinicaContexto(id),
    onSuccess: (response) => {
      const info = response.info
      if (info.status !== ResponseStatus.Success) {
        const msg = info.messages?.['$']?.[0] ?? 'Falha ao selecionar clínica.'
        toast.error(msg)
        return
      }

      toast.success('Clínica associada com sucesso.')
      onOpenChange(false)
      onClinicaSelecionada?.()
    },
    onError: () => {
      toast.error('Falha ao selecionar clínica.')
    },
  })

  const handleConfirmar = () => {
    if (!clinicaId) {
      toast.warning('Selecione uma clínica.')
      return
    }
    selecionarMutation.mutate(clinicaId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Selecionar Clínica</DialogTitle>
          <DialogDescription>
            Esta conta ainda não tem uma clínica associada. Selecione a clínica para continuar.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          <Select value={clinicaId} onValueChange={setClinicaId}>
            <SelectTrigger>
              <SelectValue placeholder='Selecionar clínica...' />
            </SelectTrigger>
            <SelectContent>
              {clinicas.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome || c.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type='button'
            onClick={handleConfirmar}
            disabled={selecionarMutation.isPending || clinicasQuery.isLoading}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
