import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { jsPDF } from 'jspdf'

const FONT_REGULAR = 'NotoSans-Regular.ttf'
const FONT_BOLD = 'NotoSans-Bold.ttf'
const FONT_FAMILY = 'NotoSans'

let fontDataPromise: Promise<{ regular: string; bold: string }> | null = null

async function getFontData(): Promise<{ regular: string; bold: string }> {
  if (!fontDataPromise) {
    fontDataPromise = Promise.all([
      readFile(path.join(process.cwd(), 'public', 'fonts', FONT_REGULAR), 'base64'),
      readFile(path.join(process.cwd(), 'public', 'fonts', FONT_BOLD), 'base64'),
    ]).then(([regular, bold]) => ({ regular, bold }))
  }
  return fontDataPromise
}

/** Registers Noto Sans (Unicode / AZ) fonts — server / API route path. */
export async function registerPdfUnicodeFontsServer(doc: jsPDF): Promise<void> {
  const { regular, bold } = await getFontData()
  doc.addFileToVFS(FONT_REGULAR, regular)
  doc.addFileToVFS(FONT_BOLD, bold)
  doc.addFont(FONT_REGULAR, FONT_FAMILY, 'normal')
  doc.addFont(FONT_BOLD, FONT_FAMILY, 'bold')
}

export function setPdfFontServer(doc: jsPDF, style: 'normal' | 'bold' = 'normal'): void {
  doc.setFont(FONT_FAMILY, style)
}
