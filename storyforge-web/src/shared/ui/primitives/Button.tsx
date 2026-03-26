import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border font-[600] tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-primary text-text-inverse shadow-[0_2px_4px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]',
        secondary:
          'border-border/80 bg-surface text-text shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:bg-surface-subtle',
        danger:
          'border-transparent bg-danger text-text-inverse shadow-[0_2px_4px_rgba(239,68,68,0.15),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:bg-danger-hover',
        ghost: 'border-transparent text-text-muted hover:bg-surface-subtle hover:text-text',
        subtle: 'border-border bg-surface-subtle text-text hover:bg-surface hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
      },
      size: {
        sm: 'h-8 px-3 text-[13px]',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-[15px]',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      block: false,
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

export function Button({
  children,
  className,
  loading = false,
  variant,
  size,
  block,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      {children}
    </button>
  )
}
