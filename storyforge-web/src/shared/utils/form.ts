export function parseJsonInput(value: string) {
  if (!value.trim()) {
    return {}
  }
  return JSON.parse(value) as Record<string, unknown>
}

export function stringifyJsonInput(value: unknown) {
  if (value == null) {
    return '{}'
  }
  return JSON.stringify(value, null, 2)
}

export function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function stringifyLines(items?: string[]) {
  return items?.join('\n') ?? ''
}
