import type { Locale } from './config'
import az from './messages/az'
import en from './messages/en'
import { translate, type MessageTree, type TFunction } from './translate'

export function messagesFor(locale: Locale): MessageTree {
  return locale === 'en' ? en : az
}

export function makeT(locale: Locale): TFunction {
  const messages = messagesFor(locale)
  return (key, vars) => translate(messages, key, vars)
}
