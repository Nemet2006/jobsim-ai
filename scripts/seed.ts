import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🌱 Starting seed...')

  // Create HR user
  const { data: hrAuth } = await supabase.auth.admin.createUser({
    email: 'hr@pashabank.az',
    password: 'password123',
    user_metadata: { full_name: 'Pashabank HR', role: 'hr', company_name: 'Pashabank' },
    email_confirm: true,
  })

  // Create Student user
  const { data: studentAuth } = await supabase.auth.admin.createUser({
    email: 'student@test.az',
    password: 'password123',
    user_metadata: { full_name: 'Tələbə Test', role: 'student', university: 'Bakı Dövlət Universiteti' },
    email_confirm: true,
  })

  // Create Courses user
  const { data: coursesAuth } = await supabase.auth.admin.createUser({
    email: 'instructor@courses.az',
    password: 'password123',
    user_metadata: { full_name: 'Müəllim Test', role: 'courses' },
    email_confirm: true,
  })

  // Update HR user profile
  if (hrAuth?.user) {
    await supabase.from('users').upsert({
      id: hrAuth.user.id,
      email: 'hr@pashabank.az',
      full_name: 'Pashabank HR',
      role: 'hr',
      company_name: 'Pashabank',
    })
  }

  // Update Student user profile
  if (studentAuth?.user) {
    await supabase.from('users').upsert({
      id: studentAuth.user.id,
      email: 'student@test.az',
      full_name: 'Tələbə Test',
      role: 'student',
      university: 'Bakı Dövlət Universiteti',
    })
  }

  // Update Courses user profile
  if (coursesAuth?.user) {
    await supabase.from('users').upsert({
      id: coursesAuth.user.id,
      email: 'instructor@courses.az',
      full_name: 'Müəllim Test',
      role: 'courses',
    })
  }

  const hrId = hrAuth?.user?.id
  if (!hrId) {
    console.error('HR user not created')
    return
  }

  // Create simulations
  const simulations = [
    {
      title: 'SMM Intern Simulyasiyası',
      description: 'Bu simulyasiyada sosial media menecmenti üzrə bacarıqlarınız yoxlanılacaq. Brendin online varlığını idarə etmək, məzmun strategiyası hazırlamaq və analitika üzrə tapşırıqlar yerinə yetirəcəksiniz.',
      role_type: 'Marketing Intern',
      difficulty: 'medium',
      duration_minutes: 30,
      created_by: hrId,
      is_published: true,
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question: 'Bir brend üçün Instagram strategiyası hazırlayın. Həftəlik neçə post paylaşardınız və hansı məzmun növlərini istifadə edərdiniz?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Sosial media analitikasında "Engagement Rate" nədir?',
          options: [
            'İzləyici sayına görə bəyənmə və şərh faizi',
            'Profil ziyarətlərinin sayı',
            'Paylaşılan post sayı',
            'Reklam xərcləri',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question: 'Bir məhsulun viral marketinq kampaniyasını necə həyata keçirərdiniz? Konkret addımları izah edin.',
        },
        {
          id: 'q4',
          type: 'open_ended',
          question: 'Neqativ şərh və ya kriz situasiyasında brendin sosial mediada cavabını necə idarə edərdiniz?',
        },
      ],
    },
    {
      title: 'Junior Data Analyst Simulyasiyası',
      description: 'Məlumat analizi, SQL sorğuları və iş qərarlarını məlumatlarla əsaslandırma bacarıqlarınız yoxlanılacaq.',
      role_type: 'Data Analyst',
      difficulty: 'hard',
      duration_minutes: 45,
      created_by: hrId,
      is_published: true,
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question: 'Böyük bir e-ticarət şirkətinin satış məlumatlarını analiz etmək tapşırığınız var. Hansı göstəricilərə diqqət edərdiniz və niyə?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'SQL-də "GROUP BY" operatoru nə üçün istifadə olunur?',
          options: [
            'Nəticələri müəyyən sütuna görə qruplaşdırmaq üçün',
            'Məlumatları sıralamaq üçün',
            'Məlumatları filtirləmək üçün',
            'Cədvəlləri birləşdirmək üçün',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question: 'Bir şirkətin müştəri ayrılma (churn) nisbətini azaltmaq üçün hansı məlumat analizi yanaşmasını tətbiq edərdiniz?',
        },
        {
          id: 'q4',
          type: 'open_ended',
          question: 'Məlumatların vizuallaşdırılmasında hansı növ qrafikləri hansı hallarda istifadə edərdiniz? 3 nümunə verin.',
        },
        {
          id: 'q5',
          type: 'open_ended',
          question: 'A/B testi nədir və onu hansı biznes sualını cavablandırmaq üçün istifadə edərdiniz?',
        },
      ],
    },
    {
      title: 'Sales Assistant Simulyasiyası',
      description: 'Satış bacarıqları, müştəri ilə ünsiyyət və etirazların idarə edilməsi yoxlanılacaq.',
      role_type: 'Sales Assistant',
      difficulty: 'easy',
      duration_minutes: 20,
      created_by: hrId,
      is_published: true,
      questions: [
        {
          id: 'q1',
          type: 'open_ended',
          question: 'Müştəri məhsulun qiymetinin çox yüksək olduğunu deyir. Bu etirazı necə idarə edərdiniz?',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Satışda "upselling" nədir?',
          options: [
            'Müştəriyə daha bahalı və ya əlavə məhsul təklif etmək',
            'Məhsulun qiymətini aşağı salmaq',
            'Müştərinin şikayətini həll etmək',
            'Yeni müştəri cəlb etmək',
          ],
          correct_option: 0,
        },
        {
          id: 'q3',
          type: 'open_ended',
          question: 'İlk zənginizde potensial müştəriyə məhsulunuzu necə təqdim edərdiniz? 30 saniyelik "elevator pitch" yazın.',
        },
      ],
    },
  ]

  const { error: simError } = await supabase.from('simulations').insert(simulations)
  if (simError) console.error('Simulations error:', simError)
  else console.log('✅ Simulations created')

  console.log('✅ Seed completed!')
  console.log('\nTest credentials:')
  console.log('HR: hr@pashabank.az / password123')
  console.log('Student: student@test.az / password123')
  console.log('Instructor: instructor@courses.az / password123')
}

seed().catch(console.error)
