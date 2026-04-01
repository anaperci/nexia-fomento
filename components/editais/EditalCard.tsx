'use client'
import { motion } from 'framer-motion'
import { Calendar, Building2, ExternalLink, TrendingUp } from 'lucide-react'
import type { Edital } from '@/types'
import { EditalBadge } from './EditalBadge'
import { ScoreGauge } from './ScoreGauge'
import Link from 'next/link'

interface Props {
  edital: Edital
}

export function EditalCard({ edital }: Props) {
  const prazoFormatado = edital.prazo_submissao
    ? new Date(edital.prazo_submissao).toLocaleDateString('pt-BR')
    : null

  const diasRestantes = edital.prazo_submissao
    ? Math.ceil((new Date(edital.prazo_submissao).getTime() - Date.now()) / 86400000)
    : null

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-xl border border-black/[0.07] p-4 flex gap-4 cursor-pointer hover:border-[#c4b8e8] transition-colors"
    >
      {edital.score_aderencia != null && (
        <div className="flex-shrink-0">
          <ScoreGauge score={edital.score_aderencia} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link
            href={`/editais/${edital.id}`}
            className="text-[14px] font-semibold text-[#1a1523] hover:text-[#46347F] transition-colors leading-tight line-clamp-2"
          >
            {edital.titulo}
          </Link>
          {edital.url_original && (
            <a
              href={edital.url_original}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-[#9ca3af] hover:text-[#46347F] transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-2.5">
          {edital.orgao && (
            <span className="flex items-center gap-1 text-[12px] text-[#6b7280]">
              <Building2 size={11} className="text-[#9ca3af]" />
              {edital.orgao}
            </span>
          )}
          {prazoFormatado && (
            <span className="flex items-center gap-1 text-[12px] text-[#6b7280]">
              <Calendar size={11} className="text-[#9ca3af]" />
              {prazoFormatado}
              {diasRestantes != null && diasRestantes > 0 && diasRestantes <= 30 && (
                <span className="text-[#854f0b] font-medium ml-0.5">({diasRestantes}d)</span>
              )}
            </span>
          )}
          {edital.valor_maximo && (
            <span className="flex items-center gap-1 text-[12px] text-[#6b7280]">
              <TrendingUp size={11} className="text-[#9ca3af]" />
              ate {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(edital.valor_maximo)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <EditalBadge type="status" value={edital.status} />
          {edital.modalidade && <EditalBadge type="modalidade" value={edital.modalidade} />}
          {edital.areas_tematicas?.slice(0, 2).map(area => (
            <EditalBadge key={area} type="area" value={area} />
          ))}
          {(edital.areas_tematicas?.length || 0) > 2 && (
            <span className="text-[11px] text-[#9ca3af] px-2 py-0.5">
              +{(edital.areas_tematicas?.length || 0) - 2}
            </span>
          )}
        </div>

        {edital.resumo_ia && (
          <p className="text-[12px] text-[#6b7280] leading-relaxed line-clamp-2">
            {edital.resumo_ia}
          </p>
        )}
      </div>
    </motion.div>
  )
}
