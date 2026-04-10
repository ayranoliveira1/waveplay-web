interface ToastItem {
  id: number
  message: string
  variant: 'success' | 'error'
}

let toasts: ToastItem[] = []
let nextId = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function addToast(message: string, variant: 'success' | 'error') {
  const id = nextId++
  toasts = [...toasts, { id, message, variant }]
  emit()
  setTimeout(() => removeToast(id), 4000)
}

export function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function getToasts() {
  return toasts
}

export function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
}
