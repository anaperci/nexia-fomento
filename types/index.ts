export type Modalidade = 'subvencao' | 'credito' | 'premio' | 'bolsa' | 'outro'
export type StatusEdital = 'ativo' | 'vencendo' | 'encerrado' | 'suspenso'
export type PorteEmpresa = 'mei' | 'micro' | 'pequena' | 'media' | 'grande'
export type CanalAlerta = 'email' | 'whatsapp'

export interface Edital {
  id: string
  fonte_id: string
  titulo: string
  url_original?: string
  descricao?: string
  orgao?: string
  modalidade?: Modalidade
  publico_alvo?: string[]
  areas_tematicas?: string[]
  valor_minimo?: number
  valor_maximo?: number
  prazo_submissao?: string
  regiao?: string[]
  porte_empresa?: string[]
  status: StatusEdital
  score_aderencia?: number
  resumo_ia?: string
  proximos_passos?: string[]
  analise_nexia?: AnaliseEmpresa
  analise_nct?: AnaliseEmpresa
  score_nexia?: number
  score_nct?: number
  analisado_em?: string
  texto_completo?: string
  coletado_em: string
  atualizado_em: string
  fontes?: Fonte
}

export interface Fonte {
  id: string
  nome: string
  url: string
  tipo: 'scraping' | 'rss' | 'api'
  ativa: boolean
  ultima_coleta?: string
  total_coletados: number
}

export interface PerfilEmpresa {
  id: string
  nome: string
  cnpj?: string
  setor?: string[]
  porte?: PorteEmpresa
  regiao?: string
  receita_anual?: number
  areas_interesse?: string[]
  palavras_chave?: string[]
}

export interface Alerta {
  id: string
  nome: string
  ativo: boolean
  canal: CanalAlerta
  score_minimo: number
  areas?: string[]
  modalidades?: string[]
  valor_minimo?: number
}

export interface AnaliseEmpresa {
  score: number
  nivel: 'alto' | 'medio' | 'baixo' | 'irrelevante'
  justificativa: string
  pontos_fortes: string[]
  pontos_atencao: string[]
  recomendacao: 'candidatar' | 'avaliar' | 'ignorar'
}

export interface AnaliseCompleta {
  titulo: string
  orgao: string
  modalidade: Modalidade
  publico_alvo: string[]
  areas_tematicas: string[]
  valor_minimo: number | null
  valor_maximo: number | null
  prazo_submissao: string | null
  regiao: string[]
  porte_empresa: string[]
  contrapartida: boolean
  contrapartida_percentual: number | null
  resumo_executivo: string
  prazo_formatado: string
  valor_formatado: string
  nexia: AnaliseEmpresa
  nct: AnaliseEmpresa
  proximos_passos: string[]
  documentos_exigidos: string[]
  edital_id?: string
}

export interface ExtracaoIA {
  titulo: string
  orgao: string
  modalidade: Modalidade
  publico_alvo: string[]
  areas_tematicas: string[]
  valor_minimo?: number
  valor_maximo?: number
  prazo_submissao?: string
  regiao: string[]
  porte_empresa: string[]
  score_aderencia: number
  resumo: string
  proximos_passos: string[]
}
