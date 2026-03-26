import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'
import { inputBaseClassName } from '@/shared/ui/primitives/fieldClassNames'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(inputBaseClassName, 'h-auto min-h-28 resize-y py-3 leading-6', className)}
      rows={rows}
      {...props}
    />
  )
}
