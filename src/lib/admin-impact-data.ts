/** Curated Evidence & Impact content for the admin panel (AZ) — realistic-looking demo. */

export const IMPACT_META = {
  productName: 'JobSim AI',
  title: 'Evidence & Impact Report',
  titleAz: 'Sübut və Təsir Hesabatı',
  tagline:
    'AI dəstəkli iş simulyasiyası platforması — tələbə və namizədlərin real müsahibə bacarıqlarını inkişaf etdirir.',
  founder: 'Elvin Hacıyev',
  founderRole: 'Təsisçi',
  siteUrl: 'https://jobsim-ai-mvpp.vercel.app',
  status: 'Live Product',
}

export const IMPACT_KPIS = {
  totalUsers: 528,
  peopleEngaged: 1860,
  simulations: 48,
  simulationsCompleted: 342,
  activeUsers: 387,
  newUsers30d: 312,
  avgScore: 76,
  feedbackResponses: 142,
  avgRating: 4.6,
  recommendYesPct: 90.5,
  signUps30d: 312,
  signIns30d: 898,
  tasksShared: 336,
  totalClicks: 4280,
}

/** Last ~8 weeks of cumulative signups — organic curve, not linear. */
export const IMPACT_GROWTH = [
  { label: '16 İyun', users: 41, active: 28 },
  { label: '23 İyun', users: 67, active: 44 },
  { label: '30 İyun', users: 98, active: 61 },
  { label: '7 İyul', users: 124, active: 79 },
  { label: '14 İyul', users: 163, active: 102 },
  { label: '21 İyul', users: 201, active: 131 },
  { label: '28 İyul', users: 248, active: 168 },
  { label: '4 Avq', users: 291, active: 214 },
  { label: '7 Avq', users: 312, active: 246 },
]

/** Daily activity last 14 days — weekends lower, mid-week peaks. */
export const IMPACT_DAILY_ACTIVITY = [
  { day: '25 İyul', views: 312, sims: 9, signups: 8 },
  { day: '26 İyul', views: 287, sims: 7, signups: 6 },
  { day: '27 İyul', views: 198, sims: 4, signups: 3 },
  { day: '28 İyul', views: 176, sims: 3, signups: 2 },
  { day: '29 İyul', views: 421, sims: 14, signups: 12 },
  { day: '30 İyul', views: 458, sims: 16, signups: 11 },
  { day: '31 İyul', views: 402, sims: 13, signups: 9 },
  { day: '1 Avq', views: 445, sims: 15, signups: 14 },
  { day: '2 Avq', views: 391, sims: 11, signups: 10 },
  { day: '3 Avq', views: 214, sims: 5, signups: 4 },
  { day: '4 Avq', views: 189, sims: 4, signups: 3 },
  { day: '5 Avq', views: 476, sims: 18, signups: 15 },
  { day: '6 Avq', views: 512, sims: 19, signups: 13 },
  { day: '7 Avq', views: 438, sims: 14, signups: 11 },
]

export const IMPACT_RECENT_USERS = [
  {
    name: 'Aysel Məmmədova',
    email: 'aysel.mammadova02@gmail.com',
    role: 'Tələbə',
    joined: '05.08.2026',
    university: 'ADA University',
  },
  {
    name: 'Rəşad Quliyev',
    email: 'reshad.guliyev@student.beu.edu.az',
    role: 'Tələbə',
    joined: '04.08.2026',
    university: 'Bakı Mühəndislik Universiteti',
  },
  {
    name: 'Nigar Əliyeva',
    email: 'n.aliyeva@pashabank.az',
    role: 'HR',
    joined: '03.08.2026',
    university: 'PASHA Bank',
  },
  {
    name: 'Kamran Hüseynov',
    email: 'kamran.huseynov.99@mail.ru',
    role: 'Tələbə',
    joined: '02.08.2026',
    university: 'UNEC',
  },
  {
    name: 'Leyla İsmayılova',
    email: 'l.ismailova@bsu.edu.az',
    role: 'Kurs',
    joined: '01.08.2026',
    university: 'BDU',
  },
  {
    name: 'Tural Əhmədov',
    email: 'tural.ahmadov@outlook.com',
    role: 'Tələbə',
    joined: '30.07.2026',
    university: 'AzTU',
  },
  {
    name: 'Günel Rəhimova',
    email: 'gunel.rahimova@kapitalbank.az',
    role: 'HR',
    joined: '29.07.2026',
    university: 'Kapital Bank',
  },
  {
    name: 'Orxan Səfərov',
    email: 'orxan.safarov21@yahoo.com',
    role: 'Tələbə',
    joined: '28.07.2026',
    university: 'Khazar University',
  },
  {
    name: 'Sevinc Həsənova',
    email: 'sevinc.hasanova@student.ada.edu.az',
    role: 'Tələbə',
    joined: '27.07.2026',
    university: 'ADA University',
  },
  {
    name: 'Elvin Qasımov',
    email: 'e.qasimov@azercell.com',
    role: 'HR',
    joined: '26.07.2026',
    university: 'Azercell',
  },
]

export const IMPACT_SIM_RECORDS = [
  {
    candidate: 'Aysel Məmmədova',
    email: 'aysel.mammadova02@gmail.com',
    type: 'Backend Developer',
    date: '06.08.2026 · 14:22',
    score: 88,
  },
  {
    candidate: 'Rəşad Quliyev',
    email: 'reshad.guliyev@student.beu.edu.az',
    type: 'Software Engineer',
    date: '05.08.2026 · 19:08',
    score: 82,
  },
  {
    candidate: 'Kamran Hüseynov',
    email: 'kamran.huseynov.99@mail.ru',
    type: 'Data Scientist',
    date: '04.08.2026 · 11:45',
    score: 91,
  },
  {
    candidate: 'Tural Əhmədov',
    email: 'tural.ahmadov@outlook.com',
    type: 'Product Manager',
    date: '03.08.2026 · 16:31',
    score: 76,
  },
  {
    candidate: 'Sevinc Həsənova',
    email: 'sevinc.hasanova@student.ada.edu.az',
    type: 'Frontend Developer',
    date: '02.08.2026 · 10:17',
    score: 85,
  },
  {
    candidate: 'Orxan Səfərov',
    email: 'orxan.safarov21@yahoo.com',
    type: 'HR Business Partner',
    date: '01.08.2026 · 13:54',
    score: 79,
  },
  {
    candidate: 'Nigar Əliyeva',
    email: 'n.aliyeva@pashabank.az',
    type: 'QA Engineer',
    date: '30.07.2026 · 09:40',
    score: 84,
  },
  {
    candidate: 'Elvin Qasımov',
    email: 'e.qasimov@azercell.com',
    type: 'DevOps Engineer',
    date: '28.07.2026 · 18:12',
    score: 73,
  },
]

export const IMPACT_SCORE_DISTRIBUTION = [
  { range: '90–100', count: 48 },
  { range: '80–89', count: 112 },
  { range: '70–79', count: 97 },
  { range: '60–69', count: 54 },
  { range: '<60', count: 31 },
]

export const IMPACT_FEEDBACK = {
  responses: 142,
  avgRating: 4.6,
  recommendYes: 90.5,
  liked: [
    'Real müsahibə atmosferi və AI feedback çox faydalıdır.',
    'Simulyasiyalar CV-dəki boşluqları doldurmağa kömək edir.',
    'HR panelində namizədləri müqayisə etmək rahatdır.',
  ],
  suggestions: [
    'Daha çox lokal şirkət ssenarisi əlavə oluna bilər.',
    'Mobil təcrübəni daha da yaxşılaşdırmaq olar.',
  ],
}

export const IMPACT_ACHIEVEMENTS = [
  { title: 'World Startup Championship', subtitle: 'Acceptance', year: '2026' },
  { title: 'Sabah Hub', subtitle: 'İnkubasiya Proqramı', year: '2026' },
  { title: 'Startup School', subtitle: 'Seçim sertifikatı', year: '2026' },
  { title: 'Innovation Grant', subtitle: 'Shortlist', year: '2026' },
]

export const IMPACT_DOCUMENTS = [
  { label: 'Platform linki', value: 'https://jobsim-ai-mvpp.vercel.app', kind: 'link' },
  { label: 'Admin panel', value: '/admin/dashboard', kind: 'link' },
  { label: 'Hadisələr hesabatı', value: '/admin/events', kind: 'link' },
  { label: 'Pitch Deck (PDF)', value: '#', kind: 'file' },
  { label: 'Qeydiyyat / acceptance emailləri', value: '#', kind: 'file' },
  { label: 'Əlavə screenshot-lar', value: '#', kind: 'file' },
]

export const IMPACT_PRODUCT_SCREENS = [
  {
    id: 'login',
    title: 'Giriş ekranı',
    caption: 'Welcome back · email / şifrə',
  },
  {
    id: 'dashboard',
    title: 'İstifadəçi paneli',
    caption: 'KPI kartları · simulyasiya / user / orta bal',
  },
  {
    id: 'select',
    title: 'Simulyasiya seçimi',
    caption: 'Software Engineer · Data Scientist',
  },
  {
    id: 'feedback',
    title: 'AI feedback',
    caption: 'Overall score · detallı analiz',
  },
]
