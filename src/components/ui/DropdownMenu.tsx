import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

export interface DropdownMenuItem {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  disabledTooltip?: string
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
}

interface MenuPosition {
  top: number
  left: number
}

const MENU_OFFSET = 4 // px abaixo do trigger
const MENU_MIN_WIDTH = 176 // 11rem

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Calcula posicao absoluta no document baseado no rect do trigger.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return

    function computePosition() {
      const rect = triggerRef.current!.getBoundingClientRect()
      const top = rect.bottom + MENU_OFFSET + window.scrollY
      const left =
        align === 'right'
          ? rect.right - MENU_MIN_WIDTH + window.scrollX
          : rect.left + window.scrollX
      setPosition({ top, left })
    }

    computePosition()
    window.addEventListener('resize', computePosition)
    window.addEventListener('scroll', computePosition, true)
    return () => {
      window.removeEventListener('resize', computePosition)
      window.removeEventListener('scroll', computePosition, true)
    }
  }, [open, align])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node
      const insideTrigger = triggerRef.current?.contains(target) ?? false
      const insideMenu = menuRef.current?.contains(target) ?? false
      if (!insideTrigger && !insideMenu) {
        setOpen(false)
      }
    }

    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, open])

  function nextEnabled(from: number, dir: 1 | -1): number {
    const n = items.length
    for (let i = 1; i <= n; i++) {
      const idx = (from + dir * i + n) % n
      const candidate = items[idx]
      if (candidate && !candidate.disabled) return idx
    }
    return from
  }

  function handleMenuKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => nextEnabled(i < 0 ? -1 : i, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => nextEnabled(i < 0 ? items.length : i, -1))
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault()
      const item = items[focusedIndex]
      if (item && !item.disabled) {
        setOpen(false)
        item.onSelect()
      }
    }
  }

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation()
    setOpen((v) => !v)
    setFocusedIndex(-1)
  }

  const menu =
    open && position && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              role="menu"
              onKeyDown={handleMenuKeyDown}
              style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                minWidth: MENU_MIN_WIDTH,
              }}
              className="z-50 rounded-lg border border-border bg-surface py-1 shadow-xl shadow-black/40"
            >
              {items.map((item, idx) => {
                const Icon = item.icon
                const disabled = !!item.disabled
                const base =
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors'
                const active =
                  item.variant === 'danger'
                    ? 'text-error hover:bg-error/10'
                    : 'text-text hover:bg-border/30'
                const disabledCls = 'opacity-50 cursor-not-allowed'

                return (
                  <button
                    key={idx}
                    type="button"
                    ref={(el) => {
                      itemRefs.current[idx] = el
                    }}
                    role="menuitem"
                    disabled={disabled}
                    title={disabled ? item.disabledTooltip : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (disabled) return
                      setOpen(false)
                      item.onSelect()
                    }}
                    onMouseEnter={() => !disabled && setFocusedIndex(idx)}
                    className={`${base} ${disabled ? disabledCls : active} ${
                      !disabled ? 'cursor-pointer' : ''
                    }`}
                  >
                    {Icon && <Icon size={16} className="shrink-0" />}
                    {item.label}
                  </button>
                )
              })}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onClick={(e) => e.stopPropagation()}
      >
        <div onClick={handleTriggerClick}>{trigger}</div>
      </div>
      {menu}
    </>
  )
}
