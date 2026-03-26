import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { setBrowserNotifyApi } from '@/shared/ui/browser-notify'
import type { AppMessageApi } from '@/shared/ui/message-context'
import { MessageContext } from '@/shared/ui/message-context'
import { Toast } from '@/shared/ui/primitives/Toast'

interface ToastItem {
  id: number
  tone: 'success' | 'error' | 'info'
  content: string
}

export function AppMessageProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (tone: ToastItem['tone'], content: string) => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, tone, content }])
      window.setTimeout(() => removeToast(id), 3600)
    },
    [removeToast],
  )

  const api = useMemo<AppMessageApi>(
    () => ({
      success: (content) => pushToast('success', content),
      error: (content) => pushToast('error', content),
      info: (content) => pushToast('info', content),
    }),
    [pushToast],
  )

  useEffect(() => {
    setBrowserNotifyApi(api)
    return () => setBrowserNotifyApi(null)
  }, [api])

  const portalTarget = useMemo(() => (typeof document !== 'undefined' ? document.body : null), [])

  return (
    <MessageContext.Provider value={api}>
      {children}
      {portalTarget
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-3 sm:left-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-sm">
              {toasts.map((toast) => (
                <div className="pointer-events-auto" key={toast.id}>
                  <Toast onClose={() => removeToast(toast.id)} title={toast.content} tone={toast.tone} />
                </div>
              ))}
            </div>,
            portalTarget,
          )
        : null}
    </MessageContext.Provider>
  )
}
