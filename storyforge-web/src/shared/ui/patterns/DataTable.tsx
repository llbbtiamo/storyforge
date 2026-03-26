import type { Key, ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'

interface DataTableColumn<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  mobileLabel?: ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>
  data: T[]
  rowKey: keyof T | ((row: T) => Key)
  emptyTitle: ReactNode
  emptyDescription: ReactNode
  renderDetails?: (row: T) => ReactNode
  detailsLabel?: ReactNode
  className?: string
}

function getRowKey<T>(row: T, rowKey: keyof T | ((row: T) => Key)) {
  return typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] as Key)
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyTitle,
  emptyDescription,
  renderDetails,
  detailsLabel = '查看详情',
  className,
}: DataTableProps<T>) {
  if (!data.length) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-border bg-surface">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-surface-subtle text-sm text-text-muted">
              <tr>
                {columns.map((column) => (
                  <th className="border-b border-border px-4 py-3 font-semibold" key={column.key}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const key = getRowKey(row, rowKey)
                return (
                  <tr className="align-top" key={key}>
                    {columns.map((column) => (
                      <td className={cn('border-b border-border px-4 py-4 text-sm leading-7 text-text', column.className)} key={column.key}>
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {data.map((row) => (
          <SectionCard className="gap-4" key={getRowKey(row, rowKey)}>
            <div className="grid gap-3">
              {columns.map((column) => (
                <div className="grid gap-1.5" key={column.key}>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                    {column.mobileLabel ?? column.header}
                  </div>
                  <div className="text-sm leading-7 text-text">{column.render(row)}</div>
                </div>
              ))}
            </div>
            {renderDetails ? (
              <details className="group rounded-[var(--radius-control)] border border-border bg-surface-subtle px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-text marker:hidden">
                  <span>{detailsLabel}</span>
                  <span className="text-xs text-text-subtle transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="mt-3">{renderDetails(row)}</div>
              </details>
            ) : null}
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
