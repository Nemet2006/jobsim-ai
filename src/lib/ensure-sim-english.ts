import type { Locale } from '@/i18n/config'
import { hasEnglishContent, localizeSimulation, type LocalizableSim } from '@/lib/localize-simulation'
import {
  mergeEnglishIntoQuestions,
  translateSimulationToEnglish,
} from '@/lib/translate-simulation'
import { createAdminClient } from '@/lib/premium'
import type { Json } from '@/types/database'
import type { Question } from '@/types'

export async function localizeOrTranslateSimulation(
  sim: LocalizableSim & { id?: string },
  locale: Locale,
): Promise<{ title: string; description: string; role_type: string; questions: Question[] }> {
  const localized = localizeSimulation(sim, locale)
  if (locale !== 'en' || hasEnglishContent(sim) || !sim.id) {
    return localized
  }

  const translated = await translateSimulationToEnglish({
    title: sim.title,
    description: sim.description,
    role_type: sim.role_type,
    questions: localized.questions,
  })
  if (!translated) {
    return localized
  }

  const merged = mergeEnglishIntoQuestions(sim.questions, translated)
  try {
    const admin = createAdminClient()
    await admin.from('simulations').update({ questions: merged as unknown as Json }).eq('id', sim.id)
  } catch (err) {
    console.warn('Could not persist simulation EN overlay:', err)
  }

  return localizeSimulation({ ...sim, questions: merged }, 'en')
}
