/**
 * JobSim AI — HR panel demo data (namizədlər, shortlist, hesabatlar)
 *
 * Run:
 *   npm run seed:hr
 *   npm run seed:hr -- --email=hr@kapitalbank.az
 *   node --env-file=.env.local scripts/seed-hr-panel.mjs --all
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PASSWORD = 'JobSim2026!'

const args = process.argv.slice(2)
const emailArg = args.find((a) => a.startsWith('--email='))?.split('=')[1]
const fillAll = args.includes('--all') || !emailArg

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString()
}

function sampleAnalysis(score, role) {
  const tier =
    score >= 85 ? 'güclü' : score >= 70 ? 'yaxşı' : score >= 55 ? 'orta' : 'inkişaf edən'
  return {
    score,
    strengths: [
      `${role} kontekstində ${tier} strukturlaşdırılmış cavab`,
      'Kommunikasiya aydın və peşəkardır',
      'Problemə analitik yanaşma var',
      score >= 80 ? 'Real biznes nümunələri ilə dəstəkləyir' : 'Potensial yüksəkdir',
    ],
    weaknesses: [
      score >= 75 ? 'Bəzi KPI-lar rəqəmlərlə gücləndirilə bilər' : 'Konkret metrikalar çatışmır',
      score >= 70 ? 'Risk aspektləri daha dərindən verilə bilər' : 'Struktur bəzən zəifdir',
    ],
    advice: [
      'STAR metodu ilə cavabları strukturlaşdırın',
      'Şirkətin real case-ləri üzərində praktika edin',
      'Nəticələri rəqəmlərlə (KPI, ROI, %) göstərin',
    ],
    detailed_feedback: `Namizəd ${role} simulyasiyasında ${tier} performans göstərib. Cavablar ümumilikdə iş mühitinə uyğundur; növbəti mərhələdə case interview üçün uyğundur.`,
    skill_scores: {
      communication: Math.min(100, score + 4),
      problem_solving: score,
      analytical_thinking: Math.max(45, score - 2),
      structure: Math.min(100, score + 1),
      creativity: Math.max(40, score - 4),
    },
  }
}

async function ensureAuthUser(email, password, metadata) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (existing) return existing

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: metadata,
    email_confirm: true,
  })
  if (error) throw new Error(`Auth ${email}: ${error.message}`)
  return data.user
}

async function ensureStudent(email, fullName, university) {
  const user = await ensureAuthUser(email, PASSWORD, {
    full_name: fullName,
    role: 'student',
    university,
  })
  const { error } = await admin.from('users').upsert({
    id: user.id,
    email: user.email,
    full_name: fullName,
    role: 'student',
    university,
    is_premium: false,
  })
  if (error) throw error
  return user.id
}

const CANDIDATE_POOL = [
  ['leyla.mammadova@ada.edu.az', 'Leyla Məmmədova', 'ADA Universiteti'],
  ['orkhan.aliyev@unec.edu.az', 'Orxan Əliyev', 'UNEC'],
  ['aysel.hasanova@bdu.edu.az', 'Aysel Həsanova', 'Bakı Dövlət Universiteti'],
  ['tural.veliyev@khazar.org', 'Tural Vəliyev', 'Xəzər Universiteti'],
  ['nigar.karimova@aztu.edu.az', 'Nigar Kərimova', 'AzTU'],
  ['emil.babayev@adnsu.edu.az', 'Emil Babayev', 'ADNSU'],
  ['sabina.rahimli@ada.edu.az', 'Sabinə Rahimli', 'ADA Universiteti'],
  ['rauf.guliyev@unec.edu.az', 'Rauf Quliyev', 'UNEC'],
  ['gunel.safarova@bmu.edu.az', 'Günəl Səfərova', 'Bakı Mühəndislik Universiteti'],
  ['kamran.huseynli@aztu.edu.az', 'Kamran Hüseynli', 'AzTU'],
  ['laman.qasimova@ada.edu.az', 'Ləman Qasımova', 'ADA Universiteti'],
  ['elvin.rahimov@unec.edu.az', 'Elvin Rəhimov', 'UNEC'],
  ['deniz.aliyeva@khazar.org', 'Deniz Əliyeva', 'Xəzər Universiteti'],
  ['farid.musayev@bdu.edu.az', 'Farid Musayev', 'BDU'],
  ['zahra.karimli@ada.edu.az', 'Zahra Kərimli', 'ADA Universiteti'],
]

function defaultSimulations(companyName) {
  const co = companyName || 'Şirkət'
  return [
    {
      title: `${co} — Graduate Assessment`,
      role_type: 'Graduate Program',
      difficulty: 'medium',
      duration_minutes: 40,
      description: `${co} üçün graduate proqramına namizəd qiymətləndirmə simulyasiyası. Analitik düşüncə, kommunikasiya və real iş tapşırıqları.`,
      questions: [
        { id: 'q1', type: 'open_ended', question: 'Komandanızda prioritetlər toqquşur. Bu situasiyanı necə idarə edərdiniz?' },
        { id: 'q2', type: 'multiple_choice', question: 'Müştəri şikayətində ilk addım nə olmalıdır?', options: ['Dinləmək və problemi dəqiqləşdirmək', 'Dərhal endirim təklif etmək', 'Ticket bağlamaq', 'Satışa yönləndirmək'], correct_option: 0 },
        { id: 'q3', type: 'open_ended', question: 'Son 6 ayda öyrəndiyiniz ən dəyərli peşəkar bacarıq nədir və necə tətbiq etdiniz?' },
      ],
    },
    {
      title: `${co} — Case Interview`,
      role_type: 'Business Analyst',
      difficulty: 'hard',
      duration_minutes: 45,
      description: 'Korporativ case interview: bazar analizi, maliyyə məntiq və strukturlaşdırılmış təqdimat.',
      questions: [
        { id: 'q1', type: 'open_ended', question: 'Bazar payı 2 il ərzində 8% azalan məhsul xətti üçün root cause analizi aparın.' },
        { id: 'q2', type: 'open_ended', question: '3 addımlı action plan və gözlənilən KPI-ları yazın.' },
        { id: 'q3', type: 'code', question: 'Sadə Python/Excel məntiq ilə revenue forecast üçün pseudo-kod yazın.', code_language: 'python', placeholder: '# forecast logic' },
      ],
    },
    {
      title: `${co} — Kommunikasiya & Liderlik`,
      role_type: 'Team Lead',
      difficulty: 'easy',
      duration_minutes: 30,
      description: 'Komanda daxili kommunikasiya, stakeholder idarəetməsi və liderlik ssenariləri.',
      questions: [
        { id: 'q1', type: 'open_ended', question: 'Junior komanda üzvü deadline-ları qaçırır. 1:1 görüş üçün planınız nədir?' },
        { id: 'q2', type: 'file_upload', question: 'Qısa presentation outline (PDF/DOCX) yükləyin.', accepted_formats: 'pdf,docx' },
      ],
    },
  ]
}

async function ensureSimulations(hrId, companyName) {
  const { data: existing } = await admin
    .from('simulations')
    .select('id, title, role_type')
    .eq('created_by', hrId)
    .eq('is_published', true)

  if ((existing || []).length >= 2) {
    return existing || []
  }

  const created = [...(existing || [])]
  for (const sim of defaultSimulations(companyName)) {
    const { data: found } = await admin
      .from('simulations')
      .select('id, title, role_type')
      .eq('created_by', hrId)
      .eq('title', sim.title)
      .maybeSingle()

    if (found) {
      await admin.from('simulations').update({ ...sim, is_published: true }).eq('id', found.id)
      created.push(found)
      continue
    }

    const { data, error } = await admin
      .from('simulations')
      .insert({ ...sim, created_by: hrId, is_published: true, created_at: daysAgo(14) })
      .select('id, title, role_type')
      .single()
    if (error) throw error
    created.push(data)
  }

  return created
}

async function seedAttemptsForHr(hrId, simulations, studentIds) {
  const plans = []
  const scores = [92, 88, 86, 84, 81, 79, 76, 74, 71, 68, 65, 83, 90, 77, 72, 69, 87, 80, 75, 73]
  let day = 1

  for (const sim of simulations) {
    const picks = studentIds.slice(0, 7)
    for (let i = 0; i < picks.length; i++) {
      const studentId = picks[(i + simulations.indexOf(sim)) % picks.length]
      const score = scores[(plans.length + i) % scores.length]
      plans.push({
        simulation_id: sim.id,
        student_id: studentId,
        score,
        role: sim.role_type,
        daysAgo: day++,
      })
    }
  }

  let created = 0
  let updated = 0
  const attemptIds = []

  for (const plan of plans) {
    const { data: existing } = await admin
      .from('simulation_attempts')
      .select('id')
      .eq('student_id', plan.student_id)
      .eq('simulation_id', plan.simulation_id)
      .eq('status', 'completed')
      .maybeSingle()

    const analysis = sampleAnalysis(plan.score, plan.role)
    const completedAt = daysAgo(plan.daysAgo)
    const startedAt = daysAgo(plan.daysAgo + 0.05)

    if (existing) {
      await admin.from('simulation_attempts').update({
        score: plan.score,
        ai_analysis: analysis,
        completed_at: completedAt,
        status: 'completed',
      }).eq('id', existing.id)
      attemptIds.push({ id: existing.id, ...plan })
      updated++
    } else {
      const { data, error } = await admin
        .from('simulation_attempts')
        .insert({
          simulation_id: plan.simulation_id,
          student_id: plan.student_id,
          status: 'completed',
          score: plan.score,
          ai_analysis: analysis,
          answers: { q1: 'Demo HR seed cavabı' },
          started_at: startedAt,
          completed_at: completedAt,
          cheat_attempts: 0,
        })
        .select('id')
        .single()
      if (error) throw error
      attemptIds.push({ id: data.id, ...plan })
      created++
    }
  }

  return { created, updated, attemptIds }
}

async function seedShortlist(hrId, attemptRows) {
  const top = [...attemptRows].sort((a, b) => b.score - a.score).slice(0, 6)
  let count = 0

  for (const row of top) {
    const { error } = await admin.from('shortlist').upsert(
      {
        hr_id: hrId,
        student_id: row.student_id,
        simulation_id: row.simulation_id,
        attempt_id: row.id,
        added_at: daysAgo(Math.max(1, row.daysAgo - 1)),
      },
      { onConflict: 'hr_id,attempt_id', ignoreDuplicates: false }
    )
    if (!error) count++
  }

  return count
}

async function seedHrPanel(hrUser) {
  const company = hrUser.company_name || hrUser.full_name || 'Şirkət'
  console.log(`\n── ${company} (${hrUser.email}) ──`)

  const simulations = await ensureSimulations(hrUser.id, company)
  console.log(`  Simulyasiya: ${simulations.length}`)

  const studentIds = []
  for (const [email, name, uni] of CANDIDATE_POOL) {
    studentIds.push(await ensureStudent(email, name, uni))
  }

  const { created, updated, attemptIds } = await seedAttemptsForHr(hrUser.id, simulations, studentIds)
  console.log(`  Attempt: +${created} yeni, ${updated} yeniləndi (cəmi ${attemptIds.length})`)

  const shortlistCount = await seedShortlist(hrUser.id, attemptIds)
  console.log(`  Shortlist: ${shortlistCount} namizəd`)

  const uniqueCandidates = new Set(attemptIds.map((a) => a.student_id)).size
  const avg = Math.round(attemptIds.reduce((s, a) => s + a.score, 0) / attemptIds.length)
  console.log(`  Dashboard: ${uniqueCandidates} unikal namizəd, orta bal ${avg}`)
}

async function main() {
  let hrUsers = []

  if (fillAll) {
    const { data, error } = await admin.from('users').select('id, email, full_name, company_name, role').eq('role', 'hr')
    if (error) throw error
    hrUsers = data || []
  } else {
    const { data, error } = await admin
      .from('users')
      .select('id, email, full_name, company_name, role')
      .eq('email', emailArg)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      console.error(`HR tapılmadı: ${emailArg}`)
      process.exit(1)
    }
    hrUsers = [data]
  }

  if (hrUsers.length === 0) {
    console.log('Heç bir HR hesabı yoxdur. Əvvəlcə HR qeydiyyatı edin və ya npm run seed:real işə salın.')
    process.exit(0)
  }

  for (const hr of hrUsers) {
    await seedHrPanel(hr)
  }

  console.log('\n══════════════════════════════════════')
  console.log('✅ HR panel seed tamamlandı!')
  console.log('══════════════════════════════════════')
  console.log('\nHR giriş nümunələri (şifrə: JobSim2026!):')
  for (const hr of hrUsers.slice(0, 5)) {
    console.log(`  • ${hr.email}`)
  }
  console.log('\nYoxlayın: /hr/dashboard → Namizədlər → Shortlist → Hesabatlar → Müqayisə')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
