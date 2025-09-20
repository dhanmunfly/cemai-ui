import React from 'react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'info' | 'warning' | 'error'

type Toast = {
  id: string
  message: string
  variant?: ToastVariant
  timeoutMs?: number
}

type ToastContextValue = {
  addToast: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const variantClass: Record<ToastVariant, string> = {
  success: 'bg-green-600',
  info: 'bg-blue-600',
  warning: 'bg-amber-600',
  error: 'bg-red-600',
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast: Toast = { id, variant: 'info', timeoutMs: 3000, ...t }
    setToasts((prev) => [...prev, toast])
    const timeout = window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, toast.timeoutMs)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={cn('text-white px-3 py-2 rounded-md shadow-lg', variantClass[t.variant ?? 'info'])}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}


