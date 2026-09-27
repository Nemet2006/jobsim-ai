/** Certificate IDs are "JSIM-" + the first 12 hex digits of the attempt UUID. */

const CERT_ID_RE = /^JSIM-([0-9A-F]{12})$/

export function getCertificateId(attemptId: string): string {
  return `JSIM-${attemptId.replace(/-/g, '').slice(0, 12).toUpperCase()}`
}

/** Normalizes user input like " jsim-1a2b… " to "JSIM-1A2B…", or null if it is not a certificate ID. */
export function normalizeCertificateId(raw: string): string | null {
  const id = raw.trim().toUpperCase()
  return CERT_ID_RE.test(id) ? id : null
}

/** Inclusive UUID bounds covering every attempt whose ID starts with this certificate's prefix. */
export function certificateIdToUuidRange(certId: string): { min: string; max: string } | null {
  const match = CERT_ID_RE.exec(certId)
  if (!match) return null
  const hex = match[1].toLowerCase()
  const prefix = `${hex.slice(0, 8)}-${hex.slice(8, 12)}`
  return {
    min: `${prefix}-0000-0000-000000000000`,
    max: `${prefix}-ffff-ffff-ffffffffffff`,
  }
}
