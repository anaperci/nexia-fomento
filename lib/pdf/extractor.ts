export interface ResultadoExtracao {
  texto: string
  paginas: number
  metodo: 'texto' | 'escaneado'
  buffer?: Buffer
}

export async function baixarPDF(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NexIAFomento/1.0)' },
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function baixarPDFComRetry(
  url: string,
  tentativas = 3
): Promise<Buffer | null> {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await baixarPDF(url)
    } catch (err) {
      console.warn(`Tentativa ${i + 1} falhou para ${url}:`, err)
      if (i < tentativas - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
      }
    }
  }
  return null
}

export async function extrairTextoPDF(buffer: Buffer): Promise<ResultadoExtracao> {
  try {
    const { PDFParse } = await import('pdf-parse')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parser = new PDFParse(buffer) as any
    await parser.load()
    const info = await parser.getInfo()
    const texto = ((await parser.getText()) as string).trim()
    const numpages = info?.numPages || 1

    if (texto.length > 200) {
      return { texto, paginas: numpages, metodo: 'texto' }
    }

    return { texto, paginas: numpages, metodo: 'escaneado', buffer }
  } catch (err) {
    console.error('Erro ao extrair texto do PDF:', err)
    return {
      texto: '',
      paginas: 0,
      metodo: 'escaneado',
      buffer,
    }
  }
}
