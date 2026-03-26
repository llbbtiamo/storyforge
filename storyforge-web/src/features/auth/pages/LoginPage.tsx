import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'

import { authApi } from '@/shared/api/services'
import { useAuth } from '@/shared/auth/useAuth'
import { Button } from '@/shared/ui/primitives/Button'
import { Input } from '@/shared/ui/primitives/Input'
import { AuthShell } from '@/shared/ui/patterns/AuthShell'
import { FormField } from '@/shared/ui/patterns/FormField'
import { useAppMessage } from '@/shared/ui/useAppMessage'

const initialErrors = {
  username: '',
  password: '',
  captchaCode: '',
}

function toCaptchaDataUrl(imageBase64: string) {
  return imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const message = useAppMessage()
  const [form, setForm] = useState({ username: '', password: '', captchaCode: '' })
  const [errors, setErrors] = useState(initialErrors)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaLoadFailed, setCaptchaLoadFailed] = useState(false)
  const hasInitializedCaptcha = useRef(false)

  const redirectTarget = useMemo(() => {
    const state = location.state as { from?: { pathname?: string; search?: string; hash?: string } | string } | null
    if (!state?.from) {
      return '/projects'
    }

    if (typeof state.from === 'string') {
      return state.from
    }

    return `${state.from.pathname ?? '/projects'}${state.from.search ?? ''}${state.from.hash ?? ''}`
  }, [location.state])

  const captchaMutation = useMutation({
    mutationKey: ['auth', 'captcha', 'login'],
    mutationFn: () => authApi.createCaptcha('LOGIN'),
    onMutate: () => {
      setCaptchaLoadFailed(false)
    },
    onSuccess: (data) => {
      setCaptchaId(data.captchaId)
      setCaptchaImage(toCaptchaDataUrl(data.imageBase64))
      setCaptchaLoadFailed(false)
      setForm((current) => ({ ...current, captchaCode: '' }))
    },
    onError: (error) => {
      setCaptchaId('')
      setCaptchaImage('')
      setCaptchaLoadFailed(true)
      message.error(error instanceof Error ? error.message : '验证码加载失败')
    },
  })

  const loginMutation = useMutation({
    mutationFn: () =>
      authApi.login({
        username: form.username,
        password: form.password,
        captchaId,
        captchaCode: form.captchaCode,
      }),
    onSuccess: (session) => {
      login(session)
      message.success('登录成功')
      navigate(redirectTarget, { replace: true })
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : '登录失败')
      captchaMutation.mutate()
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true })
      return
    }

    if (hasInitializedCaptcha.current) {
      return
    }

    hasInitializedCaptcha.current = true
    captchaMutation.mutate()
  }, [captchaMutation, isAuthenticated, navigate])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (field in errors) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const validateRequiredFields = () => {
    const nextErrors = { ...initialErrors }

    if (!form.username.trim()) {
      nextErrors.username = '此项为必填项'
    }
    if (!form.password.trim()) {
      nextErrors.password = '此项为必填项'
    }
    if (!form.captchaCode.trim()) {
      nextErrors.captchaCode = '此项为必填项'
    } else if (!captchaId) {
      nextErrors.captchaCode = '请先加载图形验证码'
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  return (
    <AuthShell
      description="使用已实现的后端登录接口联调，登录流程需要图形验证码。"
      footer={
        <>
          还没有账号？{' '}
          <Link className="font-semibold text-primary" to="/register">
            前往注册
          </Link>
        </>
      }
      title="登录 StoryForge"
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          const valid = validateRequiredFields()
          if (!valid) {
            message.error('请完整填写用户名、密码和图形验证码')
            return
          }
          loginMutation.mutate()
        }}
      >
        <FormField error={errors.username} label="用户名" required>
          <Input
            autoComplete="username"
            onChange={(event) => updateField('username', event.target.value)}
            placeholder="请输入用户名"
            value={form.username}
          />
        </FormField>

        <FormField error={errors.password} label="密码" required>
          <Input
            autoComplete="current-password"
            onChange={(event) => updateField('password', event.target.value)}
            placeholder="请输入密码"
            type="password"
            value={form.password}
          />
        </FormField>

        <FormField error={errors.captchaCode} label="图形验证码" required>
          <Input
            autoComplete="off"
            onChange={(event) => updateField('captchaCode', event.target.value)}
            placeholder="请输入验证码"
            value={form.captchaCode}
          />
        </FormField>

        <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-border bg-surface px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-border-strong sm:flex-row sm:items-center sm:justify-between">
          {captchaImage ? (
            <button className="text-left outline-none rounded focus-visible:ring-2 focus-visible:ring-primary" onClick={() => captchaMutation.mutate()} title="点击图片刷新验证码" type="button">
              <img
                alt="登录验证码"
                className="h-[50px] w-36 cursor-pointer rounded-md border border-border/60 object-cover"
                src={captchaImage}
              />
            </button>
          ) : captchaLoadFailed ? (
            <button
              className="grid h-[50px] w-36 place-items-center rounded-md border border-dashed border-border text-left text-[13px] text-text-muted transition-colors hover:border-primary/50 hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => captchaMutation.mutate()}
              type="button"
            >
              加载失败，点击重试
            </button>
          ) : (
            <div className="grid h-[50px] w-36 place-items-center rounded-md border border-dashed border-border text-[13px] text-text-subtle">
              加载中
            </div>
          )}
          <span className="text-[13px] font-medium text-text-subtle">点击图片更新</span>
        </div>

        <Button block loading={loginMutation.isPending} size="lg" type="submit" variant="primary">
          登录工作台
        </Button>
      </form>
    </AuthShell>
  )
}
