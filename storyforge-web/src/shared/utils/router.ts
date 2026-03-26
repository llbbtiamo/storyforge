import { useParams } from 'react-router-dom'

export function useRequiredNumberParam(paramName: string) {
  const params = useParams()
  const value = params[paramName]

  if (!value) {
    throw new Error(`Missing route param: ${paramName}`)
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid route param: ${paramName}`)
  }

  return parsed
}
