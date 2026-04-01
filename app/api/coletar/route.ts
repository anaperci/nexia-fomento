import { createClient } from '@/lib/supabase/server'
import { coletarFinep } from '@/lib/scrapers/finep'
import { coletarFapesp } from '@/lib/scrapers/fapesp'
import { NextResponse } from 'next/server'

function parsePrazoBR(prazo: string): string | null {
  if (!prazo) return null
  const parts = prazo.split('/')
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  return null
}

type EditalGenerico = {
  titulo: string
  url: string
  publico?: string
  tema?: string
  prazoEnvio?: string
  fonte: string
  resumo?: string
} & Record<string, unknown>

async function inserirEditais(
  supabase: ReturnType<typeof createClient>,
  editais: EditalGenerico[],
  nomeFonte: string
) {
  let novos = 0, erros = 0

  const { data: fonte } = await supabase
    .from('fontes')
    .select('id')
    .eq('nome', nomeFonte)
    .single()

  for (const edital of editais) {
    const { data: existente } = await supabase
      .from('editais')
      .select('id')
      .eq('url_original', edital.url)
      .single()

    if (!existente) {
      const prazoDate = parsePrazoBR(edital.prazoEnvio || '')
      let status = 'ativo'
      if (prazoDate) {
        const diasRestantes = Math.ceil((new Date(prazoDate).getTime() - Date.now()) / 86400000)
        if (diasRestantes <= 15) status = 'vencendo'
        if (diasRestantes <= 0) status = 'encerrado'
      }

      const { error } = await supabase.from('editais').insert({
        fonte_id: fonte?.id,
        titulo: edital.titulo,
        url_original: edital.url,
        orgao: nomeFonte,
        publico_alvo: edital.publico ? [edital.publico] : [],
        areas_tematicas: edital.tema ? edital.tema.split(';').map((t: string) => t.trim()).filter(Boolean) : [],
        prazo_submissao: prazoDate,
        descricao: edital.resumo || null,
        status,
        dados_brutos: edital,
      })

      if (!error) novos++
      else erros++
    }
  }

  await supabase
    .from('fontes')
    .update({ ultima_coleta: new Date().toISOString(), total_coletados: editais.length })
    .eq('nome', nomeFonte)

  return { novos, erros }
}

export async function POST() {
  const supabase = createClient()
  const resultados = { coletados: 0, novos: 0, erros: 0, fontes: {} as Record<string, { coletados: number; novos: number }> }

  // Coletar em paralelo
  const [editaisFinepRaw, editaisFapespRaw] = await Promise.all([
    coletarFinep().catch(() => []),
    coletarFapesp().catch(() => []),
  ])

  // Filtrar apenas editais com prazo futuro (pelo menos 3 dias)
  const hoje = new Date()
  hoje.setDate(hoje.getDate() + 3)

  function prazoValido(prazo: string | undefined): boolean {
    if (!prazo) return true // sem prazo = manter
    const parsed = parsePrazoBR(prazo)
    if (!parsed) return true
    return new Date(parsed) >= hoje
  }

  const editaisFinep = editaisFinepRaw.filter(e => prazoValido(e.prazoEnvio))
  const editaisFapesp = editaisFapespRaw.filter(e => prazoValido(e.prazoEnvio))

  // FINEP
  resultados.coletados += editaisFinep.length
  const finepResult = await inserirEditais(supabase, editaisFinep as unknown as EditalGenerico[], 'FINEP')
  resultados.novos += finepResult.novos
  resultados.erros += finepResult.erros
  resultados.fontes['FINEP'] = { coletados: editaisFinep.length, novos: finepResult.novos }

  // FAPESP
  resultados.coletados += editaisFapesp.length
  const fapespResult = await inserirEditais(supabase, editaisFapesp as unknown as EditalGenerico[], 'FAPESP')
  resultados.novos += fapespResult.novos
  resultados.erros += fapespResult.erros
  resultados.fontes['FAPESP'] = { coletados: editaisFapesp.length, novos: fapespResult.novos }

  return NextResponse.json(resultados)
}
