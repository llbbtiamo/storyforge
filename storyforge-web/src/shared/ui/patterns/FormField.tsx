import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from 'react'

import { cn } from '@/shared/utils/cn'

interface FormFieldProps {
  label: ReactNode
  children: ReactNode
  hint?: ReactNode
  error?: ReactNode
  className?: string
  required?: boolean
}

type FieldControlElement = ReactElement<{
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}>

export function FormField({ label, children, hint, error, className, required = false }: FormFieldProps) {
  const generatedId = useId()
  const hintId = useId()
  const errorId = useId()

  const controlId = isValidElement(children) ? (children as FieldControlElement).props.id ?? generatedId : generatedId
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  const control = isValidElement(children)
    ? cloneElement(children as FieldControlElement, {
        id: controlId,
        'aria-describedby': [(children as FieldControlElement).props['aria-describedby'], describedBy]
          .filter(Boolean)
          .join(' ') || undefined,
        'aria-invalid': error ? true : (children as FieldControlElement).props['aria-invalid'],
      })
    : children

  return (
    <div className={cn('grid gap-2.5', className)}>
      <label className="text-sm font-semibold text-text" htmlFor={controlId}>
        <span className="inline-flex items-center gap-1">
          <span>{label}</span>
          {required ? <span aria-hidden="true" className="text-danger">*</span> : null}
        </span>
      </label>
      {control}
      {hint ? (
        <div className="text-sm leading-6 text-text-muted" id={hintId}>
          {hint}
        </div>
      ) : null}
      {error ? (
        <div className="text-sm font-medium text-danger" id={errorId}>
          {error}
        </div>
      ) : null}
    </div>
  )
}
