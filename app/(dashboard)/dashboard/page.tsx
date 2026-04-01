'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { EditaisRecentes } from '@/components/dashboard/EditaisRecentes'
import { PrazoTimeline } from '@/components/dashboard/PrazoTimeline'
import { FileText, Radio, Bell, TrendingUp } from 'lucide-react'
import type { Edital } from '@/types'

export default function DashboardPage() {
  const [totalEditais, setTotalEditais] = useState(0)
  const [ativos, setAtivos] = useState(0)
  const [vencendo, setVencendo] = useState(0)
  const [editaisRecentes, setEditaisRecentes] = useState<Edital[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [resAll, resAtivos, resVencendo] = await Promise.all([
          fetch('/api/editais?limit=1'),
          fetch('/api/editais?status=ativo&limit=1'),
          fetch('/api/editais?status=vencendo&limit=1'),
        ])

        const [all, act, venc] = await Promise.all([
          resAll.json(),
          resAtivos.json(),
          resVencendo.json(),
        ])

        setTotalEditais(all.total || 0)
        setAtivos(act.total || 0)
        setVencendo(venc.total || 0)

        // Get top editais by score
        const resTop = await fetch('/api/editais?limit=5')
        const top = await resTop.json()
        setEditaisRecentes(top.editais || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">Dashboard</h1>
        <p className="text-[13px] text-[#6b7280] mt-1">Visao geral das oportunidades de fomento</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total de Editais"
          value={totalEditais}
          icon={FileText}
        />
        <MetricCard
          label="Abertos"
          value={ativos}
          icon={TrendingUp}
          delta="atualizado agora"
          deltaType="positive"
        />
        <MetricCard
          label="Vencendo"
          value={vencendo}
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
          <EditaisRecentes editais={editaisRecentes} />
        </div>
        <div>
          <PrazoTimeline editais={editaisRecentes} />
        </div>
      </div>
    </PageTransition>
  )
}
