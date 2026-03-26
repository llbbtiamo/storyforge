import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'
import { inputBaseClassName } from '@/shared/ui/primitives/fieldClassNames'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select className={cn(inputBaseClassName, 'appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-subtle"
      >
        <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}
