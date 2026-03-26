import { createPortal } from 'react-dom'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react'

import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/ui/primitives/Button'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
]
  .join(', ')

const sizeClassNames = {
  sm: 'max-w-lg',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
} as const

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: keyof typeof sizeClassNames
  panelClassName?: string
  bodyClassName?: string
  initialFocusRef?: MutableRefObject<HTMLElement | null>
  showCloseButton?: boolean
  dismissible?: boolean
  ariaLabel?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  panelClassName,
  bodyClassName,
  initialFocusRef,
  showCloseButton = true,
  dismissible = true,
  ariaLabel,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const labelledBy = title ? titleId : undefined
  const describedBy = description ? descriptionId : undefined

  useEffect(() => {
    if (!open) {
      return
    }

    previousActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTarget =
      initialFocusRef?.current ??
      (panelRef.current?.querySelector(focusableSelector) as HTMLElement | null) ??
      panelRef.current

    window.requestAnimationFrame(() => {
      focusTarget?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
      )

      if (focusable.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      previousActiveElementRef.current?.focus()
    }
  }, [dismissible, initialFocusRef, onClose, open])

  const portalTarget = useMemo(() => (typeof document !== 'undefined' ? document.body : null), [])

  if (!open || !portalTarget) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-md sm:p-6"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={cn(
          'relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border/80 bg-surface shadow-modal outline-none sm:max-h-[calc(100vh-3rem)]',
          sizeClassNames[size],
          panelClassName,
        )}
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        {title || description || showCloseButton ? (
          <div className="flex items-start justify-between gap-4 border-b border-border/50 bg-surface px-5 py-5 sm:px-6">
            <div className="min-w-0 space-y-1.5">
              {title ? (
                <h2 className="text-xl font-[600] tracking-tight text-text sm:text-2xl" id={titleId}>
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="text-[15px] leading-6 text-text-muted" id={descriptionId}>
                  {description}
                </p>
              ) : null}
            </div>
            {showCloseButton ? (
              <Button aria-label="关闭对话框" className="shrink-0 -mr-2" disabled={!dismissible} onClick={onClose} size="sm" variant="ghost">
                关闭
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6', bodyClassName)}>{children}</div>

        {footer ? <div className="border-t border-border/50 bg-surface-subtle/50 px-5 py-4 sm:px-6">{footer}</div> : null}
      </div>
    </div>,
    portalTarget,
  )
}
