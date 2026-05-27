/**
 * IT sahəsi simulyasiyaları — seed
 * Run: node --env-file=.env.local scripts/seed-it-simulations.mjs
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing env vars')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PASSWORD = 'JobSim2026!'

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString()
}

async function ensureAuthUser(email, metadata) {
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === email)
  if (existing) return existing
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    user_metadata: metadata,
    email_confirm: true,
  })
  if (error) throw new Error(`Auth ${email}: ${error.message}`)
  return data.user
}

async function ensureHR(company, email, fullName) {
  const user = await ensureAuthUser(email, { full_name: fullName, role: 'hr', company_name: company })
  const { error } = await admin.from('users').upsert({
    id: user.id,
    email,
    full_name: fullName,
    role: 'hr',
    company_name: company,
  })
  if (error) throw error
  return user.id
}

function sampleAnalysis(score) {
  return {
    score,
    strengths: ['Texniki terminologiya düzgün istifadə olunub', 'Problem həll yanaşması sistematiktir'],
    weaknesses: ['Edge case-lər tam nəzərə alınmayıb', 'Security best practice-lər daha detallı ola bilər'],
    advice: ['Production scenario-larda logging və monitoring əlavə edin', 'Code review checklist hazırlayın'],
    detailed_feedback: 'IT tapşırıqlarında ümumi yanaşma doğrudur. Real layihə təcrübəsi ilə gücləndirilə bilər.',
    skill_scores: {
      communication: score,
      problem_solving: score + 3,
      analytical_thinking: score - 2,
      structure: score + 2,
      creativity: score - 4,
    },
  }
}

const IT_SIMULATIONS = [
  {
    company: 'PASHA Technology',
    email: 'hr@pasha-tech.az',
    hrName: 'Ramin İsmayılov — Tech Talent',
    title: 'Junior Backend Developer',
    role_type: 'Software Engineering',
    difficulty: 'medium',
    duration_minutes: 40,
    created_at: daysAgo(11),
    description:
      'PASHA Technology backend komandasında Node.js + PostgreSQL stack üzrə real API dizaynı, database modelləşdirmə və code review tapşırıqları.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'Fintech API-də istifadəçi balans əməliyyatı (debit/credit) üçün REST endpoint dizayn edin. Idempotency, concurrency və double-spend riskini necə idarə edərdiniz?',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'PostgreSQL-də transaction isolation level READ COMMITTED əsasən hansı problemi həll edir?',
        options: [
          'Dirty read-lərin qarşısını alır',
          'Bütün phantom read-ləri tam aradan qaldırır',
          'Distributed lock əvəz edir',
          'Index rebuild edir',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Code review zamanı junior developer-in yazdığı N+1 query problemi olan endpoint-i necə refactor edərdiniz? Pseudocode və ya SQL nümunəsi verin.',
      },
      {
        id: 'q4',
        type: 'open_ended',
        question:
          'Production-da latency 800ms-ə qalxıb. Debugging planınızı yazın: hansı log/metric/tool-lardan istifadə edərsiniz?',
      },
    ],
  },
  {
    company: 'Azercell',
    email: 'hr@azercell.az',
    hrName: 'Rəşad Quliyev — Talent Acquisition',
    title: 'Mobile App Developer Intern',
    role_type: 'Mobile Development',
    difficulty: 'medium',
    duration_minutes: 35,
    created_at: daysAgo(10),
    description:
      'Azercell consumer app komandasında React Native ekran inkişafı, state management və API inteqrasiyası üzrə praktik tapşırıqlar.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'MyAzercell app-də balans yoxlama ekranı: loading, error, empty state-ləri necə dizayn edərdiniz? Component strukturunu təsvir edin.',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'React Native-də FlatList performansını yaxşılaşdırmaq üçün ən effektiv yanaşma hansıdır?',
        options: [
          'getItemLayout, keyExtractor, memoized renderItem',
          'ScrollView içində map() istifadə etmək',
          'Hər render-də yeni inline function yaratmaq',
          'Bütün state-i global context-ə qoymaq',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Push notification deep link ilə kampaniya səhifəsinə yönləndirmə implementasiyasını addım-addım izah edin (iOS/Android fərqləri qeyd edin).',
      },
    ],
  },
  {
    company: 'Kapital Bank',
    email: 'hr@kapitalbank.az',
    hrName: 'Nigar Əliyeva — Graduate Programs',
    title: 'DevOps Engineer Intern',
    role_type: 'DevOps & Cloud',
    difficulty: 'hard',
    duration_minutes: 45,
    created_at: daysAgo(9),
    description:
      'Kapital Bank IT infrastruktur komandasında CI/CD pipeline, container orchestration və incident response simulyasiyası.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'Next.js tətbiqi üçün GitHub Actions CI/CD pipeline dizayn edin: lint, test, build, staging deploy, production approval gate.',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Kubernetes-də rolling update zamanı zero-downtime üçün hansı konfiqurasiya vacibdir?',
        options: [
          'readinessProbe + maxUnavailable/maxSurge düzgün təyin',
          'Yalnız replicaCount=1',
          'imagePullPolicy=Never',
          'hostNetwork: true',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Production API error rate 5%-ə qalxıb. İlk 30 dəqiqəlik incident response runbook-unuzu yazın (kommunikasiya, rollback, postmortem).',
      },
      {
        id: 'q4',
        type: 'open_ended',
        question:
          'Secrets management: .env faylları repo-da saxlanmamalıdır. Bank mühitində secrets-i necə idarə edərdiniz?',
      },
    ],
  },
  {
    company: 'SOCAR',
    email: 'hr@socar.az',
    hrName: 'Elvin Rəhimov — Graduate Engineering',
    title: 'Cybersecurity SOC Analyst',
    role_type: 'Cybersecurity',
    difficulty: 'hard',
    duration_minutes: 40,
    created_at: daysAgo(8),
    description:
      'SOCAR IT Security Operations Center-da SIEM alert triage, phishing incident və vulnerability prioritization tapşırıqları.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'SIEM-dən gələn alert: 03:14-də admin hesabından 47 fərqli IP-dən failed login. Bu true positive, false positive, yoxsa targeted attack ola bilər? Addımlarınızı yazın.',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Phishing email-də ən etibarlı ilk yoxlama addımı hansıdır?',
        options: [
          'Sender domain, SPF/DKIM, link URL-lərini header-dan yoxlamaq',
          'Email-i forward edib həmkarlara soruşmaq',
          'Attachment-ı açıb antivirus gözləmək',
          'Reply edib göndərənin kim olduğunu soruşmaq',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Critical CVE public olub — affected sistem internal portal. CVSS 9.1. Patch 72 saat çəkəcək. Risk acceptance və temporary mitigation planınız nədir?',
      },
    ],
  },
  {
    company: 'Bakcell',
    email: 'hr@bakcell.az',
    hrName: 'Günay Səfərova — People & Culture',
    title: 'QA Automation Engineer',
    role_type: 'Quality Assurance',
    difficulty: 'medium',
    duration_minutes: 30,
    created_at: daysAgo(7),
    description:
      'Bakcell digital products QA komandasında test planı, automation strategy və regression testing ssenariləri.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'Yeni eSIM aktivləşdirmə flow-u üçün test planı hazırlayın: happy path, edge cases, negative tests (minimum 8 test case).',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'E2E testlərdə flaky test-in ən çox rast gəlinən səbəbi nədir?',
        options: [
          'Async timing və unstable selectors',
          'Test runner-in rəngi',
          'Çox test case olması',
          'Manual test sənədlərinin olmaması',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Playwright/Cypress ilə login → dashboard → logout flow automation yazmaq üçün hansı page object strukturundan istifadə edərdiniz?',
      },
    ],
  },
  {
    company: 'ABB',
    email: 'hr@abb-bank.az',
    hrName: 'Orxan Cabbarov — Corporate HR',
    title: 'Full Stack Developer',
    role_type: 'Full Stack Development',
    difficulty: 'medium',
    duration_minutes: 40,
    created_at: daysAgo(6),
    description:
      'ABB Digital komandasında React + API full stack feature delivery: auth, form validation, database schema və deployment.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'Kredit müraciəti formu: frontend validation + backend validation + audit log. Hər layer-də nə yoxlayardınız və niyə?',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'JWT access token + refresh token pattern-də refresh token harada saxlanmalıdır (web app)?',
        options: [
          'HttpOnly secure cookie (XSS riskini azaldır)',
          'localStorage (həmişə ən təhlükəsiz)',
          'URL query parameter',
          'sessionStorage + console.log',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Feature branch-dən production-a merge: PR review checklist-iniz nə olardı? (security, performance, tests, docs)',
      },
    ],
  },
  {
    company: 'Symmetrix',
    email: 'hr@symmetrix.az',
    hrName: 'Tural Hüseynli — Engineering Lead',
    title: 'Junior Software Engineer',
    role_type: 'Software Engineering',
    difficulty: 'easy',
    duration_minutes: 25,
    created_at: daysAgo(5),
    description:
      'Symmetrix (Bakı) proqram təminatı şirkətində junior developer onboarding: Git workflow, bug fix və code quality tapşırıqları.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'Git: feature branch yaradıb bug fix etdikdən sonra PR açmaq üçün hansı addımları izləyərdiniz? Merge conflict olarsa nə edərdiniz?',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'SOLID prinsiplərindən "Single Responsibility" nə deməkdir?',
        options: [
          'Hər class/modul yalnız bir məsuliyyət daşımalıdır',
          'Yalnız bir developer commit edə bilər',
          'Bir faylda yalnız bir function olmalıdır',
          'Database-də bir table olmalıdır',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Production bug: istifadəçilər filter düyməsi işləmir deyir. Bug report-dan fix-ə qədər prosesinizi təsvir edin.',
      },
    ],
  },
  {
    company: 'Ministry of Digital Development',
    email: 'hr@digital.gov.az',
    hrName: 'Səbinə Məmmədova — e-Gov Programs',
    title: 'IT Support Specialist',
    role_type: 'IT Support',
    difficulty: 'easy',
    duration_minutes: 20,
    created_at: daysAgo(4),
    description:
      'Dövlət digital xidmətlər platformasında IT support: ticket idarəetməsi, istifadəçi problemləri və SLA prioritetləşdirmə.',
    questions: [
      {
        id: 'q1',
        type: 'open_ended',
        question:
          'Vətəndaş "myGov portal-a daxil ola bilmirəm" deyir — telefon ilə. Troubleshooting addımlarınızı sıralayın.',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'ITIL-də P1 (Priority 1) incident adətən nə vaxt eskalasiya olunur?',
        options: [
          'Kritik biznes xidməti tam dayandıqda — dərhal',
          'Yalnız həftə sonu',
          '30 gün sonra',
          'Yalnız email gecikəndə',
        ],
        correct_option: 0,
      },
      {
        id: 'q3',
        type: 'open_ended',
        question:
          'Eyni gün 40+ eyni "şifrəni unutdum" ticket-i gəlir. Root cause analizi və uzunmüddətli həll təklifiniz nədir?',
      },
    ],
  },
]

async function upsertSimulation(sim) {
  const hrId = await ensureHR(sim.company, sim.email, sim.hrName)
  const { company, email, hrName, created_at, ...row } = sim

  const { data: existing } = await admin
    .from('simulations')
    .select('id')
    .eq('title', row.title)
    .eq('created_by', hrId)
    .maybeSingle()

  if (existing) {
    await admin.from('simulations').update({ ...row, is_published: true }).eq('id', existing.id)
    return { id: existing.id, ...sim, hrId }
  }

  const { data, error } = await admin
    .from('simulations')
    .insert({ ...row, created_by: hrId, is_published: true, created_at })
    .select('id')
    .single()
  if (error) throw error
  return { id: data.id, ...sim, hrId }
}

async function main() {
  console.log('💻 IT simulyasiyaları əlavə edilir...\n')

  const inserted = []
  for (const sim of IT_SIMULATIONS) {
    const row = await upsertSimulation(sim)
    inserted.push(row)
    console.log(`✓ ${sim.company} — ${sim.title}`)
  }

  // Assign IT sims to ADA course group
  const { data: instructor } = await admin
    .from('users')
    .select('id')
    .eq('email', 'karyera@ada.edu.az')
    .maybeSingle()

  if (instructor) {
    const { data: group } = await admin
      .from('course_groups')
      .select('id')
      .eq('instructor_id', instructor.id)
      .eq('name', 'Biznes Administrasiyası — Spring 2026')
      .maybeSingle()

    if (group) {
      const assignTitles = ['Junior Backend Developer', 'DevOps Engineer Intern', 'Junior Software Engineer']
      for (const sim of inserted.filter((s) => assignTitles.includes(s.title))) {
        const { data: ex } = await admin
          .from('group_sim_assignments')
          .select('id')
          .eq('group_id', group.id)
          .eq('simulation_id', sim.id)
          .maybeSingle()
        if (!ex) {
          await admin.from('group_sim_assignments').insert({
            group_id: group.id,
            simulation_id: sim.id,
            instructor_id: instructor.id,
            deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
          })
        }
      }
      console.log('\n✓ ADA qrupuna 3 IT simulyasiya təyin edildi')
    }
  }

  // Demo attempts for traction
  const { data: students } = await admin
    .from('users')
    .select('id')
    .eq('role', 'student')
    .limit(5)

  const attemptPlans = [
    { studentIdx: 0, title: 'Junior Backend Developer', score: 84 },
    { studentIdx: 1, title: 'Mobile App Developer Intern', score: 79 },
    { studentIdx: 2, title: 'DevOps Engineer Intern', score: 71 },
    { studentIdx: 3, title: 'Cybersecurity SOC Analyst', score: 88 },
    { studentIdx: 4, title: 'QA Automation Engineer', score: 76 },
    { studentIdx: 0, title: 'Full Stack Developer', score: 82 },
    { studentIdx: 1, title: 'Junior Software Engineer', score: 90 },
  ]

  let newAttempts = 0
  for (const plan of attemptPlans) {
    const sim = inserted.find((s) => s.title === plan.title)
    const student = students?.[plan.studentIdx]
    if (!sim || !student) continue

    const { data: ex } = await admin
      .from('simulation_attempts')
      .select('id')
      .eq('student_id', student.id)
      .eq('simulation_id', sim.id)
      .eq('status', 'completed')
      .maybeSingle()

    if (!ex) {
      await admin.from('simulation_attempts').insert({
        simulation_id: sim.id,
        student_id: student.id,
        status: 'completed',
        score: plan.score,
        ai_analysis: sampleAnalysis(plan.score),
        answers: { q1: 'IT demo cavab' },
        started_at: daysAgo(2),
        completed_at: daysAgo(2),
        cheat_attempts: 0,
      })
      newAttempts++
    }
  }

  console.log(`✓ ${newAttempts} IT attempt (traction)`)
  console.log(`\n✅ Cəmi ${inserted.length} IT simulyasiya hazırdır (Premium tier)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
