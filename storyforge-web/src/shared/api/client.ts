import axios, { AxiosError } from 'axios'

import type { ApiResponse, AuthSession } from '@/shared/api/types'
import { clearStoredSession, readStoredSession, writeStoredSession } from '@/shared/auth/storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const FINGERPRINT_KEY = 'storyforge.web.fingerprint'

let accessToken: string | null = readStoredSession()?.accessToken ?? null
let refreshToken: string | null = readStoredSession()?.refreshToken ?? null
let onUnauthorized: (() => void) | null = null
let refreshPromise: Promise<string | null> | null = null

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function getAccessToken() {
  return accessToken
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function updateSession(session: AuthSession) {
  accessToken = session.accessToken
  refreshToken = session.refreshToken
  writeStoredSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  })
}

export function clearSession() {
  accessToken = null
  refreshToken = null
  clearStoredSession()
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  const fingerprint = ensureFingerprint()
  config.headers['X-Client-Fingerprint'] = fingerprint

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>
    if (payload && typeof payload.code === 'number' && payload.code !== 200) {
      const error = new Error(payload.message) as Error & { code?: number; status?: number }
      error.code = payload.code
      error.status = response.status
      throw error
    }
    return response
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true
      const nextToken = await refreshAccessToken()
      if (nextToken) {
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${nextToken}`
        return apiClient(originalRequest)
      }
    }

    const apiError = new Error(
      error.response?.data?.message ?? error.message ?? '请求失败',
    ) as Error & { code?: number; status?: number }
    apiError.code = error.response?.data?.code
    apiError.status = error.response?.status
    throw apiError
  },
)

async function refreshAccessToken() {
  if (!refreshToken) {
    handleUnauthorized()
    return null
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiResponse<AuthSession>>('/api/v1/auth/refresh', { refreshToken })
      .then((response) => {
        const session = response.data.data
        updateSession(session)
        return session.accessToken
      })
      .catch(() => {
        handleUnauthorized()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function ensureFingerprint() {
  const existing = window.localStorage.getItem(FINGERPRINT_KEY)
  if (existing) {
    return existing
  }

  const created = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  window.localStorage.setItem(FINGERPRINT_KEY, created)
  return created
}

function handleUnauthorized() {
  clearSession()
  onUnauthorized?.()
}
