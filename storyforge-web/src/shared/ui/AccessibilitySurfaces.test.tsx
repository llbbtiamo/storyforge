import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Toast } from '@/shared/ui/primitives/Toast'
import { FormField } from '@/shared/ui/patterns/FormField'
import { Input } from '@/shared/ui/primitives/Input'

describe('shared accessibility surfaces', () => {
  it('keeps label and input ids aligned when a custom id is provided', () => {
    render(
      <FormField label="用户名">
        <Input id="custom-input-id" />
      </FormField>,
    )

    expect(screen.getByLabelText('用户名')).toHaveAttribute('id', 'custom-input-id')
  })

  it('announces error toasts as alerts', () => {
    render(<Toast title="保存失败" tone="error" />)

    expect(screen.getByRole('alert')).toHaveTextContent('保存失败')
  })

  it('keeps success toasts as polite status messages', () => {
    render(<Toast title="保存成功" tone="success" />)

    expect(screen.getByRole('status')).toHaveTextContent('保存成功')
  })
})
