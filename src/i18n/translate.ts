export type MessageTree = { [key: string]: string | MessageTree }
export type TFunction = (key: string, vars?: Record<string, string | number>) => string

export function translate(
  messages: MessageTree,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split('.')
  let current: string | MessageTree | undefined = messages
  for (const part of parts) {
    if (!current || typeof current === 'string') return key
    current = current[part]
  }
  if (typeof current !== 'string') return key
  if (!vars) return current
  return current.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] === undefined ? `{${name}}` : String(vars[name]),
  )
}
