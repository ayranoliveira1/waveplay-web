import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  isPending?: boolean
}

const variantStyles = {
  danger: {
    icon: ShieldAlert,
    iconColor: 'text-error',
    button: 'bg-error hover:bg-error/90 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-warning',
    button: 'bg-warning hover:bg-warning/90 text-white',
  },
} as const

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning',
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant]
  const Icon = styles.icon

  function handleClose() {
    if (!isPending) onOpenChange(false)
  }

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 ${styles.iconColor}`}>
            <Icon size={24} />
          </div>
          <p className="text-sm text-text-muted">{description}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            isLoading={isPending}
            className={styles.button}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
