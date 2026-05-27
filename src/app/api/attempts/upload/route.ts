import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/premium'

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
  'application/zip',
  'application/x-zip-compressed',
])

export async function POST(request: Request) {
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
    return NextResponse.json({ error: 'Fayl formatı dəstəklənmir (PDF, DOCX, XLSX, PPTX, TXT, CSV, PNG, JPG, ZIP)' }, { status: 400 })
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const path = `${user.id}/${attemptId}/${questionId}-${Date.now()}-${safeName}`

  const admin = createAdminClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await admin.storage
    .from('attempt-files')
    .upload(path, buffer, { contentType: mime, upsert: true })

  if (uploadError) {
    console.error('Upload error:', uploadError.message)
    return NextResponse.json({
      error: 'Yükləmə uğursuz. SQL_STORAGE.sql-i Supabase-də işlədin.',
    }, { status: 500 })
  }

  const { data: signed, error: signError } = await admin.storage
    .from('attempt-files')
    .createSignedUrl(path, 60 * 60 * 24 * 30)

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Fayl linki yaradıla bilmədi' }, { status: 500 })
  }

  return NextResponse.json({
    type: 'file',
    url: signed.signedUrl,
    path,
    name: file.name,
    mime,
    size: file.size,
  })
}
