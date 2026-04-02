import Anthropic from '@anthropic-ai/sdk'
import type { AnaliseCompleta } from '@/types'

const client = new Anthropic()

const SYSTEM_PROMPT = `Você é um especialista sênior em fomento à inovação no Brasil com 15 anos de experiência em captação de recursos (FINEP, CNPq, BNDES, FAPs estaduais).

Você analisa editais para duas empresas específicas e retorna análises diretas, honestas e acionáveis.

EMPRESA 1 — NexIA Lab
- Software house e consultoria de IA (45+ projetos entregues)
- Produtos SaaS: NexIA Care (NR-01/saúde ocupacional), NexIA Chat (CRM), plataformas de IA para governo
- Stack: Next.js, Python, Claude API, Supabase
- Porte: pequena empresa (EPP), ~R$2M/ano
- Setor: Tecnologia da Informação / Inteligência Artificial
- Forte em: IA generativa, automação, software B2B, saúde digital, governo digital
- Localização: Brasília-DF

EMPRESA 2 — NCT Informática
- Empresa de cibersegurança e infraestrutura de TI (26+ anos)
- Parceiro Fortinet certificado; serviços: firewall, SOC/NOC, endpoint, cloud, suporte gerenciado
- Porte: médio porte
- Setor: Cibersegurança / Infraestrutura de TI
- Forte em: segurança da informação, redes, compliance LGPD/ISO 27001, cloud
- Localização: Brasília-DF (foco DF e Centro-Oeste)

REGRAS CRÍTICAS:
1. Seja direto. Sem enrolação, sem linguagem corporativa vazia.
2. Score honesto: não infle scores para parecer otimista. Se não é aderente, diga claramente.
3. "pontos_atencao" são impeditivos reais — porte incompatível, setor excluído, exigências que a empresa não cumpre.
4. "recomendacao" segue esta lógica:
   - "candidatar": score >= 70 e sem impeditivos críticos
   - "avaliar": score 40-69 ou há dúvidas sobre elegibilidade
   - "ignorar": score < 40 ou há impeditivo claro (ex: edital só para ICTs, só para indústria, só para Norte/Nordeste)
5. "resumo_executivo" em português brasileiro direto — como você explicaria para um CEO em 30 segundos.
6. Retorne APENAS JSON válido. Sem markdown, sem texto antes ou depois.`

const USER_TEMPLATE = (texto: string) => `Analise o seguinte edital e retorne o JSON de análise completa:

TEXTO DO EDITAL:
${texto}

Retorne exatamente este JSON (sem nenhum texto adicional):
{
  "titulo": "título limpo do edital",
  "orgao": "nome do órgão financiador",
  "modalidade": "subvencao|credito|premio|bolsa|outro",
  "publico_alvo": ["string"],
  "areas_tematicas": ["string"],
  "valor_minimo": null_ou_numero_em_reais,
  "valor_maximo": null_ou_numero_em_reais,
  "prazo_submissao": "YYYY-MM-DD ou null",
  "regiao": ["nacional|norte|nordeste|centro-oeste|sudeste|sul|DF"],
  "porte_empresa": ["mei|micro|pequena|media|grande"],
  "contrapartida": true_ou_false,
  "contrapartida_percentual": null_ou_numero,
  "resumo_executivo": "3-4 frases diretas explicando o edital, para quem é, quanto oferece e qual o foco",
  "prazo_formatado": "ex: 30 de junho de 2026 ou Fluxo contínuo",
  "valor_formatado": "ex: até R$ 2 milhões ou R$ 300 mil a R$ 1 milhão",
  "nexia": {
    "score": 0_a_100,
    "nivel": "alto|medio|baixo|irrelevante",
    "justificativa": "2-3 frases diretas sobre por que NexIA Lab se encaixa ou não neste edital",
    "pontos_fortes": ["por que é aderente — seja específico"],
    "pontos_atencao": ["requisitos que podem ser impeditivos — seja honesto"],
    "recomendacao": "candidatar|avaliar|ignorar"
  },
  "nct": {
    "score": 0_a_100,
    "nivel": "alto|medio|baixo|irrelevante",
    "justificativa": "2-3 frases diretas sobre por que NCT Informática se encaixa ou não",
    "pontos_fortes": ["por que é aderente — seja específico"],
    "pontos_atencao": ["requisitos que podem ser impeditivos — seja honesto"],
    "recomendacao": "candidatar|avaliar|ignorar"
  },
  "proximos_passos": [
    "passo concreto 1 — ação específica com prazo ou responsável quando possível",
    "passo concreto 2",
    "passo concreto 3"
  ],
  "documentos_exigidos": [
    "documento tipicamente exigido 1",
    "documento tipicamente exigido 2"
  ]
}`

export async function analisarEdital(texto: string): Promise<AnaliseCompleta> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: USER_TEMPLATE(texto) }
    ]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = raw.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()

  return JSON.parse(clean) as AnaliseCompleta
}
