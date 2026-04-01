import { createClient } from '@/lib/supabase/server'
import { extrairEdital } from '@/lib/ai/extractor'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { edital_id, texto } = await request.json()

  if (!texto) {
    return NextResponse.json({ error: 'Texto do edital e obrigatorio' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: perfil } = await supabase
    .from('perfil_empresa')
    .select('*')
    .single()

  const extracao = await extrairEdital(texto, perfil || undefined)

  if (edital_id) {
    await supabase
      .from('editais')
      .update({
        modalidade: extracao.modalidade,
        publico_alvo: extracao.publico_alvo,
        areas_tematicas: extracao.areas_tematicas,
        valor_minimo: extracao.valor_minimo,
        valor_maximo: extracao.valor_maximo,
        prazo_submissao: extracao.prazo_submissao,
        regiao: extracao.regiao,
        porte_empresa: extracao.porte_empresa,
        score_aderencia: extracao.score_aderencia,
        resumo_ia: extracao.resumo,
        proximos_passos: extracao.proximos_passos,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', edital_id)
  }

  return NextResponse.json(extracao)
}
