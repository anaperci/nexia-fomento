export const dynamic = 'force-dynamic'

import { PageTransition } from '@/components/layout/PageTransition'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { EditaisRecentes } from '@/components/dashboard/EditaisRecentes'
import { PrazoTimeline } from '@/components/dashboard/PrazoTimeline'
import { FileText, Radio, Bell, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()

  const [{ count: totalEditais }, { count: ativos }, { count: vencendo }] = await Promise.all([
    supabase.from('editais').select('*', { count: 'exact', head: true }),
    supabase.from('editais').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('editais').select('*', { count: 'exact', head: true }).eq('status', 'vencendo'),
  ])

  const { data: editaisRecentes } = await supabase
    .from('editais')
    .select('*')
    .eq('status', 'ativo')
    .order('score_aderencia', { ascending: false })
    .limit(5)

  const { data: editaisComPrazo } = await supabase
    .from('editais')
    .select('*')
    .not('prazo_submissao', 'is', null)
    .gte('prazo_submissao', new Date().toISOString().split('T')[0])
    .order('prazo_submissao', { ascending: true })
    .limit(5)

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">Dashboard</h1>
        <p className="text-[13px] text-[#6b7280] mt-1">Visao geral das oportunidades de fomento</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total de Editais"
          value={totalEditais || 0}
          icon={FileText}
        />
        <MetricCard
          label="Abertos"
          value={ativos || 0}
          icon={TrendingUp}
          delta="atualizado agora"
          deltaType="positive"
        />
        <MetricCard
          label="Vencendo"
          value={vencendo || 0}
          icon={Bell}
          delta="proximos 30 dias"
          deltaType="negative"
        />
        <MetricCard
          label="Fontes Ativas"
          value={6}
          icon={Radio}
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <EditaisRecentes editais={editaisRecentes || []} />
        </div>
        <div>
          <PrazoTimeline editais={editaisComPrazo || []} />
        </div>
      </div>
    </PageTransition>
  )
}
