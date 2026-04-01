'use client'
import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { AnimatedList } from '@/components/ui/AnimatedList'
import { Radio, RefreshCw, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import type { Fonte } from '@/types'

export default function FontesPage() {
  const [fontes, setFontes] = useState<Fonte[]>([])
  const [loading, setLoading] = useState(true)
  const [coletando, setColetando] = useState(false)

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/fontes')
    const data = await res.json()
    setFontes(data.fontes || [])
    setLoading(false)
  }

  async function iniciarColeta() {
    setColetando(true)
    await fetch('/api/coletar', { method: 'POST' })
    await carregar()
    setColetando(false)
  }

  useEffect(() => { carregar() }, [])

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">Fontes de Coleta</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">Gerencie as fontes de editais monitoradas</p>
        </div>
        <button
          onClick={iniciarColeta}
          disabled={coletando}
          className="flex items-center gap-2 bg-[#46347F] hover:bg-[#3a2d6e] disabled:opacity-60 text-white rounded-lg h-9 px-4 text-[13px] font-medium transition-colors"
        >
          <RefreshCw size={14} className={coletando ? 'animate-spin' : ''} />
          {coletando ? 'Coletando...' : 'Coletar Todas'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-black/[0.07] p-4 h-[80px] animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatedList className="space-y-3">
          {fontes.map(fonte => (
            <div key={fonte.id} className="bg-white rounded-xl border border-black/[0.07] p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-[8px] bg-[#f0edf8] flex items-center justify-center flex-shrink-0">
                <Radio size={16} className="text-[#46347F]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[14px] font-semibold text-[#1a1523]">{fonte.nome}</p>
                  {fonte.ativa ? (
                    <CheckCircle2 size={13} className="text-[#3b6d11]" />
                  ) : (
                    <XCircle size={13} className="text-[#a32d2d]" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-[12px] text-[#9ca3af]">
                  <span className="capitalize">{fonte.tipo}</span>
                  <span>{fonte.total_coletados} editais</span>
                  {fonte.ultima_coleta && (
                    <span>Ultima: {new Date(fonte.ultima_coleta).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
              <a
                href={fonte.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9ca3af] hover:text-[#46347F] transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </AnimatedList>
      )}
    </PageTransition>
  )
}
