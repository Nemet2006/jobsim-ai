/**
 * IT simulyasiyalarına çoxlu tapşırıq (kod + fayl) əlavə et
 * node --env-file=.env.local scripts/seed-expand-tasks.mjs
 */
import { createClient } from '@supabase/supabase-js'

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const EXPANDED = {
  'Junior Backend Developer': {
    duration_minutes: 55,
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question: 'Fintech API-də istifadəçi balans əməliyyatı (debit/credit) üçün REST endpoint dizayn edin. Idempotency və double-spend riskini necə idarə edərdiniz?',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'PostgreSQL-də transaction isolation level READ COMMITTED əsasən nəyi həll edir?',
        options: ['Dirty read-lərin qarşısını alır', 'Phantom read-ləri tam aradan qaldırır', 'Distributed lock əvəz edir', 'Index rebuild edir'],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'code',
        code_language: 'JavaScript',
        question: 'Aşağıdakı funksiyanı tamamlayın: `transferFunds(fromId, toId, amount)` — balans kifayət deyilsə xəta atsın, atomic transaction olsun.',
        placeholder: 'async function transferFunds(fromId, toId, amount) {\n  // Kodunuz...\n}',
      },
      {
        id: 'q4',
        type: 'code',
        code_language: 'SQL',
        question: 'Son 30 gündə 1000 AZN-dən çox transfer edən istifadəçilərin siyahısını qaytaran SQL sorğusu yazın.',
        placeholder: 'SELECT ...',
      },
      {
        id: 'q5',
        type: 'open_ended',
        question: 'Production-da latency 800ms-ə qalxıb. Debugging planınız: hansı log, metric və tool-lardan istifadə edərsiniz?',
      },
      {
        id: 'q6',
        type: 'file_upload',
        question: 'API Design Document (ADD) hazırlayın və yükləyin.',
        instructions: 'Endpoint-lər, request/response schema, error kodları və auth axını daxil olmaqla. PDF və ya DOCX formatında.',
      },
      {
        id: 'q7',
        type: 'multiple_choice',
        question: 'Redis cache invalidation strategiyası üçün write-through vs cache-aside — hansı halda hansını seçərdiniz?',
        options: [
          'Cache-aside: oxuma çox, yazma az; Write-through: yazma dərhal cache-ə sync olmalıdır',
          'Həmişə yalnız write-through',
          'Redis heç vaxt cache üçün istifadə olunmur',
          'Cache invalidation lazım deyil',
        ],
        correct_option: 0,
      },
      {
        id: 'q8',
        type: 'file_upload',
        question: 'Post-incident report: N+1 query bug fix-dən sonra performans yaxşılaşması barədə qısa hesabat.',
        instructions: 'Problem, root cause, həll, nəticə (before/after latency). PDF, DOCX və ya PPTX.',
      },
    ],
  },
  'DevOps Engineer Intern': {
    duration_minutes: 50,
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question: 'Next.js tətbiqi üçün GitHub Actions CI/CD pipeline dizayn edin: lint, test, build, staging, production approval.',
      },
      {
        id: 'q2',
        type: 'code',
        code_language: 'YAML',
        question: 'GitHub Actions workflow snippet yazın: Node 20, npm ci, npm test, npm run build addımları.',
        placeholder: 'name: CI\non: [push]\njobs:\n  build:\n    ...',
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        question: 'Kubernetes rolling update zero-downtime üçün vacib konfiqurasiya?',
        options: ['readinessProbe + maxUnavailable/maxSurge', 'replicaCount=1', 'hostNetwork: true', 'imagePullPolicy=Never'],
        correct_option: 0,
      },
      {
        id: 'q4',
        type: 'open_ended',
        question: 'Production API error rate 5%-ə qalxıb. İlk 30 dəqiqəlik incident response runbook yazın.',
      },
      {
        id: 'q5',
        type: 'code',
        code_language: 'Bash',
        question: 'Dockerfile yazın: multi-stage build, Node 20 Alpine, production dependencies only, non-root user.',
        placeholder: 'FROM node:20-alpine AS builder\n...',
      },
      {
        id: 'q6',
        type: 'file_upload',
        question: 'Incident postmortem hesabatını yükləyin (son simulyasiya ssenarisinə uyğun).',
        instructions: 'Timeline, impact, root cause, action items. PDF və ya DOCX.',
      },
      {
        id: 'q7',
        type: 'file_upload',
        question: 'Infrastructure diagram (architecture) faylını yükləyin.',
        instructions: 'CI/CD axını, staging/prod mühitləri, monitoring. PNG, PDF və ya PPTX.',
      },
    ],
  },
  'Full Stack Developer': {
    duration_minutes: 50,
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question: 'Kredit müraciəti formu: frontend + backend validation + audit log. Hər layer-də nə yoxlayardınız?',
      },
      {
        id: 'q2',
        type: 'code',
        code_language: 'TypeScript',
        question: 'React hook yazın: `useDebouncedValue(value, delay)` — API axtarış input-u üçün.',
        placeholder: 'export function useDebouncedValue<T>(value: T, delay: number) {\n  ...\n}',
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        question: 'JWT refresh token web app-də harada saxlanmalıdır?',
        options: ['HttpOnly secure cookie', 'localStorage', 'URL query', 'sessionStorage'],
        correct_option: 0,
      },
      {
        id: 'q4',
        type: 'code',
        code_language: 'TypeScript',
        question: 'Next.js API route: POST /api/applications — body validate, Supabase insert, error handling.',
        placeholder: 'export async function POST(req: Request) { ... }',
      },
      {
        id: 'q5',
        type: 'open_ended',
        question: 'PR review checklist-iniz nə olardı? (security, performance, tests, docs)',
      },
      {
        id: 'q6',
        type: 'file_upload',
        question: 'Feature technical spec sənədini yükləyin.',
        instructions: 'User story, API contract, DB schema dəyişiklikləri. DOCX və ya PDF.',
      },
    ],
  },
}

async function main() {
  for (const [title, payload] of Object.entries(EXPANDED)) {
    const { data: sims } = await admin.from('simulations').select('id').eq('title', title)
    if (!sims?.length) {
      console.log('⊘ tapılmadı:', title)
      continue
    }
    for (const sim of sims) {
      await admin.from('simulations').update({
        questions: payload.questions,
        duration_minutes: payload.duration_minutes,
      }).eq('id', sim.id)
      console.log(`✓ ${title} → ${payload.questions.length} tapşırıq`)
    }
  }
  console.log('\n✅ Tapşırıqlar genişləndirildi')
}

main().catch(console.error)
