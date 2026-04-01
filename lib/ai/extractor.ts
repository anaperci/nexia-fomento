import Anthropic from '@anthropic-ai/sdk'
import type { ExtracaoIA, PerfilEmpresa } from '@/types'

const client = new Anthropic()

export async function extrairEdital(
  textoEdital: string,
  perfil?: PerfilEmpresa
): Promise<ExtracaoIA> {
  const perfilContext = perfil
    ? `\n\nPERFIL DA EMPRESA PARA CALCULAR ADERÊNCIA:\n${JSON.stringify(perfil, null, 2)}`
    : ''

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Você é um especialista em fomento à inovação no Brasil. Analise o edital abaixo e retorne APENAS um JSON válido sem markdown, sem explicações.

EDITAL:
${textoEdital}
${perfilContext}

Retorne exatamente este JSON (sem texto adicional, sem \`\`\`):
{
  "titulo": "título limpo do edital",
  "orgao": "nome do órgão financiador",
  "modalidade": "subvencao|credito|premio|bolsa|outro",
  "publico_alvo": ["empresas", "startups", "ICTs", "pesquisadores"],
  "areas_tematicas": ["área 1", "área 2"],
  "valor_minimo": null_ou_numero,
  "valor_maximo": null_ou_numero,
  "prazo_submissao": "YYYY-MM-DD ou null",
  "regiao": ["nacional", "sudeste", "nordeste", etc],
  "porte_empresa": ["micro", "pequena", "media", "grande"],
  "score_aderencia": 0_a_100,
  "resumo": "2-3 frases diretas sobre o edital e por que é relevante",
  "proximos_passos": ["passo 1", "passo 2", "passo 3"]
}`
      }
    ]
  })

  const texto = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(texto.trim()) as ExtracaoIA
}
