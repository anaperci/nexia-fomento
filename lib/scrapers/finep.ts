import { descobrirPDFs } from '@/lib/pdf/discovery'
import { baixarPDFComRetry, extrairTextoPDF } from '@/lib/pdf/extractor'
import { analisarEdital, analisarEditalPDFNativo } from '@/lib/ai/analisador'
import { filtrarEditalRapido, filtrarPorPublico } from '@/lib/scrapers/filtros'
import type { AnaliseCompleta } from '@/types'

export interface EditalColetado {
  titulo: string
  url_pagina: string
  orgao: string
  publico: string
  prazoEnvio: string
  tema: string
  texto_completo: string
  metodo_extracao: 'texto' | 'nativo' | 'sem_pdf' | 'erro'
  pdf_url: string | null
  analise: AnaliseCompleta | null
  erro?: string
}

const BASE_URL = 'http://www.finep.gov.br'

async function coletarListagem(): Promise<Array<{
  titulo: string; url: string; publico: string; prazoEnvio: string; tema: string
}>> {
  const url = `${BASE_URL}/chamadas-publicas/chamadaspublicas?situacao=aberta`

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NexIAFomento/1.0)' },
  })

  if (!response.ok) throw new Error(`FINEP listagem: HTTP ${response.status}`)

  const html = await response.text()
  const editais: Array<{
    titulo: string; url: string; publico: string; prazoEnvio: string; tema: string
  }> = []

  const blocks = html.split('<div class="item">')

  for (const block of blocks) {
    const linkMatch = block.match(/<h3><a href="([^"]*chamadapublica[^"]*)"[^>]*>([^<]+)<\/a><\/h3>/)
    if (!linkMatch) continue

    const href = linkMatch[1]
    const titulo = linkMatch[2].trim()

    const prazoMatch = block.match(/Prazo para envio[^:]*:\s*<\/strong>\s*<span>([^<]+)</)
    const publicoMatch = block.match(/Publico-alvo[^:]*:\s*<\/strong>\s*[\s\S]*?<span[^>]*>([^<]+)</)
    const temaMatch = block.match(/Tema[^:]*:\s*<\/strong>\s*<span>([^<]+)</)

    editais.push({
      titulo,
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      publico: publicoMatch?.[1]?.trim() || '',
      prazoEnvio: prazoMatch?.[1]?.trim() || '',
      tema: temaMatch?.[1]?.trim() || '',
    })
  }

  return editais
}

async function processarEdital(
  item: { titulo: string; url: string; publico: string; prazoEnvio: string; tema: string }
): Promise<EditalColetado> {
  const base: EditalColetado = {
    titulo: item.titulo,
    url_pagina: item.url,
    orgao: 'FINEP',
    publico: item.publico,
    prazoEnvio: item.prazoEnvio,
    tema: item.tema,
    texto_completo: '',
    metodo_extracao: 'sem_pdf',
    pdf_url: null,
    analise: null,
  }

  try {
    // 1. Access individual edital page
    const pageResponse = await fetch(item.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NexIAFomento/1.0)' },
    })

    if (!pageResponse.ok) {
      return { ...base, metodo_extracao: 'erro', erro: `HTTP ${pageResponse.status}` }
    }

    const pageHtml = await pageResponse.text()

    // 2. Extract page text as fallback
    const textoHtml = pageHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)

    // 3. Discover PDFs
    const pdfs = descobrirPDFs(pageHtml, item.url)

    if (pdfs.length === 0) {
      console.log(`[FINEP] Sem PDF: ${item.titulo}`)
      const analise = await analisarEdital(textoHtml).catch(() => null)
      return { ...base, texto_completo: textoHtml, metodo_extracao: 'sem_pdf', analise }
    }

    // 4. Download top-priority PDF
    const pdfPrincipal = pdfs[0]
    console.log(`[FINEP] PDF: ${pdfPrincipal.titulo} -> ${pdfPrincipal.url}`)

    const buffer = await baixarPDFComRetry(pdfPrincipal.url)

    if (!buffer) {
      const analise = await analisarEdital(textoHtml).catch(() => null)
      return {
        ...base, texto_completo: textoHtml, metodo_extracao: 'erro',
        pdf_url: pdfPrincipal.url, erro: 'Falha download PDF', analise,
      }
    }

    // 5. Extract text
    const resultado = await extrairTextoPDF(buffer)

    if (resultado.metodo === 'texto' && resultado.texto.length > 200) {
      const analise = await analisarEdital(resultado.texto).catch(() => null)
      return {
        ...base, texto_completo: resultado.texto.slice(0, 50000),
        metodo_extracao: 'texto', pdf_url: pdfPrincipal.url, analise,
      }
    }

    // 6. Scanned PDF — use Claude Documents API
    console.log(`[FINEP] PDF escaneado, usando Documents API: ${item.titulo}`)
    const analise = await analisarEditalPDFNativo(resultado.buffer!, resultado.paginas).catch(() => null)
    return {
      ...base, texto_completo: '[PDF processado nativamente pelo Claude]',
      metodo_extracao: 'nativo', pdf_url: pdfPrincipal.url, analise,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[FINEP] Erro "${item.titulo}":`, msg)
    return { ...base, metodo_extracao: 'erro', erro: msg }
  }
}

export async function coletarFinepCompleto(): Promise<EditalColetado[]> {
  const listagem = await coletarListagem()
  console.log(`[FINEP] ${listagem.length} editais na listagem`)

  // Apply quick filters before downloading PDFs
  const editaisFiltrados = listagem.filter(item => {
    const filtroPub = filtrarPorPublico(item.publico)
    if (!filtroPub.relevante) {
      console.log(`[FINEP] Descartado publico — ${item.titulo}: ${filtroPub.motivo}`)
      return false
    }
    const filtroTitulo = filtrarEditalRapido(item.titulo, item.publico, item.tema)
    if (!filtroTitulo.relevante) {
      console.log(`[FINEP] Descartado titulo — ${item.titulo}: ${filtroTitulo.motivo}`)
      return false
    }
    return true
  })

  console.log(`[FINEP] ${editaisFiltrados.length}/${listagem.length} passaram pelo filtro rapido`)

  const resultados: EditalColetado[] = []
  const TAMANHO_LOTE = 2

  for (let i = 0; i < editaisFiltrados.length; i += TAMANHO_LOTE) {
    const lote = editaisFiltrados.slice(i, i + TAMANHO_LOTE)

    const loteResultados = await Promise.allSettled(
      lote.map(item => processarEdital(item))
    )

    for (const r of loteResultados) {
      if (r.status === 'fulfilled') resultados.push(r.value)
      else console.error('[FINEP] Lote falhou:', r.reason)
    }

    if (i + TAMANHO_LOTE < listagem.length) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  return resultados
}

// Keep simple scraper for backward compat (used by FAPESP route)
export interface EditalBruto {
  titulo: string
  url: string
  situacao: string
  publico: string
  dataPublicacao: string
  prazoEnvio: string
  tema: string
  fonteRecurso: string
  fonte: string
}

export async function coletarFinep(): Promise<EditalBruto[]> {
  const listagem = await coletarListagem()
  return listagem.map(item => ({
    titulo: item.titulo,
    url: item.url,
    situacao: 'aberta',
    publico: item.publico,
    dataPublicacao: '',
    prazoEnvio: item.prazoEnvio,
    tema: item.tema,
    fonteRecurso: '',
    fonte: 'FINEP',
  }))
}
