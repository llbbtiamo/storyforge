import { StrictMode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { AuthContext } from '@/shared/auth/auth-context'
import { MessageContext } from '@/shared/ui/message-context'

const createCaptchaMock = vi.fn()
const sendRegisterEmailCodeMock = vi.fn()
const registerMock = vi.fn()
const messageApi = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/shared/api/services', () => ({
  authApi: {
    createCaptcha: (...args: unknown[]) => createCaptchaMock(...args),
    sendRegisterEmailCode: (...args: unknown[]) => sendRegisterEmailCodeMock(...args),
    register: (...args: unknown[]) => registerMock(...args),
  },
}))

function renderRegisterPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: null,
            loading: false,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshMe: vi.fn().mockResolvedValue(undefined),
          }}
        >
          <MessageContext.Provider value={messageApi}>
            <MemoryRouter>
              <RegisterPage />
            </MemoryRouter>
          </MessageContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

beforeEach(() => {
  createCaptchaMock.mockReset()
  sendRegisterEmailCodeMock.mockReset()
  registerMock.mockReset()
  messageApi.success.mockReset()
  messageApi.error.mockReset()
  messageApi.info.mockReset()

  createCaptchaMock.mockResolvedValue({
    captchaId: 'captcha-id',
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAKAAAAAyCAYAAADbYdBl',
  })
  sendRegisterEmailCodeMock.mockResolvedValue({
    expireSeconds: 300,
    resendAfterSeconds: 60,
  })
})

describe('RegisterPage', () => {
  it('shows required field errors and invalid state on submit', async () => {
    renderRegisterPage()

    await screen.findByAltText('注册验证码')
    fireEvent.click(screen.getByRole('button', { name: '注册并登录' }))

    expect(await screen.findAllByText('此项为必填项')).toHaveLength(5)
    expect(messageApi.error).toHaveBeenCalledWith('请完整填写注册所需字段')
    expect(screen.getByPlaceholderText('请输入用户名')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveAttribute('aria-invalid', 'true')
  })

  it('starts countdown after sending email code and refreshes captcha by clicking the image', async () => {
    renderRegisterPage()

    const captcha = await screen.findByAltText('注册验证码')
    fireEvent.change(screen.getByPlaceholderText('请输入邮箱'), { target: { value: 'demo@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('请输入图形验证码'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: '发送邮箱验证码' }))

    await waitFor(() => {
      expect(sendRegisterEmailCodeMock).toHaveBeenCalledWith({
        email: 'demo@example.com',
        captchaId: 'captcha-id',
        captchaCode: '1234',
      })
    })

    expect(await screen.findByRole('button', { name: '重新发送 (60s)' })).toBeDisabled()
    expect(screen.getByText('请等待倒计时结束后重试')).toBeInTheDocument()

    fireEvent.click(captcha)
    await waitFor(() => {
      expect(createCaptchaMock).toHaveBeenCalledTimes(3)
    })
  })
})
