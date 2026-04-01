export interface EditalBruto {
  titulo: string
  url: string
  situacao: string
  publico: string
  dataAlteracao: string
  fonte: string
}

export async function coletarFinep(): Promise<EditalBruto[]> {
  const url = 'http://www.finep.gov.br/chamadas-publicas/chamadaspublicas?situacao=aberta'

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexIAFomento/1.0)'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()

    const editais: EditalBruto[] = []
    const regex = /<tr[^>]*>[\s\S]*?<\/tr>/gi
    const rows = html.match(regex) || []

    for (const row of rows) {
      const linkMatch = row.match(/href="([^"]*chamadapublica[^"]*)"[^>]*>([^<]+)</)
      const publicoMatch = row.match(/Disponível para:\s*([^<\n]+)/)
      const dataMatch = row.match(/Data de alteração:\s*(\d{2}\/\d{2}\/\d{4})/)

      if (linkMatch) {
        editais.push({
          titulo: linkMatch[2].trim(),
          url: linkMatch[1].startsWith('http')
            ? linkMatch[1]
            : `http://www.finep.gov.br${linkMatch[1]}`,
          situacao: 'aberta',
          publico: publicoMatch?.[1]?.trim() || '',
          dataAlteracao: dataMatch?.[1] || '',
          fonte: 'FINEP'
        })
      }
    }

    return editais
  } catch (error) {
    console.error('Erro ao coletar FINEP:', error)
    return []
  }
}
