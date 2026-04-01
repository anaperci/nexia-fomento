'use client'
import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { AnimatedList } from '@/components/ui/AnimatedList'
import { Bell, Plus, Trash2, Mail, MessageCircle } from 'lucide-react'
import type { Alerta } from '@/types'

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/fontes') // placeholder - alertas endpoint
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">Alertas</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">Configure notificacoes para editais relevantes</p>
        </div>
        <button className="flex items-center gap-2 bg-[#46347F] hover:bg-[#3a2d6e] text-white rounded-lg h-9 px-4 text-[13px] font-medium transition-colors">
          <Plus size={14} />
          Novo Alerta
        </button>
      </div>

      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-xl bg-[#f0edf8] flex items-center justify-center mx-auto mb-3">
          <Bell size={20} className="text-[#46347F]/40" />
        </div>
        <p className="text-[14px] font-medium text-[#1a1523] mb-1">Nenhum alerta configurado</p>
        <p className="text-[12px] text-[#9ca3af] mb-4">Crie alertas para ser notificado sobre editais com alta aderencia.</p>
      </div>
    </PageTransition>
  )
}
