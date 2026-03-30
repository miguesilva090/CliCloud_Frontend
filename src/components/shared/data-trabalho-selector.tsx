import { useEffect, useState } from 'react'
import { sessionVars } from '@/lib/utils/session-vars'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'

export function DataTrabalhoSelector() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

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
