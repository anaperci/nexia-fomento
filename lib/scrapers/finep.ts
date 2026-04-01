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
  const url = 'http://www.finep.gov.br/chamadas-publicas/chamadaspublicas?situacao=aberta'

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexIAFomento/1.0)'
      },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()
    const editais: EditalBruto[] = []

    // Split by <div class="item"> blocks
    const blocks = html.split('<div class="item">')

    for (const block of blocks) {
      // Extract title and link from <h3><a href="/chamadas-publicas/chamadapublica/XXX">Title</a></h3>
      const linkMatch = block.match(/<h3><a href="([^"]*chamadapublica[^"]*)"[^>]*>([^<]+)<\/a><\/h3>/)
      if (!linkMatch) continue

      const href = linkMatch[1]
      const titulo = linkMatch[2].trim()

      // Data de publicacao
      const dataPubMatch = block.match(/Data de publica[^:]*:\s*<\/strong>\s*<span>([^<]+)</)
      // Prazo
      const prazoMatch = block.match(/Prazo para envio[^:]*:\s*<\/strong>\s*<span>([^<]+)</)
      // Publico-alvo
      const publicoMatch = block.match(/Publico-alvo[^:]*:\s*<\/strong>\s*[\s\S]*?<span[^>]*>([^<]+)</)
      // Tema
      const temaMatch = block.match(/Tema[^:]*:\s*<\/strong>\s*<span>([^<]+)</)
      // Fonte de Recurso
      const fonteRecursoMatch = block.match(/Fonte de Recurso[^:]*:\s*<\/strong>\s*[\s\S]*?<span>\s*([\s\S]*?)\s*<\/span>/)

      editais.push({
        titulo,
        url: href.startsWith('http')
          ? href
          : `http://www.finep.gov.br${href}`,
        situacao: 'aberta',
        publico: publicoMatch?.[1]?.trim() || '',
        dataPublicacao: dataPubMatch?.[1]?.trim() || '',
        prazoEnvio: prazoMatch?.[1]?.trim() || '',
        tema: temaMatch?.[1]?.trim() || '',
        fonteRecurso: fonteRecursoMatch?.[1]?.trim().replace(/\s+/g, ' ') || '',
        fonte: 'FINEP'
      })
    }

    return editais
  } catch (error) {
    console.error('Erro ao coletar FINEP:', error)
    return []
  }
}
