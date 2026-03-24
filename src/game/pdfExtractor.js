import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

/**
 * Extract all text from a PDF File object.
 * Returns { text, pageCount } or throws on failure.
 */
export async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map((item) => item.str)
    pages.push(strings.join(' '))
  }

  return { text: pages.join('\n\n'), pageCount: pdf.numPages }
}

/**
 * Extract text from multiple PDF files.
 * Returns { text, totalPages, fileNames }.
 */
export async function extractTextFromMultiplePDFs(files) {
  const results = []

  for (const file of files) {
    const { text, pageCount } = await extractTextFromPDF(file)
    results.push({ name: file.name, text, pageCount })
  }

  const combined = results.map((r) => `--- ${r.name} ---\n${r.text}`).join('\n\n')
  const totalPages = results.reduce((sum, r) => sum + r.pageCount, 0)

  return {
    text: combined,
    totalPages,
    fileNames: results.map((r) => r.name),
  }
}

/**
 * Split text into chunks of roughly `maxChars` characters,
 * breaking at paragraph boundaries when possible.
 */
export function chunkText(text, maxChars = 12000) {
  const paragraphs = text.split(/\n{2,}/)
  const chunks = []
  let current = ''

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars && current.length > 0) {
      chunks.push(current.trim())
      current = ''
    }
    current += para + '\n\n'
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}
