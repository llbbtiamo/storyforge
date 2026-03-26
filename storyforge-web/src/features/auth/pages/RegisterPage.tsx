import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { authApi } from '@/shared/api/services'
import { useAuth } from '@/shared/auth/useAuth'
import { Button } from '@/shared/ui/primitives/Button'
import { Input } from '@/shared/ui/primitives/Input'
import { AuthShell } from '@/shared/ui/patterns/AuthShell'
import { FormField } from '@/shared/ui/patterns/FormField'
import { useAppMessage } from '@/shared/ui/useAppMessage'

const initialErrors = {
  username: '',
  email: '',
  password: '',
  captchaCode: '',
  emailVerificationCode: '',
}

function toCaptchaDataUrl(imageBase64: string) {
  return imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const message = useAppMessage()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    nickname: '',
    emailVerificationCode: '',
    captchaCode: '',
  })
  const [errors, setErrors] = useState(initialErrors)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [emailCodeHint, setEmailCodeHint] = useState('开发环境默认固定验证码为 123456，可在 application-dev.yml 中修改。')
  const [emailCodeCountdown, setEmailCodeCountdown] = useState(0)
  const hasInitializedCaptcha = useRef(false)

  const captchaMutation = useMutation({
    mutationKey: ['auth', 'captcha', 'register'],
    mutationFn: () => authApi.createCaptcha('REGISTER_EMAIL'),
    onSuccess: (data) => {
      setCaptchaId(data.captchaId)
      setCaptchaImage(toCaptchaDataUrl(data.imageBase64))
      setForm((current) => ({ ...current, captchaCode: '' }))
      setErrors((current) => ({ ...current, captchaCode: '' }))
    },
    onError: (error) => message.error(error instanceof Error ? error.message : '验证码加载失败'),
  })

  const emailCodeMutation = useMutation({
    mutationFn: () =>
      authApi.sendRegisterEmailCode({
        email: form.email,
        captchaId,
        captchaCode: form.captchaCode,
      }),
    onSuccess: (data) => {
      setEmailCodeCountdown(data.resendAfterSeconds)
      setEmailCodeHint(`邮箱验证码已发送，${data.resendAfterSeconds} 秒后可重新发送。有效期 ${data.expireSeconds} 秒。`)
      message.success('邮箱验证码已发送')
      captchaMutation.mutate()
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : '发送邮箱验证码失败')
      captchaMutation.mutate()
    },
  })

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        nickname: form.nickname || undefined,
        emailVerificationCode: form.emailVerificationCode,
      }),
    onSuccess: (session) => {
      login(session)
      message.success('注册成功，已自动登录')
      navigate('/projects', { replace: true })
    },
    onError: (error) => message.error(error instanceof Error ? error.message : '注册失败'),
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

  useEffect(() => {
    if (emailCodeCountdown <= 0) {
      return
    }

    const timer = window.setTimeout(() => {
      setEmailCodeCountdown((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [emailCodeCountdown])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (field in errors) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const validateRequiredFields = (fields: Array<keyof typeof errors>) => {
    const nextErrors = { ...initialErrors }

    fields.forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = '此项为必填项'
      }
    })

    if (fields.includes('captchaCode') && !captchaId) {
      nextErrors.captchaCode = '请先加载图形验证码'
    }

    setErrors((current) => ({ ...current, ...nextErrors }))
    return !fields.some((field) => nextErrors[field])
  }

  const handleSendEmailCode = () => {
    if (emailCodeCountdown > 0) {
      return
    }

    const valid = validateRequiredFields(['email', 'captchaCode'])
    if (!valid) {
      message.error('请先填写邮箱和图形验证码')
      return
    }

    emailCodeMutation.mutate()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const valid = validateRequiredFields(['username', 'email', 'password', 'captchaCode', 'emailVerificationCode'])
    if (!valid) {
      message.error('请完整填写注册所需字段')
      return
    }
    registerMutation.mutate()
  }

  return (
    <AuthShell
      description="填写基础信息完成注册，邮箱验证码与图形验证码都已接入当前后端流程。"
      footer={
        <>
          已有账号？{' '}
          <Link className="font-semibold text-primary" to="/login">
            返回登录
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField error={errors.username} label="用户名" required>
            <Input
              onChange={(event) => updateField('username', event.target.value)}
              placeholder="请输入用户名"
              value={form.username}
            />
          </FormField>
          <FormField label="昵称">
            <Input
              onChange={(event) => updateField('nickname', event.target.value)}
              placeholder="可选昵称"
              value={form.nickname}
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <FormField error={errors.email} label="邮箱" required>
            <Input
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="请输入邮箱"
              type="email"
              value={form.email}
            />
          </FormField>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              disabled={emailCodeCountdown > 0}
              loading={emailCodeMutation.isPending}
              onClick={handleSendEmailCode}
              variant="secondary"
            >
              {emailCodeCountdown > 0 ? `重新发送 (${emailCodeCountdown}s)` : '发送邮箱验证码'}
            </Button>
            {emailCodeCountdown > 0 ? <span className="text-sm text-text-muted">请等待倒计时结束后重试</span> : null}
          </div>
        </div>

        <FormField error={errors.password} label="密码" required>
          <Input
            onChange={(event) => updateField('password', event.target.value)}
            placeholder="请输入密码"
            type="password"
            value={form.password}
          />
        </FormField>

        <FormField error={errors.captchaCode} label="图形验证码" required>
          <Input
            onChange={(event) => updateField('captchaCode', event.target.value)}
            placeholder="请输入图形验证码"
            value={form.captchaCode}
          />
        </FormField>

        <div className="grid gap-3 rounded-[var(--radius-control)] border border-border bg-surface-subtle p-3 sm:grid-cols-[160px_1fr] sm:items-center">
          {captchaImage ? (
            <button className="text-left" onClick={() => captchaMutation.mutate()} title="点击图片刷新验证码" type="button">
              <img
                alt="注册验证码"
                className="h-[50px] w-40 cursor-pointer rounded-[var(--radius-control)] border border-border object-cover"
                src={captchaImage}
              />
            </button>
          ) : (
            <div className="grid h-[50px] w-40 place-items-center rounded-[var(--radius-control)] border border-dashed border-border text-sm text-text-subtle">
              加载中
            </div>
          )}
          <div className="grid gap-2 sm:justify-items-end">
            <span className="text-sm text-text-muted">点击图片刷新验证码</span>
            {captchaMutation.isPending ? <span className="text-sm text-text-subtle">验证码刷新中…</span> : null}
          </div>
        </div>

        <FormField error={errors.emailVerificationCode} hint={emailCodeHint} label="邮箱验证码" required>
          <Input
            onChange={(event) => updateField('emailVerificationCode', event.target.value)}
            placeholder="请输入邮箱验证码"
            value={form.emailVerificationCode}
          />
        </FormField>

        <Button block loading={registerMutation.isPending} size="lg" type="submit" variant="primary">
          注册并登录
        </Button>
      </form>
    </AuthShell>
  )
}
