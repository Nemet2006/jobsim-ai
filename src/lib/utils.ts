import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('az-AZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getScoreColor(score: number): string {
  if (score <= 40) return 'text-danger'
  if (score <= 70) return 'text-gold-deep'
  return 'text-verdigris'
}

export function getScoreColorHex(score: number): string {
  if (score <= 40) return '#C4432E'
  if (score <= 70) return '#8F6A1F'
  return '#1E7A63'
}

export function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  const map = { easy: 'Introductory', medium: 'Intermediate', hard: 'Advanced' }
  return map[difficulty]
}

export function getDifficultyAz(difficulty: 'easy' | 'medium' | 'hard'): string {
  const map = { easy: 'Asan', medium: 'Orta', hard: 'Çətin' }
  return map[difficulty]
}

export function getDifficultyClass(difficulty: 'easy' | 'medium' | 'hard'): string {
  const map = {
    easy:   'pill-difficulty-intro',
    medium: 'pill-difficulty-inter',
    hard:   'pill-difficulty-adv',
  }
  return map[difficulty]
}
