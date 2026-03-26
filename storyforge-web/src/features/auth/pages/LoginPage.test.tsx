import { StrictMode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AuthContext } from '@/shared/auth/auth-context'
import { MessageContext } from '@/shared/ui/message-context'

const createCaptchaMock = vi.fn()
const loginMock = vi.fn()
const messageApi = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/shared/api/services', () => ({
  authApi: {
    createCaptcha: (...args: unknown[]) => createCaptchaMock(...args),
    login: (...args: unknown[]) => loginMock(...args),
  },
}))

function renderLoginPage() {
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
              <LoginPage />
            </MemoryRouter>
          </MessageContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

beforeEach(() => {
  createCaptchaMock.mockReset()
  loginMock.mockReset()
  messageApi.success.mockReset()
  messageApi.error.mockReset()
  messageApi.info.mockReset()

  createCaptchaMock.mockResolvedValue({
    captchaId: 'captcha-id',
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAKAAAAAyCAYAAADbYdBl',
  })
})

describe('LoginPage', () => {
  it('shows field errors and invalid state on submit', async () => {
    renderLoginPage()

    await screen.findByAltText('登录验证码')
    fireEvent.click(screen.getByRole('button', { name: '登录工作台' }))

    expect(await screen.findAllByText('此项为必填项')).toHaveLength(3)
    expect(messageApi.error).toHaveBeenCalledWith('请完整填写用户名、密码和图形验证码')
    expect(screen.getByPlaceholderText('请输入用户名')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByPlaceholderText('请输入密码')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not fetch captcha more than once on initial mount in StrictMode', async () => {
    renderLoginPage()

    const captcha = await screen.findByAltText('登录验证码')

    expect(createCaptchaMock).toHaveBeenCalledTimes(1)
    expect(captcha).toHaveAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAyCAYAAADbYdBl')
  })

  it('shows retry state when captcha loading fails', async () => {
    createCaptchaMock.mockRejectedValue(new Error('验证码加载失败'))

    renderLoginPage()

    const retryTrigger = await screen.findByRole('button', { name: '加载失败，点击重试' })
    expect(messageApi.error).toHaveBeenCalledWith('验证码加载失败')
    expect(retryTrigger).not.toBeDisabled()
  })

  it('refreshes captcha when clicking the image', async () => {
    renderLoginPage()

    const captcha = await screen.findByAltText('登录验证码')
    fireEvent.click(captcha)

    await waitFor(() => {
      expect(createCaptchaMock).toHaveBeenCalledTimes(2)
    })
  })

  it('does not submit login when captcha is not ready', async () => {
    createCaptchaMock.mockRejectedValueOnce(new Error('验证码加载失败'))

    renderLoginPage()

    await screen.findByRole('button', { name: '加载失败，点击重试' })

    fireEvent.change(screen.getByPlaceholderText('请输入用户名'), { target: { value: 'demo' } })
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: 'password' } })
    fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: '登录工作台' }))

    await waitFor(() => {
      expect(loginMock).not.toHaveBeenCalled()
      expect(screen.getByText('请先加载图形验证码')).toBeInTheDocument()
    })
  })
})
