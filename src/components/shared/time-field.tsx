import { useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inputClass, selectTriggerClass } from '@/lib/form-styles'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TIME_HOUR_OPTIONS,
  TIME_MINUTE_OPTIONS,
  buildTimeValue,
  normalizeTimeValue,
  parseTimeParts,
  snapMinuteToStep,
} from '@/utils/time-utils'

type TimeFieldProps = {
  id?: string
  value?: string | null
  onChange: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  className?: string
  placeholder?: string
}

export function TimeField({
  id,
  value,
  onChange,
  disabled,
  readOnly,
  className,
  placeholder = 'Selecione hora',
}: TimeFieldProps) {
  const isDisabled = disabled || readOnly
  const [open, setOpen] = useState(false)
  const normalized = normalizeTimeValue(value)
  const { hour, minute } = parseTimeParts(value)
  const minuteValue = minute || snapMinuteToStep(parseTimeParts(value, 1).minute)

  const emitChange = (nextHour: string, nextMinute: string) => {
    onChange(buildTimeValue(nextHour, nextMinute))
  }

  const displayValue =
    hour && minuteValue ? buildTimeValue(hour, minuteValue) : normalized.slice(0, 5)

  return (
    <Popover open={open} onOpenChange={(next) => !isDisabled && setOpen(next)}>
      <PopoverTrigger asChild disabled={isDisabled}>
        <Button
          id={id}
          type='button'
          variant='outline'
          disabled={isDisabled}
          className={cn(
            inputClass,
            'justify-start px-3 font-normal shadow-inner',
            !displayValue && 'text-muted-foreground',
            className
          )}
        >
          <Clock className='mr-2 h-4 w-4 shrink-0 opacity-80' />
          <span className='truncate'>{displayValue || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-3' align='start'>
        <div className='flex items-center gap-2'>
          <Select
            value={hour || undefined}
            onValueChange={(nextHour) => {
              emitChange(nextHour, minuteValue || '00')
            }}
          >
            <SelectTrigger className={cn(selectTriggerClass, 'w-[72px]')}>
              <SelectValue placeholder='HH' />
            </SelectTrigger>
            <SelectContent className='max-h-60'>
              {TIME_HOUR_OPTIONS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className='text-sm font-medium text-muted-foreground'>:</span>
          <Select
            value={minuteValue || undefined}
            onValueChange={(nextMinute) => {
              emitChange(hour || '00', nextMinute)
            }}
          >
            <SelectTrigger className={cn(selectTriggerClass, 'w-[72px]')}>
              <SelectValue placeholder='MM' />
            </SelectTrigger>
            <SelectContent>
              {TIME_MINUTE_OPTIONS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
