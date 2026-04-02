import { createClient } from '@/lib/supabase/server'
import { coletarFinepCompleto } from '@/lib/scrapers/finep'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300

function parsePrazoBR(prazo: string): string | null {
  if (!prazo) return null
  const parts = prazo.split('/')
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  return null
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const modo = searchParams.get('modo') || 'completo' // 'completo' | 'rapido'

  const resultados = {
    coletados: 0,
    novos: 0,
    atualizados: 0,
    analisados: 0,
    erros: 0,
    detalhes: [] as Array<{ titulo: string; status: string; metodo?: string }>,
  }

  try {
    // === FINEP (coleta completa com PDF + analise) ===
    if (modo === 'completo') {
      const editais = await coletarFinepCompleto()
      resultados.coletados += editais.length

      const { data: fonte } = await supabase
        .from('fontes')
        .select('id')
        .eq('nome', 'FINEP')
        .single()

      for (const edital of editais) {
        // Filter out irrelevant editals identified by AI
        if (edital.analise && edital.analise.relevante === false) {
          console.log(`[COLETAR] Descartado pela IA: ${edital.titulo} — ${edital.analise.motivo_irrelevancia}`)
          resultados.detalhes.push({ titulo: edital.titulo, status: 'descartado', metodo: edital.metodo_extracao })
          continue
        }

        const { data: existente } = await supabase
          .from('editais')
          .select('id, analisado_em')
          .eq('url_original', edital.url_pagina)
          .single()

        let prazoDate: string | null = null
        if (edital.prazoEnvio) prazoDate = parsePrazoBR(edital.prazoEnvio)
        // If analysis extracted a prazo, prefer that
        if (edital.analise?.prazo_submissao) prazoDate = edital.analise.prazo_submissao

        const payload = {
          fonte_id: fonte?.id,
          titulo: edital.analise?.titulo || edital.titulo,
          url_original: edital.url_pagina,
          orgao: edital.orgao,
          publico_alvo: edital.analise?.publico_alvo || (edital.publico ? [edital.publico] : []),
          areas_tematicas: edital.analise?.areas_tematicas || (edital.tema ? edital.tema.split(';').map(t => t.trim()).filter(Boolean) : []),
          prazo_submissao: prazoDate,
          status: 'ativo' as const,
          texto_completo: edital.texto_completo,
          dados_brutos: { pdf_url: edital.pdf_url, metodo_extracao: edital.metodo_extracao },
          atualizado_em: new Date().toISOString(),
          ...(edital.analise ? {
            modalidade: edital.analise.modalidade,
            valor_minimo: edital.analise.valor_minimo,
            valor_maximo: edital.analise.valor_maximo,
            regiao: edital.analise.regiao,
            porte_empresa: edital.analise.porte_empresa,
            resumo_ia: edital.analise.resumo_executivo,
            proximos_passos: edital.analise.proximos_passos,
            score_aderencia: Math.max(edital.analise.nexia.score, edital.analise.nct.score),
            score_nexia: edital.analise.nexia.score,
            score_nct: edital.analise.nct.score,
            analise_nexia: edital.analise.nexia,
            analise_nct: edital.analise.nct,
            analisado_em: new Date().toISOString(),
          } : {}),
        }

        if (existente) {
          if (!existente.analisado_em && edital.analise) {
            await supabase.from('editais').update(payload).eq('id', existente.id)
            resultados.atualizados++
            if (edital.analise) resultados.analisados++
          }
          resultados.detalhes.push({ titulo: edital.titulo, status: 'existente' })
        } else {
          const { error } = await supabase.from('editais').insert(payload)
          if (!error) {
            resultados.novos++
            if (edital.analise) resultados.analisados++
            resultados.detalhes.push({ titulo: edital.titulo, status: 'novo', metodo: edital.metodo_extracao })
          } else {
            resultados.erros++
          }
        }
      }

      await supabase
        .from('fontes')
        .update({ ultima_coleta: new Date().toISOString(), total_coletados: editais.length })
        .eq('nome', 'FINEP')
    } else {
      // === Modo rapido (sem PDF, sem analise — como antes) ===
      const { coletarFinep } = await import('@/lib/scrapers/finep')
      const editaisFinep = await coletarFinep()
      resultados.coletados += editaisFinep.length

      const { data: fonte } = await supabase
        .from('fontes')
        .select('id')
        .eq('nome', 'FINEP')
        .single()

      for (const edital of editaisFinep) {
        const { data: existente } = await supabase
          .from('editais')
          .select('id')
          .eq('url_original', edital.url)
          .single()

        if (!existente) {
          const prazoDate = parsePrazoBR(edital.prazoEnvio || '')
          const { error } = await supabase.from('editais').insert({
            fonte_id: fonte?.id,
            titulo: edital.titulo,
            url_original: edital.url,
            orgao: 'FINEP',
            publico_alvo: edital.publico ? [edital.publico] : [],
            areas_tematicas: edital.tema ? edital.tema.split(';').map(t => t.trim()).filter(Boolean) : [],
            prazo_submissao: prazoDate,
            status: 'ativo',
            dados_brutos: edital,
          })
          if (!error) resultados.novos++
          else resultados.erros++
          resultados.detalhes.push({ titulo: edital.titulo, status: 'novo' })
        }
      }

      await supabase
        .from('fontes')
        .update({ ultima_coleta: new Date().toISOString(), total_coletados: editaisFinep.length })
        .eq('nome', 'FINEP')
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Erro na coleta:', msg)
    return NextResponse.json({ error: msg, ...resultados }, { status: 500 })
  }

  return NextResponse.json(resultados)
}
