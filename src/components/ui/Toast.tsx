import { useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { getToasts, removeToast, subscribe } from '../../lib/toast'

function useToasts() {
  return useSyncExternalStore(subscribe, getToasts)
}

export function Toaster() {
  const items = useToasts()

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <ToastNotification key={t.id} id={t.id} message={t.message} variant={t.variant} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastNotification({
  id,
  message,
  variant,
}: {
  id: number
  message: string
  variant: 'success' | 'error'
}) {
  const isSuccess = variant === 'success'

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 4000)
    return () => clearTimeout(timer)
  }, [id])

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex w-80 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg"
    >
      {isSuccess ? (
        <CheckCircle size={18} className="shrink-0 text-success" />
      ) : (
        <XCircle size={18} className="shrink-0 text-error" />
      )}
      <p className="flex-1 text-sm text-text">{message}</p>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="shrink-0 text-text-muted transition-colors hover:text-text"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}
