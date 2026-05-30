const SIGNATURES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', bytes: [0x50, 0x4b, 0x03, 0x04] },
]

export function detectMimeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length < 4) return null

  for (const sig of SIGNATURES) {
    const offset = sig.offset ?? 0
    if (buffer.length < offset + sig.bytes.length) continue
    const match = sig.bytes.every((byte, i) => buffer[offset + i] === byte)
    if (match) return sig.mime
  }

  const textStart = buffer.subarray(0, Math.min(buffer.length, 512)).toString('utf8')
  if (/^[\x09\x0a\x0d\x20-\x7E\u0080-\uFFFF]*$/.test(textStart)) {
    if (textStart.includes(',') || textStart.includes('\t')) return 'text/csv'
    return 'text/plain'
  }

  return null
}

export function mimeMatchesClaimed(detected: string | null, claimed: string): boolean {
  if (!detected) return claimed.startsWith('text/')
  if (detected === claimed) return true

  const officeZip = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
  ]
  if (officeZip.includes(detected) && officeZip.includes(claimed)) return true

  return false
}
