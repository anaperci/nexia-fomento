'use client'
import { Search } from 'lucide-react'

interface Props {
  busca: string
  onBuscaChange: (v: string) => void
  modalidade: string
  onModalidadeChange: (v: string) => void
  scoreMin: string
  onScoreMinChange: (v: string) => void
}

export function EditalFiltros({
  busca, onBuscaChange,
  modalidade, onModalidadeChange,
  scoreMin, onScoreMinChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-black/[0.07] p-4 mb-5 flex gap-3">
      <div className="flex-1 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={busca}
          onChange={e => onBuscaChange(e.target.value)}
          placeholder="Buscar editais..."
          className="w-full pl-9 pr-3 h-9 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8] bg-[#f9f8fc]"
        />
      </div>
      <select
        value={modalidade}
        onChange={e => onModalidadeChange(e.target.value)}
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
        onChange={e => onScoreMinChange(e.target.value)}
        className="h-9 rounded-lg border border-black/[0.08] text-[13px] text-[#6b7280] bg-[#f9f8fc] px-3 focus:outline-none focus:ring-2 focus:ring-[#46347F]/20"
      >
        <option value="">Score minimo</option>
        <option value="80">80+ (alta aderencia)</option>
        <option value="60">60+ (boa aderencia)</option>
        <option value="40">40+ (aderencia parcial)</option>
      </select>
    </div>
  )
}
