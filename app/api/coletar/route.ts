import { createClient } from '@/lib/supabase/server'
import { coletarFinep } from '@/lib/scrapers/finep'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()
  const resultados = { coletados: 0, novos: 0, erros: 0 }

  try {
    const editaisFinep = await coletarFinep()
    resultados.coletados += editaisFinep.length

    for (const edital of editaisFinep) {
      const { data: existente } = await supabase
        .from('editais')
        .select('id')
        .eq('url_original', edital.url)
        .single()

      if (!existente) {
        const { data: fonte } = await supabase
          .from('fontes')
          .select('id')
          .eq('nome', 'FINEP')
          .single()

        const { error } = await supabase.from('editais').insert({
          fonte_id: fonte?.id,
          titulo: edital.titulo,
          url_original: edital.url,
          orgao: 'FINEP',
          publico_alvo: edital.publico ? [edital.publico] : [],
          status: 'ativo',
          dados_brutos: edital
        })

        if (!error) resultados.novos++
        else resultados.erros++
      }
    }

    await supabase
      .from('fontes')
      .update({ ultima_coleta: new Date().toISOString(), total_coletados: editaisFinep.length })
      .eq('nome', 'FINEP')

  } catch (error) {
    console.error('Erro na coleta:', error)
    resultados.erros++
  }

  return NextResponse.json(resultados)
}
