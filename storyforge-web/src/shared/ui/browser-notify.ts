import { getErrorMessage } from '@/shared/utils/error'
import type { AppMessageApi } from '@/shared/ui/message-context'

let browserNotifyApi: AppMessageApi | null = null

export function setBrowserNotifyApi(api: AppMessageApi | null) {
  browserNotifyApi = api
}

export function notifyError(error: unknown) {
  const text = getErrorMessage(error)
  browserNotifyApi?.error(text)
}

export function notifySuccess(text: string) {
  browserNotifyApi?.success(text)
}

export function notifyInfo(text: string) {
  browserNotifyApi?.info(text)
}
