import type { InputHTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'
import { inputBaseClassName } from '@/shared/ui/primitives/fieldClassNames'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(inputBaseClassName, className)} {...props} />
}
