/** Curated Evidence & Impact content for the admin panel (AZ). */

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
  activeUsers: 640,
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

export const IMPACT_GROWTH = [
  { label: '1 həftə', users: 38 },
  { label: '2 həftə', users: 72 },
  { label: '3 həftə', users: 118 },
  { label: '4 həftə', users: 164 },
  { label: '5 həftə', users: 218 },
  { label: '6 həftə', users: 268 },
  { label: '7 həftə', users: 312 },
]

export const IMPACT_RECENT_USERS = [
  { name: 'Aysel Məmmədova', email: 'aysel.m@example.com', role: 'Tələbə', joined: '2026-08-05' },
  { name: 'Rəşad Quliyev', email: 'reshad.q@example.com', role: 'Tələbə', joined: '2026-08-04' },
  { name: 'Nigar Əliyeva', email: 'nigar.a@example.com', role: 'HR', joined: '2026-08-03' },
  { name: 'Kamran Hüseynov', email: 'kamran.h@example.com', role: 'Tələbə', joined: '2026-08-02' },
  { name: 'Leyla İsmayılova', email: 'leyla.i@example.com', role: 'Kurs', joined: '2026-08-01' },
  { name: 'Tural Əhmədov', email: 'tural.a@example.com', role: 'Tələbə', joined: '2026-07-30' },
  { name: 'Günel Rəhimova', email: 'gunel.r@example.com', role: 'HR', joined: '2026-07-29' },
  { name: 'Orxan Səfərov', email: 'orxan.s@example.com', role: 'Tələbə', joined: '2026-07-28' },
]

export const IMPACT_SIM_RECORDS = [
  { type: 'Backend Developer', date: '2026-08-06', score: 88 },
  { type: 'Software Engineer', date: '2026-08-05', score: 82 },
  { type: 'Data Scientist', date: '2026-08-04', score: 91 },
  { type: 'Product Manager', date: '2026-08-03', score: 76 },
  { type: 'Frontend Developer', date: '2026-08-02', score: 85 },
  { type: 'HR Business Partner', date: '2026-08-01', score: 79 },
  { type: 'QA Engineer', date: '2026-07-30', score: 84 },
  { type: 'DevOps Engineer', date: '2026-07-28', score: 73 },
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
  { title: 'World Startup Championship', subtitle: 'Acceptance', year: '2025' },
  { title: 'Sabah Hub', subtitle: 'İnkubasiya Proqramı', year: '2025' },
  { title: 'Startup School', subtitle: 'Seçim sertifikatı', year: '2025' },
  { title: 'Innovation Grant', subtitle: 'Shortlist', year: '2025' },
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
