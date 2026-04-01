'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { EditalCard } from '@/components/editais/EditalCard'
import { AnimatedList } from '@/components/ui/AnimatedList'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react'
import type { Edital } from '@/types'

export default function EditaisPage() {
  const [editais, setEditais] = useState<Edital[]>([])
  const [busca, setBusca] = useState('')
  const [modalidade, setModalidade] = useState('')
  const [scoreMin, setScoreMin] = useState('')
  const [loading, setLoading] = useState(true)
  const [coletando, setColetando] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (modalidade) params.set('modalidade', modalidade)
    if (scoreMin) params.set('score_min', scoreMin)

    const res = await fetch(`/api/editais?${params}`)
    const data = await res.json()
    setEditais(data.editais || [])
    setLoading(false)
  }, [busca, modalidade, scoreMin])

  async function iniciarColeta() {
    setColetando(true)
    await fetch('/api/coletar', { method: 'POST' })
    await carregar()
    setColetando(false)
  }

  useEffect(() => { carregar() }, [carregar])

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">Editais</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">{editais.length} oportunidades encontradas</p>
        </div>
        <button
          onClick={iniciarColeta}
          disabled={coletando}
          className="flex items-center gap-2 bg-[#46347F] hover:bg-[#3a2d6e] disabled:opacity-60 text-white rounded-lg h-9 px-4 text-[13px] font-medium transition-colors"
        >
          <RefreshCw size={14} className={coletando ? 'animate-spin' : ''} />
          {coletando ? 'Coletando...' : 'Atualizar'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-black/[0.07] p-4 mb-5 flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar editais..."
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8] bg-[#f9f8fc]"
          />
        </div>
        <select
          value={modalidade}
          onChange={e => setModalidade(e.target.value)}
          className="h-9 rounded-lg border border-black/[0.08] text-[13px] text-[#6b7280] bg-[#f9f8fc] px-3 focus:outline-none focus:ring-2 focus:ring-[#46347F]/20"
        >
          <option value="">Modalidade</option>
          <option value="subvencao">Subvencao</option>
          <option value="credito">Credito</option>
          <option value="premio">Premio</option>
          <option value="bolsa">Bolsa</option>
        </select>
        <select
          value={scoreMin}
          onChange={e => setScoreMin(e.target.value)}
          className="h-9 rounded-lg border border-black/[0.08] text-[13px] text-[#6b7280] bg-[#f9f8fc] px-3 focus:outline-none focus:ring-2 focus:ring-[#46347F]/20"
        >
          <option value="">Score minimo</option>
          <option value="80">80+ (alta aderencia)</option>
          <option value="60">60+ (boa aderencia)</option>
          <option value="40">40+ (aderencia parcial)</option>
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : editais.length > 0 ? (
        <AnimatedList className="space-y-3">
          {editais.map(edital => (
            <EditalCard key={edital.id} edital={edital} />
          ))}
        </AnimatedList>
      ) : (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-xl bg-[#f0edf8] flex items-center justify-center mx-auto mb-3">
            <SlidersHorizontal size={20} className="text-[#46347F]/40" />
          </div>
          <p className="text-[14px] font-medium text-[#1a1523] mb-1">Nenhum edital encontrado</p>
          <p className="text-[12px] text-[#9ca3af] mb-4">Ajuste os filtros ou inicie uma nova coleta.</p>
          <button
            onClick={iniciarColeta}
            className="bg-[#46347F] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#3a2d6e] transition-colors"
          >
            Coletar editais
          </button>
        </div>
      )}
    </PageTransition>
  )
}
