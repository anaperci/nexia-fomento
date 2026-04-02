export interface PDFEncontrado {
  url: string
  titulo: string
  prioridade: number
}

export function descobrirPDFs(html: string, baseUrl: string): PDFEncontrado[] {
  const pdfs: PDFEncontrado[] = []

  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim()
    const texto = match[2].trim().toLowerCase()

    let urlCompleta = href
    if (href.startsWith('/')) {
      const base = new URL(baseUrl)
      urlCompleta = `${base.protocol}//${base.host}${href}`
    } else if (!href.startsWith('http')) {
      try {
        urlCompleta = new URL(href, baseUrl).toString()
      } catch {
        continue
      }
    }

    const ehPDF =
      urlCompleta.toLowerCase().includes('.pdf') ||
      urlCompleta.toLowerCase().includes('download') ||
      texto.includes('.pdf')

    if (!ehPDF) continue

    let prioridade = 1
    if (texto.includes('edital') && (texto.includes('completo') || texto.includes('integral'))) prioridade = 10
    else if (texto.includes('chamada') && texto.includes('pública')) prioridade = 9
    else if (texto.includes('regulamento')) prioridade = 8
    else if (texto.includes('edital')) prioridade = 7
    else if (texto.includes('chamada')) prioridade = 6
    else if (texto.includes('anexo i') || texto.includes('anexo 1')) prioridade = 5
    else if (texto.includes('retificação') || texto.includes('retificado')) prioridade = 4
    else if (texto.includes('anexo')) prioridade = 3
    else if (urlCompleta.toLowerCase().includes('.pdf')) prioridade = 2

    const ignorar = ['curriculo', 'currículo', 'lattes', 'resultado', 'gabarito', 'lista']
    if (ignorar.some(i => texto.includes(i))) continue

    pdfs.push({ url: urlCompleta, titulo: match[2].trim(), prioridade })
  }

  const vistos = new Set<string>()
  return pdfs
    .sort((a, b) => b.prioridade - a.prioridade)
    .filter(p => {
      if (vistos.has(p.url)) return false
      vistos.add(p.url)
      return true
    })
}
