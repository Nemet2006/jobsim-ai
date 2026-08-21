interface ChatJsonOptions {
  system: string
  user: string
  maxTokens?: number
  temperature?: number
}

interface ChatJsonSuccess {
  ok: true
  data: unknown
  model: string
}

interface ChatJsonFailure {
  ok: false
  error: string
}

export type ChatJsonResult = ChatJsonSuccess | ChatJsonFailure

/** OpenRouter — NVIDIA Nemotron 3.5 Lightning only. No fallbacks. */
export const OPENROUTER_MODEL = 'nvidia/nemotron-3.5-lightning'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfterMs(response: Response, bodyText: string): number {
  const header = response.headers.get('retry-after')
  if (header) {
    const seconds = Number(header)
    if (!Number.isNaN(seconds)) return Math.min(seconds * 1000, 8000)
  }

  try {
    const parsed = JSON.parse(bodyText) as {
      error?: { metadata?: { retry_after_seconds?: number } }
    }
    const seconds = parsed?.error?.metadata?.retry_after_seconds
    if (typeof seconds === 'number') return Math.min(seconds * 1000, 8000)
  } catch {
    // ignore
  }

  return 1500
}

export async function chatJson(options: ChatJsonOptions): Promise<ChatJsonResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'OPENROUTER_API_KEY konfiqurasiya edilməyib' }
  }

  const model = OPENROUTER_MODEL
  let lastError = 'OpenRouter cavab vermədi'

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://jobsim-ai.vercel.app',
        'X-Title': 'JobSim AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        max_tokens: options.maxTokens ?? 1500,
        temperature: options.temperature ?? 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    const bodyText = await response.text()

    if (response.status === 429 && attempt === 0) {
      await sleep(parseRetryAfterMs(response, bodyText))
      continue
    }

    if (!response.ok) {
      lastError = `${model}: ${response.status} ${bodyText.slice(0, 180)}`
      break
    }

    try {
      const payload = JSON.parse(bodyText) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const rawText = payload?.choices?.[0]?.message?.content || ''
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        lastError = `${model}: JSON tapılmadı`
        break
      }

      return { ok: true, data: JSON.parse(jsonMatch[0]), model }
    } catch {
      lastError = `${model}: JSON parse xətası`
      break
    }
  }

  return { ok: false, error: lastError }
}
