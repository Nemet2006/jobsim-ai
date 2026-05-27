-- JobSim AI — Attempt file uploads (reports, docs)
-- Run in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attempt-files',
  'attempt-files',
  false,
  10485760,
  ARRAY[
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
    'application/zip'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Students upload to own folder: {user_id}/{attempt_id}/...
DROP POLICY IF EXISTS "Students upload own attempt files" ON storage.objects;
CREATE POLICY "Students upload own attempt files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'attempt-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Students read own attempt files" ON storage.objects;
CREATE POLICY "Students read own attempt files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'attempt-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Students update own attempt files" ON storage.objects;
CREATE POLICY "Students update own attempt files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'attempt-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- HR reads files for their company simulations (via attempt ownership check simplified: service role API)
DROP POLICY IF EXISTS "Service role full access attempt files" ON storage.objects;
CREATE POLICY "Service role full access attempt files" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'attempt-files')
  WITH CHECK (bucket_id = 'attempt-files');
