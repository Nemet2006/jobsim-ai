import type { jsPDF } from 'jspdf'

const FONT_REGULAR = 'NotoSans-Regular.ttf'
const FONT_BOLD = 'NotoSans-Bold.ttf'
const FONT_FAMILY = 'NotoSans'

let fontDataPromise: Promise<{ regular: string; bold: string }> | null = null

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

async function loadFontBase64(path: string): Promise<string> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Font yüklənmədi: ${path}`)
  return arrayBufferToBase64(await res.arrayBuffer())
}

async function getFontData(): Promise<{ regular: string; bold: string }> {
  if (!fontDataPromise) {
    fontDataPromise = Promise.all([
      loadFontBase64('/fonts/NotoSans-Regular.ttf'),
      loadFontBase64('/fonts/NotoSans-Bold.ttf'),
    ]).then(([regular, bold]) => ({ regular, bold }))
  }
  return fontDataPromise
}

/** Registers Noto Sans (Unicode / AZ) fonts — browser / client path. */
export async function registerPdfUnicodeFonts(doc: jsPDF): Promise<void> {
  const { regular, bold } = await getFontData()
  doc.addFileToVFS(FONT_REGULAR, regular)
  doc.addFileToVFS(FONT_BOLD, bold)
  doc.addFont(FONT_REGULAR, FONT_FAMILY, 'normal')
  doc.addFont(FONT_BOLD, FONT_FAMILY, 'bold')
}

export function setPdfFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal'): void {
  doc.setFont(FONT_FAMILY, style)
}
