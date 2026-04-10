import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import 'react-day-picker/style.css'

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const label =
    value?.from && value?.to
      ? `${format(value.from, 'dd MMM', { locale: ptBR })} — ${format(value.to, 'dd MMM', { locale: ptBR })}`
      : 'Selecionar periodo'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface/80 px-4 py-2.5 text-sm text-text transition-colors hover:border-primary/50 hover:bg-surface"
      >
        <CalendarDays size={16} className="text-primary" />
        <span>{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-border bg-surface p-2 shadow-2xl shadow-black/40">
          <DayPicker
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange(range)
              if (range?.from && range?.to) setOpen(false)
            }}
            locale={ptBR}
            numberOfMonths={2}
            showOutsideDays
          />
        </div>
      )}
    </div>
  )
}
