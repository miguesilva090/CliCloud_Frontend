import { DatePicker } from '@/components/ui/date-picker'
import { fromDatabaseDate, toDatabaseDateString } from '@/utils/date-utils'

type DateFieldProps = {
  value?: string | null
  onChange: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  className?: string
  placeholder?: string
  id?: string
  minYear?: number
  maxYear?: number
}

export function DateField({
  value,
  onChange,
  disabled,
  readOnly,
  className,
  placeholder,
  id,
  minYear,
  maxYear,
}: DateFieldProps) {
  return (
    <DatePicker
      id={id}
      className={className}
      value={fromDatabaseDate(value)}
      onChange={(date) => onChange(toDatabaseDateString(date) ?? '')}
      disabled={disabled || readOnly}
      displayFormat='dd/MM/yyyy'
      placeholder={placeholder ?? 'Selecione uma data'}
      minYear={minYear}
      maxYear={maxYear}
    />
  )
}
