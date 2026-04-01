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

        // Parse prazo DD/MM/YYYY to YYYY-MM-DD
        let prazoDate: string | null = null
        if (edital.prazoEnvio) {
          const parts = edital.prazoEnvio.split('/')
          if (parts.length === 3) {
            prazoDate = `${parts[2]}-${parts[1]}-${parts[0]}`
          }
        }

        const { error } = await supabase.from('editais').insert({
          fonte_id: fonte?.id,
          titulo: edital.titulo,
          url_original: edital.url,
          orgao: 'FINEP',
          publico_alvo: edital.publico ? [edital.publico] : [],
          areas_tematicas: edital.tema ? edital.tema.split(';').map((t: string) => t.trim()).filter(Boolean) : [],
          prazo_submissao: prazoDate,
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
