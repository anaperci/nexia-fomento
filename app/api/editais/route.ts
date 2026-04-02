import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)

  const modalidade = searchParams.get('modalidade')
  const status = searchParams.get('status')
  const scoreMin = searchParams.get('score_min')
  const busca = searchParams.get('busca')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  let query = supabase
    .from('editais')
    .select('*, fontes(nome)', { count: 'exact' })
    .or('score_aderencia.gte.30,score_aderencia.is.null')
    .order('coletado_em', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (modalidade) query = query.eq('modalidade', modalidade)
  if (status) query = query.eq('status', status)
  if (scoreMin) query = query.gte('score_aderencia', parseInt(scoreMin))
  if (busca) query = query.ilike('titulo', `%${busca}%`)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ editais: data, total: count, page, limit })
}
