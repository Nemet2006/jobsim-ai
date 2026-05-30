import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/premium'
import { getClientIp } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { detectMimeFromBuffer, mimeMatchesClaimed } from '@/lib/file-validation'

const MAX_BYTES = 10 * 1024 * 1024

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/jpg',
])

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rateLimited = await enforceRateLimit(`upload:${ip}`, 30, 3600)
  if (rateLimited) return rateLimited

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmalısınız' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const attemptId = formData.get('attemptId') as string | null
  const questionId = formData.get('questionId') as string | null

  if (!(file instanceof File) || !attemptId || !questionId) {
    return NextResponse.json({ error: 'file, attemptId və questionId tələb olunur' }, { status: 400 })
  }

  if (!/^[0-9a-f-]{36}$/i.test(attemptId) || !/^[a-zA-Z0-9_-]{1,64}$/.test(questionId)) {
    return NextResponse.json({ error: 'Yanlış attemptId və ya questionId' }, { status: 400 })
  }

  const { data: attempt } = await supabase
    .from('simulation_attempts')
    .select('id, student_id, status')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single()

  if (!attempt || attempt.status === 'completed' || attempt.status === 'cancelled') {
    return NextResponse.json({ error: 'Attempt tapılmadı və ya bağlanıb' }, { status: 403 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Fayl 10MB-dan böyük ola bilməz' }, { status: 400 })
  }

  const mime = file.type || 'application/octet-stream'
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json({ error: 'Fayl formatı dəstəklənmir' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = detectMimeFromBuffer(buffer)
  if (!mimeMatchesClaimed(detected, mime)) {
    return NextResponse.json({ error: 'Fayl məzmunu göstərilən formatla uyğun gəlmir' }, { status: 400 })
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const path = `${user.id}/${attemptId}/${questionId}-${Date.now()}-${safeName}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('attempt-files')
    .upload(path, buffer, { contentType: mime, upsert: false })

  if (uploadError) {
    console.error('Upload error:', uploadError.message)
    return NextResponse.json({ error: 'Yükləmə uğursuz oldu' }, { status: 500 })
  }

  const { data: signed, error: signError } = await admin.storage
    .from('attempt-files')
    .createSignedUrl(path, 60 * 60 * 24)

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Fayl linki yaradıla bilmədi' }, { status: 500 })
  }

  return NextResponse.json({
    type: 'file',
    url: signed.signedUrl,
    path,
    name: file.name.slice(0, 200),
    mime,
    size: file.size,
  })
}
