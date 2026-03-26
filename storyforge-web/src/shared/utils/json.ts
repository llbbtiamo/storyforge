export function safeParseJson(value: string) {
  try {
    return {
      success: true as const,
      data: JSON.parse(value) as Record<string, unknown>,
    }
  } catch (error) {
    return {
      success: false as const,
      error,
    }
  }
}
