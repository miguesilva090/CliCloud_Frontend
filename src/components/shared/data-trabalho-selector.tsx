import { useEffect, useState } from 'react'
import { sessionVars } from '@/lib/utils/session-vars'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { ADMISSOES_PAGINATED_QUERY_KEY } from '@/pages/area-administrativa/consultas/admissoes/queries/listagem-admissoes-queries'

export function DataTrabalhoSelector() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const queryClient = useQueryClient()

  useEffect(() => {
    const dataTrabalho = sessionVars.get('data-trabalho')
    if (dataTrabalho) {
      setSelectedDate(new Date(dataTrabalho))
    }
  }, [])

  const handleDateChange = (date?: Date) => {
    if (date) {
      // Set time to midnight
      date.setHours(0, 0, 0, 0)
      sessionVars.set('data-trabalho', date)
      setSelectedDate(date)
      void queryClient.invalidateQueries({ queryKey: ADMISSOES_PAGINATED_QUERY_KEY})
    }
  }

  return (
    <div className='space-y-2'>
      <Label>Data de Trabalho</Label>
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        placeholder='Selecione uma data'
      />
    </div>
  )
}
