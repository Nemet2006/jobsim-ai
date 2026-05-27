/**
 * JobSim AI — Real platform content seed
 * Run: node scripts/seed-real-content.mjs
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

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString()
}

function hoursAgo(n) {
  return new Date(Date.now() - n * 3600000).toISOString()
}

function sampleAnalysis(score, strengths, weaknesses) {
  return {
    score,
    strengths,
    weaknesses,
    advice: [
      'Real biznes nümunələri ilə cavablarınızı dəstəkləyin',
      'STAR metodu ilə strukturlaşdırılmış cavab verin',
      'Rəqəmsal alətlər və KPI-lar haqqında daha çox məlumat verin',
    ],
    detailed_feedback:
      'Cavablarınız ümumilikdə peşəkar yanaşma göstərir. Kontekstə uyğun düşüncə tərzi var, lakin bəzi tapşırqlarda rəqəmlərlə dəstəklənmiş konkret addımlar çatışmır. Növbəti mərhələdə real şirkət case-ləri üzərində praktika etməyinizi tövsiyə edirik.',
    skill_scores: {
      communication: Math.min(100, score + 5),
      problem_solving: score,
      analytical_thinking: Math.max(40, score - 3),
      structure: Math.min(100, score + 2),
      creativity: Math.max(45, score - 5),
    },
  }
}

async function ensureAuthUser(email, password, metadata) {
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === email)
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

async function upsertProfile(user, profile) {
  const { error } = await admin.from('users').upsert({
    id: user.id,
    email: user.email,
    ...profile,
  })
  if (error) throw new Error(`Profile ${user.email}: ${error.message}`)
  return user.id
}

async function ensureHR(company, email, fullName) {
  const user = await ensureAuthUser(email, PASSWORD, {
    full_name: fullName,
    role: 'hr',
    company_name: company,
  })
  return upsertProfile(user, {
    full_name: fullName,
    role: 'hr',
    company_name: company,
  })
}

async function ensureStudent(email, fullName, university) {
  const user = await ensureAuthUser(email, PASSWORD, {
    full_name: fullName,
    role: 'student',
    university,
  })
  return upsertProfile(user, {
    full_name: fullName,
    role: 'student',
    university,
    is_premium: false,
  })
}

async function ensureInstructor(email, fullName) {
  const user = await ensureAuthUser(email, PASSWORD, {
    full_name: fullName,
    role: 'courses',
  })
  return upsertProfile(user, {
    full_name: fullName,
    role: 'courses',
  })
}

function buildSimulations(hrMap) {
  return [
    // ── PREMIUM (köhnə tarix — free limitinə düşməsin) ──
    {
      title: 'Investment Banking Analyst',
      company: 'PASHA Bank',
      hrId: hrMap['PASHA Bank'],
      role_type: 'Investment Banking',
      difficulty: 'hard',
      duration_minutes: 45,
      created_at: daysAgo(30),
      description:
        'PASHA Bank-in Korporativ Maliyyə komandasında analitik rolunu simulyasiya edin. M&A qiymətləndirməsi, DCF modeli və investor pitch hazırlığı üzrə real tapşırıqlar.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'PASHA Bank 120 milyon AZN dəyərində regional logistika şirkətinin alınmasını qiymətləndirir. DCF modeli üçün hansı 5 əsas fərziyyəni seçərdiniz və niyə?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'WACC hesablanarkən kapital strukturunda equity cost artdıqda nə baş verir?',
          options: [
            'Endirim dərəcəsi artır, DCF dəyəri azalır',
            'Endirim dərəcəsi azalır, DCF dəyəri artır',
            'EBITDA dəyişmir, enterprise value artır',
            'Terminal value sıfırlanır',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Investor komitəsinə 3 dəqiqəlik pitch hazırlayın: niyə bu alış PASHA Bank üçün strategiyaya uyğundur? (Risk, sinergiya, exit)',
        },
        {
          id: 'q4',
          type: 'open_ended',
          question:
            'Due diligence zamanı hədəf şirkətin 18 ay ərzində 22% revenue decline göstərməsini tapdınız. Bu məlumatı valuation modelinə necə daxil edərdiniz?',
        },
      ],
    },
    {
      title: 'Audit & Assurance Associate',
      company: 'Deloitte Azerbaijan',
      hrId: hrMap['Deloitte Azerbaijan'],
      role_type: 'Audit',
      difficulty: 'hard',
      duration_minutes: 40,
      created_at: daysAgo(28),
      description:
        'Deloitte-un audit praktikasında junior associate rolunu yaşayın. Maliyyə hesabatlarının yoxlanması, internal control testləri və müştəriyə rəy vermə.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Neft-xidmət sektorunda fəaliyyət göstərən müştərinin revenue recognition siyasətini audit edərkən hansı 4 risk sahəsinə diqqət yetirərdiniz?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Materiality səviyyəsi audit planlaşdırmasında əsasən nəyə görə müəyyən edilir?',
          options: [
            'Səhvın maliyyə hesabatına təsirinin əhəmiyyəti',
            'Müştərinin illik mənfəətinin 100%-i',
            'Audit komandasının ölçüsü',
            'Öncəki ilin audit rəyi',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Inventory count zamanı 2.3 milyon AZN dəyərində uyğunsuzluq aşkar etdiniz. Audit manager-ə yazılı memo hazırlayın (problem, təsir, tövsiyə).',
        },
        {
          id: 'q4',
          type: 'open_ended',
          question:
            'ISA 315-ə uyğun olaraq, entity-level internal controls üçün hansı prosedurları tətbiq edərdiniz?',
        },
      ],
    },
    {
      title: 'Petroleum Engineering Graduate',
      company: 'SOCAR',
      hrId: hrMap['SOCAR'],
      role_type: 'Engineering',
      difficulty: 'hard',
      duration_minutes: 50,
      created_at: daysAgo(25),
      description:
        'SOCAR-dakı field engineer graduate proqramına hazırlıq. Hasilat optimallaşdırması, təhlükəsizlik protokolları və texniki hesabat yazma.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Gunashli yatağında gündəlik hasilat 4.2% azalıb. İlk 24 saat ərzində hansı diaqnostik addımları atardınız?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'H2S riski olan yataqda fərdi qorunma prioriteti nədir?',
          options: [
            'SCBA (Self-Contained Breathing Apparatus) + gas monitor',
            'Yalnız hard hat və safety shoes',
            'Yalnız evacuation plan',
            'Visual inspection kifayətdir',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Water cut 38%-dən 51%-ə qalxıb. Reservoir engineer-ə göndəriləcək qısa texniki hesabatın strukturunu yazın.',
        },
        {
          id: 'q4',
          type: 'open_ended',
          question:
            'Enerji səmərəliliyi layihəsi üçün ESP pump upgrade təklifini ROI baxımından necə əsaslandırardınız?',
        },
      ],
    },
    {
      title: 'Network Operations Intern',
      company: 'Bakcell',
      hrId: hrMap['Bakcell'],
      role_type: 'Telecom Operations',
      difficulty: 'medium',
      duration_minutes: 35,
      created_at: daysAgo(22),
      description:
        'Bakcell NOC komandasında intern rolunu simulyasiya edin. Şəbəkə performansı, incident response və müştəri təsirinin idarə edilməsi.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Bakı mərkəzində 4G latency 180ms-ə qalxıb, şikayətlər artır. Incident ticket açarkən hansı məlumatları daxil edərdiniz?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'SLA breach riski olduqda ilk prioritet nədir?',
          options: [
            'Critical service impact-i azaltmaq və root cause izolə etmək',
            'Yalnız müştəriyə üzr istəmək',
            'Ticket-i bağlamaq',
            'Marketing komandasını məlumatlandırmaq',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Təcili maintenance planlaşdırılmalıdır: affected region, estimated downtime və customer comms planını yazın.',
        },
      ],
    },
    {
      title: 'Corporate Banking Associate',
      company: 'ABB',
      hrId: hrMap['ABB'],
      role_type: 'Corporate Banking',
      difficulty: 'medium',
      duration_minutes: 35,
      created_at: daysAgo(20),
      description:
        'ABB Korporativ Bankçılıq departamentində SME kredit analizi, risk qiymətləndirməsi və müştəri münasibətləri.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            '12 milyon AZN illik dövriyyəsi olan istehsalat firması 3 milyon AZN kredit istəyir. Kredit komitəsinə hansı maliyyə göstəricilərini təqdim edərdiniz?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'DSCR (Debt Service Coverage Ratio) 1.1-dirsə, bu nə deməkdir?',
          options: [
            'Borc xidməti öhdəlikləri gəlirə yaxındır — risk yüksəkdir',
            'Şirkət borcsuzdur',
            'Kredit mütləq təsdiqlənməlidir',
            'Collateral tələb olunmur',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Müştəri cash flow-da mövsümi dalğalanma olduğunu deyir. Covenant strukturunu necə dizayn edərdiniz?',
        },
      ],
    },
    {
      title: 'Brand Marketing Intern',
      company: 'Coca-Cola İçecek',
      hrId: hrMap['Coca-Cola İçecek'],
      role_type: 'Brand Marketing',
      difficulty: 'medium',
      duration_minutes: 30,
      created_at: daysAgo(18),
      description:
        'Coca-Cola İçecek Azerbaijan-da brend kampaniyası planlaşdırması, trade marketing və consumer insight analizi.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Yay mövsümü üçün "Coca-Cola Zero" share of throat artırma kampaniyası dizayn edin: target audience, channel mix, KPI.',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Brand health tracking-də "Top of Mind" göstəricisi nəyi ölçür?',
          options: [
            'İlk xatırlanan brend',
            'Son alınan məhsul',
            'Endirim faizi',
            'Distribusiya genişliyi',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Rəqib 20% endirim kampaniyasına start verib. Pricing reaksiya vermədən hansı non-price taktikalardan istifadə edərdiniz?',
        },
      ],
    },
    {
      title: 'Risk Management Analyst',
      company: 'Unibank',
      hrId: hrMap['Unibank'],
      role_type: 'Risk Management',
      difficulty: 'hard',
      duration_minutes: 40,
      created_at: daysAgo(15),
      description:
        'Unibank Risk departamentində kredit risk modelləşdirməsi, stress test və regulatory reporting.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Retail kredit portfelində 90+ gün gecikmə 2.8%-dən 4.1%-ə qalxıb. Risk komitəsinə hansı izah və action planı təqdim edərdiniz?',
        },
        {
          id: 'q2',
          type: 'open_ended',
          question:
            'Macro stress scenario: AZN 15% devalvasiya. Portfel risk exposure-u necə yenidən qiymətləndirərdiniz?',
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'Basel III capital adequacy nəyi ölçür?',
          options: [
            'Bankın kapitalının risky aktivlərə nisbəti',
            'Yalnız likvidlik ehtiyatı',
            'Marketing xərcləri',
            'ATM sayı',
          ],
          correct_option: 0,
        },
      ],
    },
    {
      title: 'Tax Consultant Intern',
      company: 'EY Azerbaijan',
      hrId: hrMap['EY Azerbaijan'],
      role_type: 'Tax Advisory',
      difficulty: 'medium',
      duration_minutes: 35,
      created_at: daysAgo(12),
      description:
        'EY Vergi məsləhətçiliyi komandasında korporativ vergi planlaşdırması və compliance tapşırıqları.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Multinasional müştəri transfer pricing sənədləşdirməsini yeniləmək istəyir. CIT risk-ləri hansılardır və hansı addımları atardınız?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Azərbaycanda VAT-in tipik standard rate-i hansıdır?',
          options: ['18%', '20%', '12%', '5%'],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Müştəri capital restructure planlayır. Vergi effektivliyi baxımından 3 alternativ strukturu müqayisə edin.',
        },
      ],
    },
    // ── FREEMIUM (ən yeni — pulsuz tier) ──
    {
      title: 'Digital Marketing Intern',
      company: 'Azercell',
      hrId: hrMap['Azercell'],
      role_type: 'Digital Marketing',
      difficulty: 'medium',
      duration_minutes: 30,
      created_at: hoursAgo(2),
      description:
        'Azercell-in rəqəmsal marketinq komandasında intern rolunu yaşayın. 5G kampaniyası, social media performance və customer journey optimallaşdırması.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Azercell 5G-ni gənclər seqmentinə tanıtmaq üçün TikTok + Instagram kampaniyası planlayın. 4 həftəlik content calendar strukturunu yazın.',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'CPI (Cost Per Install) app kampaniyalarında nə ölçülür?',
          options: [
            'Hər app yükləməsinin reklam xərci',
            'Gündəlik aktiv istifadəçi sayı',
            'Brutto revenue',
            'Churn rate',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Kampaniya CTR 0.9%-dən 0.4%-ə düşüb. A/B test planı hazırlayın: hipotez, variantlar, success metric.',
        },
        {
          id: 'q4',
          type: 'open_ended',
          question:
            'Influencer collab təklifi aldınız — 45K follower, engagement 1.2%. Brand safety və ROI baxımından qəbul/qərar vermə kriteriyalarınızı yazın.',
        },
      ],
    },
    {
      title: 'Retail Banking Trainee',
      company: 'Kapital Bank',
      hrId: hrMap['Kapital Bank'],
      role_type: 'Retail Banking',
      difficulty: 'easy',
      duration_minutes: 25,
      created_at: hoursAgo(1),
      description:
        'Kapital Bank filialında müştəri xidməti, cross-sell və KYC proseslərini öyrənin. Gündəlik filial əməliyyatlarının real simulyasiyası.',
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question:
            'Filiala gələn müştəri yeni salary card açmaq istəyir, eyni zamanda kiçik biznes hesabı haqqında soruşur. 5 addımlıq xidmət axınını təsvir edin.',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'KYC prosesində PEP (Politically Exposed Person) yoxlaması niyə vacibdir?',
          options: [
            'AML/CFT tələblərinə uyğunluq və risk azaldılması',
            'Marketing segmentasiyası',
            'Kredit limitinin avtomatik artırılması',
            'ATM xərcinin hesablanması',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question:
            'Müştəri mobil app-də kart bloklanması ilə bağlı narahatdır və emosional reaksiya göstərir. Empatik, professional cavab nümunəsi yazın.',
        },
        {
          id: 'q4',
          type: 'open_ended',
          question:
            'Filial KPI-ları: cross-sell rate, NPS, average handling time. Bu 3 metrikanı necə balanslaşdırardınız?',
        },
      ],
    },
  ]
}

async function main() {
  console.log('🌱 Real content seed başlayır...\n')

  // HR accounts — real companies
  const hrCompanies = [
    ['PASHA Bank', 'hr@pashabank.az', 'Leyla Həsənova — HR BP'],
    ['Azercell', 'hr@azercell.az', 'Rəşad Quliyev — Talent Acquisition'],
    ['Kapital Bank', 'hr@kapitalbank.az', 'Nigar Əliyeva — Graduate Programs'],
    ['Deloitte Azerbaijan', 'hr@deloitte.az', 'Tural Məmmədov — Campus Recruiting'],
    ['SOCAR', 'hr@socar.az', 'Elvin Rəhimov — Graduate Engineering'],
    ['Bakcell', 'hr@bakcell.az', 'Günay Səfərova — People & Culture'],
    ['ABB', 'hr@abb-bank.az', 'Orxan Cabbarov — Corporate HR'],
    ['Coca-Cola İçecek', 'hr@cocacola.az', 'Aysel Məmmədli — Early Careers'],
    ['Unibank', 'hr@unibank.az', 'Kamran Hüseynov — Risk HR Partner'],
    ['EY Azerbaijan', 'hr@ey.az', 'Ləman Qasımova — Campus Lead'],
  ]

  const hrMap = {}
  for (const [company, email, name] of hrCompanies) {
    hrMap[company] = await ensureHR(company, email, name)
    console.log(`✓ HR: ${company}`)
  }

  // Remove old generic simulations
  const oldTitles = [
    'SMM Intern Simulyasiyası',
    'Junior Data Analyst Simulyasiyası',
    'Sales Assistant Simulyasiyası',
  ]
  for (const title of oldTitles) {
    await admin.from('simulations').delete().eq('title', title)
  }

  // Insert simulations
  const simPayload = buildSimulations(hrMap)
  const insertedSims = []

  for (const sim of simPayload) {
    const { company, hrId, created_at, ...row } = sim
    const { data: existing } = await admin
      .from('simulations')
      .select('id')
      .eq('title', row.title)
      .eq('created_by', hrId)
      .maybeSingle()

    if (existing) {
      await admin.from('simulations').update({ ...row, is_published: true }).eq('id', existing.id)
      insertedSims.push({ id: existing.id, ...sim })
      console.log(`↻ Sim: ${company} — ${row.title}`)
    } else {
      const { data, error } = await admin
        .from('simulations')
        .insert({ ...row, created_by: hrId, is_published: true, created_at })
        .select('id')
        .single()
      if (error) throw error
      insertedSims.push({ id: data.id, ...sim })
      console.log(`✓ Sim: ${company} — ${row.title}`)
    }
  }

  // Course instructor — ADA Universiteti
  const instructorId = await ensureInstructor(
    'karyera@ada.edu.az',
    'Dr. Günel Abbasova — Karyera Mərkəzi'
  )
  console.log('✓ Instructor: ADA Universiteti')

  // Course group
  let groupId
  const groupName = 'Biznes Administrasiyası — Spring 2026'
  const { data: existingGroup } = await admin
    .from('course_groups')
    .select('id, join_code')
    .eq('instructor_id', instructorId)
    .eq('name', groupName)
    .maybeSingle()

  if (existingGroup) {
    groupId = existingGroup.id
    console.log(`↻ Qrup: ${groupName} (kod: ${existingGroup.join_code})`)
  } else {
    const { data: group, error } = await admin
      .from('course_groups')
      .insert({
        instructor_id: instructorId,
        name: groupName,
        description:
          'ADA Universiteti Karyera və Məşğulluq Mərkəzinin rəsmi qrupu. FinTech, bankçılıq və korporativ karyera simulyasiyaları.',
      })
      .select('id, join_code')
      .single()
    if (error) throw error
    groupId = group.id
    console.log(`✓ Qrup: ${groupName} (kod: ${group.join_code})`)
  }

  // Demo students
  const students = [
    ['leyla.mammadova@ada.edu.az', 'Leyla Məmmədova', 'ADA Universiteti'],
    ['orkhan.aliyev@unec.edu.az', 'Orxan Əliyev', 'UNEC'],
    ['aysel.hasanova@bdu.edu.az', 'Aysel Həsanova', 'Bakı Dövlət Universiteti'],
    ['tural.veliyev@khazar.org', 'Tural Vəliyev', 'Xəzər Universiteti'],
    ['nigar.karimova@aztu.edu.az', 'Nigar Kərimova', 'AzTU'],
    ['emil.babayev@mail.ru', 'Emil Babayev', 'ADNSU'],
    ['sabina.rahimli@ada.edu.az', 'Sabinə Rahimli', 'ADA Universiteti'],
    ['rauf.guliyev@unec.edu.az', 'Rauf Quliyev', 'UNEC'],
  ]

  const studentIds = []
  for (const [email, name, uni] of students) {
    studentIds.push(await ensureStudent(email, name, uni))
  }
  console.log(`✓ ${studentIds.length} demo tələbə`)

  // Add students to group
  for (const sid of studentIds) {
    await admin.from('group_members').upsert(
      { group_id: groupId, student_id: sid },
      { onConflict: 'group_id,student_id', ignoreDuplicates: true }
    )
  }

  // Assign sims to group (Azercell, Kapital, PASHA)
  const assignTitles = ['Digital Marketing Intern', 'Retail Banking Trainee', 'Investment Banking Analyst']
  const assignSims = insertedSims.filter((s) => assignTitles.includes(s.title))

  for (const sim of assignSims) {
    const { data: existingAssign } = await admin
      .from('group_sim_assignments')
      .select('id')
      .eq('group_id', groupId)
      .eq('simulation_id', sim.id)
      .maybeSingle()

    if (!existingAssign) {
      await admin.from('group_sim_assignments').insert({
        group_id: groupId,
        simulation_id: sim.id,
        instructor_id: instructorId,
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      })
    }
  }
  console.log('✓ Qrupa 3 simulyasiya təyin edildi')

  // Completed attempts — traction
  const attemptPlan = [
    { studentIdx: 0, simTitle: 'Digital Marketing Intern', score: 87, daysAgo: 3 },
    { studentIdx: 0, simTitle: 'Retail Banking Trainee', score: 91, daysAgo: 5 },
    { studentIdx: 1, simTitle: 'Investment Banking Analyst', score: 78, daysAgo: 4 },
    { studentIdx: 1, simTitle: 'Digital Marketing Intern', score: 82, daysAgo: 2 },
    { studentIdx: 2, simTitle: 'Retail Banking Trainee', score: 74, daysAgo: 6 },
    { studentIdx: 2, simTitle: 'Audit & Assurance Associate', score: 69, daysAgo: 8 },
    { studentIdx: 3, simTitle: 'Corporate Banking Associate', score: 85, daysAgo: 3 },
    { studentIdx: 3, simTitle: 'Digital Marketing Intern', score: 88, daysAgo: 1 },
    { studentIdx: 4, simTitle: 'Brand Marketing Intern', score: 76, daysAgo: 7 },
    { studentIdx: 4, simTitle: 'Retail Banking Trainee', score: 80, daysAgo: 4 },
    { studentIdx: 5, simTitle: 'Network Operations Intern', score: 72, daysAgo: 9 },
    { studentIdx: 5, simTitle: 'Digital Marketing Intern', score: 79, daysAgo: 2 },
    { studentIdx: 6, simTitle: 'Tax Consultant Intern', score: 83, daysAgo: 5 },
    { studentIdx: 6, simTitle: 'Retail Banking Trainee', score: 86, daysAgo: 3 },
    { studentIdx: 7, simTitle: 'Risk Management Analyst', score: 71, daysAgo: 10 },
    { studentIdx: 7, simTitle: 'Investment Banking Analyst', score: 84, daysAgo: 6 },
    { studentIdx: 0, simTitle: 'Brand Marketing Intern', score: 88, daysAgo: 11 },
    { studentIdx: 1, simTitle: 'Corporate Banking Associate', score: 77, daysAgo: 12 },
    { studentIdx: 3, simTitle: 'Petroleum Engineering Graduate', score: 68, daysAgo: 14 },
    { studentIdx: 5, simTitle: 'Retail Banking Trainee', score: 81, daysAgo: 2 },
  ]

  let attemptCount = 0
  for (const plan of attemptPlan) {
    const sim = insertedSims.find((s) => s.title === plan.simTitle)
    if (!sim) continue
    const studentId = studentIds[plan.studentIdx]

    const { data: existing } = await admin
      .from('simulation_attempts')
      .select('id')
      .eq('student_id', studentId)
      .eq('simulation_id', sim.id)
      .eq('status', 'completed')
      .maybeSingle()

    const analysis = sampleAnalysis(plan.score, [
      'Strukturlaşdırılmış və peşəkar cavab',
      'Real biznes kontekstini düzgün başa düşmə',
      'Kommunikasiya bacarığı güclüdür',
    ], [
      'Bəzi tapşırıqlarda rəqəmsal KPI çatışmır',
      'Risk analizi daha dərindən verilə bilər',
    ])

    const completedAt = daysAgo(plan.daysAgo)
    const startedAt = daysAgo(plan.daysAgo + 0.1)

    if (existing) {
      await admin.from('simulation_attempts').update({
        score: plan.score,
        ai_analysis: analysis,
        completed_at: completedAt,
      }).eq('id', existing.id)
    } else {
      await admin.from('simulation_attempts').insert({
        simulation_id: sim.id,
        student_id: studentId,
        status: 'completed',
        score: plan.score,
        ai_analysis: analysis,
        answers: { q1: 'Demo cavab — seed data' },
        started_at: startedAt,
        completed_at: completedAt,
        cheat_attempts: 0,
      })
      attemptCount++
    }
  }
  console.log(`✓ ${attemptCount} yeni tamamlanmış attempt (traction)`)

  // Skill passports for top students
  for (const idx of [0, 1, 3, 6]) {
    const sid = studentIds[idx]
    await admin.from('skill_passport').upsert({
      student_id: sid,
      skills: [
        { skill_name: 'Kommunikasiya', score: 85, level: 'Advanced' },
        { skill_name: 'Analitik düşüncə', score: 78, level: 'Advanced' },
        { skill_name: 'Problem həlli', score: 82, level: 'Advanced' },
        { skill_name: 'Strukturlaşdırma', score: 80, level: 'Advanced' },
      ],
      updated_at: new Date().toISOString(),
    })
  }

  // Shortlist — HR traction
  const pashaSim = insertedSims.find((s) => s.title === 'Investment Banking Analyst')
  const pashaHr = hrMap['PASHA Bank']
  if (pashaSim && pashaHr) {
    for (const idx of [1, 7]) {
      const sid = studentIds[idx]
      const { data: attempt } = await admin
        .from('simulation_attempts')
        .select('id')
        .eq('student_id', sid)
        .eq('simulation_id', pashaSim.id)
        .eq('status', 'completed')
        .maybeSingle()

      if (attempt) {
        await admin.from('shortlist').upsert(
          {
            hr_id: pashaHr,
            student_id: sid,
            simulation_id: pashaSim.id,
            attempt_id: attempt.id,
          },
          { onConflict: 'hr_id,attempt_id', ignoreDuplicates: true }
        )
      }
    }
    console.log('✓ PASHA Bank shortlist (2 namizəd)')
  }

  // Summary
  const { data: groupFinal } = await admin.from('course_groups').select('join_code').eq('id', groupId).single()

  console.log('\n══════════════════════════════════════')
  console.log('✅ Real content seed tamamlandı!')
  console.log('══════════════════════════════════════')
  console.log(`\n📚 Kurs hesabı:`)
  console.log(`   Email: karyera@ada.edu.az`)
  console.log(`   Şifrə: ${PASSWORD}`)
  console.log(`   Qrup: ${groupName}`)
  console.log(`   Join kod: ${groupFinal?.join_code}`)
  console.log(`\n🏢 ${insertedSims.length} simulyasiya (2 pulsuz, qalanı Premium)`)
  console.log(`👥 ${studentIds.length} demo tələbə + tamamlanmış attempt-lar`)
  console.log(`\n🔑 Bütün demo hesablar şifrəsi: ${PASSWORD}`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
