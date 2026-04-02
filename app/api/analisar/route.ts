import { createClient } from '@/lib/supabase/server'
import { analisarEdital } from '@/lib/ai/analisador'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { edital_id, texto, url } = await request.json()

  if (!texto && !url) {
    return NextResponse.json(
      { error: 'Forneca o texto do edital ou uma URL.' },
      { status: 400 }
    )
  }

  let textoFinal = texto

  if (url && !texto) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NexIAFomento/1.0)' }
      })
      textoFinal = await res.text()
      textoFinal = textoFinal.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    } catch {
      return NextResponse.json(
        { error: 'Nao foi possivel acessar a URL fornecida.' },
        { status: 422 }
      )
    }
  }

  const analise = await analisarEdital(textoFinal)
  const supabase = createClient()

  if (edital_id) {
    await supabase
      .from('editais')
      .update({
        titulo: analise.titulo,
        orgao: analise.orgao,
        modalidade: analise.modalidade,
        publico_alvo: analise.publico_alvo,
        areas_tematicas: analise.areas_tematicas,
        valor_minimo: analise.valor_minimo,
        valor_maximo: analise.valor_maximo,
        prazo_submissao: analise.prazo_submissao,
        regiao: analise.regiao,
        porte_empresa: analise.porte_empresa,
        resumo_ia: analise.resumo_executivo,
        proximos_passos: analise.proximos_passos,
        score_aderencia: Math.max(analise.nexia.score, analise.nct.score),
        score_nexia: analise.nexia.score,
        score_nct: analise.nct.score,
        analise_nexia: analise.nexia,
        analise_nct: analise.nct,
        texto_completo: textoFinal.slice(0, 50000),
        analisado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', edital_id)

    return NextResponse.json(analise)
  }

  const { data } = await supabase
    .from('editais')
    .insert({
      titulo: analise.titulo,
      orgao: analise.orgao,
      modalidade: analise.modalidade,
      publico_alvo: analise.publico_alvo,
      areas_tematicas: analise.areas_tematicas,
      valor_minimo: analise.valor_minimo,
      valor_maximo: analise.valor_maximo,
      prazo_submissao: analise.prazo_submissao,
      regiao: analise.regiao,
      porte_empresa: analise.porte_empresa,
      resumo_ia: analise.resumo_executivo,
      proximos_passos: analise.proximos_passos,
      score_aderencia: Math.max(analise.nexia.score, analise.nct.score),
      score_nexia: analise.nexia.score,
      score_nct: analise.nct.score,
      analise_nexia: analise.nexia,
      analise_nct: analise.nct,
      texto_completo: textoFinal.slice(0, 50000),
      analisado_em: new Date().toISOString(),
      status: 'ativo',
    })
    .select('id')
    .single()

  return NextResponse.json({ ...analise, edital_id: data?.id })
}
