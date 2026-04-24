import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import 'react-day-picker/style.css'

interface SubscriptionEndsAtFieldProps {
  value: Date | null
  onChange: (value: Date | null) => void
  error?: string
  label?: string
}

export function SubscriptionEndsAtField({
  value,
  onChange,
  error,
  label = 'Data de término',
}: SubscriptionEndsAtFieldProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const noEndDate = value === null

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      onChange(null)
      setOpen(false)
    } else {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      onChange(tomorrow)
    }
  }

  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-text-muted">
        {label}
      </label>

      <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          checked={noEndDate}
          onChange={handleCheckbox}
          className="h-4 w-4 cursor-pointer accent-primary"
        />
        Sem data de término
      </label>

      {!noEndDate && (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface/80 px-4 py-2.5 text-sm text-text transition-colors hover:border-primary/50 hover:bg-surface"
          >
            <CalendarDays size={16} className="text-primary" />
            <span>
              {value
                ? format(value, 'dd/MM/yyyy', { locale: ptBR })
                : 'Selecionar data'}
            </span>
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-2 rounded-xl border border-border bg-surface p-2 shadow-2xl shadow-black/40">
              <DayPicker
                mode="single"
                selected={value ?? undefined}
                onSelect={(date) => {
                  if (date) {
                    onChange(date)
                    setOpen(false)
                  }
                }}
                disabled={{ before: new Date() }}
                locale={ptBR}
                showOutsideDays
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
