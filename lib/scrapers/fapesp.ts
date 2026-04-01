export interface EditalBruto {
  titulo: string
  url: string
  situacao: string
  publico: string
  instituicao: string
  cidade: string
  prazoEnvio: string
  tema: string
  resumo: string
  fonte: string
}

export async function coletarFapesp(): Promise<EditalBruto[]> {
  const url = 'https://fapesp.br/oportunidades'

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexIAFomento/1.0)'
      },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()
    const editais: EditalBruto[] = []

    // Only get PT entries (class contains "pt")
    const blocks = html.split('<li class="box_col aberta')

    for (const block of blocks) {
      // Skip English entries
      if (!block.includes(' pt">') && !block.includes(' pt ')) continue

      // Title
      const titleMatch = block.match(/<strong class="title">([^<]+)</)
      if (!titleMatch) continue

      // Link
      const hrefMatch = block.match(/href="([^"]+)"/)
      // Instituicao
      const instMatch = block.match(/<strong>Institui[^:]*:<\/strong>\s*([^<]+)/)
      // Cidade
      const cidadeMatch = block.match(/<strong>Cidade:<\/strong>\s*([^<]+)/)
      // Prazo
      const prazoMatch = block.match(/<strong>Inscri[^:]*:<\/strong>\s*(\d{2}\/\d{2}\/\d{4})/)
      // Resumo
      const resumoMatch = block.match(/<span class="text-resumo">\s*<p>\s*([\s\S]*?)<\/p>/)

      const href = hrefMatch?.[1] || ''
      const fullUrl = href.startsWith('http') ? href : `https://fapesp.br${href.replace('../', '/oportunidades/')}`

      editais.push({
        titulo: titleMatch[1].trim(),
        url: fullUrl,
        situacao: 'aberta',
        publico: 'Pesquisadores',
        instituicao: instMatch?.[1]?.trim() || '',
        cidade: cidadeMatch?.[1]?.trim() || '',
        prazoEnvio: prazoMatch?.[1]?.trim() || '',
        tema: '',
        resumo: resumoMatch?.[1]?.trim().replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').substring(0, 300) || '',
        fonte: 'FAPESP'
      })
    }

    return editais
  } catch (error) {
    console.error('Erro ao coletar FAPESP:', error)
    return []
  }
}
