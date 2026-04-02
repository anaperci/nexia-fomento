const TERMOS_RELEVANTES = [
  'subvenção econômica', 'subvencao economica', 'inovacred',
  'crédito inovação', 'credito inovacao', 'apoio a empresas',
  'financiamento empresas', 'startup', 'pequena empresa',
  'micro empresa', 'mpe', 'mei',
  'tecnologia da informação', 'tecnologia da informacao',
  'tecnologias digitais', 'transformação digital', 'transformacao digital',
  'inteligência artificial', 'inteligencia artificial',
  'software', 'sistema de informação', 'sistema de informacao',
  'segurança da informação', 'seguranca da informacao',
  'cibersegurança', 'ciberseguranca', 'internet das coisas', 'iot',
  'cloud', 'nuvem', 'automação', 'automacao',
  'saúde digital', 'saude digital', 'governo digital',
  'serviços digitais', 'servicos digitais', 'infraestrutura de ti',
  'ti e comunicações', 'ti e comunicacoes', 'semicondutores', 'conectividade',
  'mais inovação', 'mais inovacao', 'rota 2030',
  'proinfra', 'pipe', 'pappe', 'inova', 'fndct', 'mcti',
]

const TERMOS_DESCARTAVEIS = [
  'concurso público', 'concurso publico', 'seleção de pessoal', 'selecao de pessoal',
  'processo seletivo', 'vaga', 'contratação', 'contratacao', 'servidor',
  'bolsista', 'bolsa de pesquisa', 'pós-doutorado', 'pos-doutorado',
  'doutorado', 'mestrado', 'graduação', 'graduacao', 'pesquisador', 'professor',
  'instituição de ciência e tecnologia', 'instituicao de ciencia e tecnologia',
  'fundação de apoio', 'fundacao de apoio', 'universidade', 'instituto federal', 'ict',
  'agropecuária', 'agropecuaria', 'agricultura', 'pecuária', 'pecuaria',
  'pesca', 'aquicultura', 'cultura e artes', 'cinema', 'audiovisual',
  'turismo', 'esporte', 'moda', 'têxtil', 'textil',
  'construção civil', 'construcao civil', 'saneamento básico', 'saneamento basico',
  'exclusivo norte', 'exclusivo nordeste', 'apenas norte', 'apenas nordeste',
  'somente norte', 'somente nordeste',
]

export interface ResultadoFiltro {
  relevante: boolean
  motivo: string
}

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function filtrarEditalRapido(
  titulo: string,
  publico?: string,
  descricao?: string
): ResultadoFiltro {
  const textoCompleto = normalizar([titulo, publico, descricao].filter(Boolean).join(' '))

  for (const termo of TERMOS_DESCARTAVEIS) {
    if (textoCompleto.includes(normalizar(termo))) {
      return { relevante: false, motivo: `Descartado: contem "${termo}"` }
    }
  }

  for (const termo of TERMOS_RELEVANTES) {
    if (textoCompleto.includes(normalizar(termo))) {
      return { relevante: true, motivo: `Relevante: contem "${termo}"` }
    }
  }

  return { relevante: true, motivo: 'Ambiguo — aguardando analise IA' }
}

export function filtrarPorPublico(publico: string): ResultadoFiltro {
  if (!publico) return { relevante: true, motivo: 'Publico nao informado' }

  const p = publico.toLowerCase()

  if (
    (p.includes('ict') || p.includes('instituição') || p.includes('instituicao') || p.includes('fundação') || p.includes('fundacao')) &&
    !p.includes('empresa')
  ) {
    return { relevante: false, motivo: `Exclusivo para ICTs: "${publico}"` }
  }

  if (p.includes('empresa') || p.includes('startup') || p.includes('cooperativa')) {
    return { relevante: true, motivo: `Aberto para empresas: "${publico}"` }
  }

  return { relevante: true, motivo: 'Publico ambiguo — aguardando analise IA' }
}
