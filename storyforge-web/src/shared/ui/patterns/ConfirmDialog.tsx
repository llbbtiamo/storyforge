import type { ReactNode } from 'react'

import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'

interface ConfirmDialogProps {
  open: boolean
  title: ReactNode
  description?: ReactNode
  confirmLabel?: ReactNode
  cancelLabel?: ReactNode
  tone?: 'primary' | 'danger'
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  tone = 'danger',
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      description={description}
      dismissible={!confirming}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={confirming} onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button disabled={confirming} loading={confirming} onClick={onConfirm} variant={tone === 'danger' ? 'danger' : 'primary'}>
            {confirmLabel}
          </Button>
        </div>
      }
      onClose={onCancel}
      open={open}
      size="sm"
      title={title}
    >
      <div className="text-sm leading-7 text-text-muted">此操作将立即生效，请确认后继续。</div>
    </Dialog>
  )
}
