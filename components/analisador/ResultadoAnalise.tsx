'use client'
import { motion } from 'framer-motion'
import {
  CheckCircle2, AlertCircle, XCircle,
  Building2, Calendar, Banknote, MapPin, Users,
  FileText, ExternalLink
} from 'lucide-react'
import type { AnaliseCompleta, AnaliseEmpresa } from '@/types'
import Link from 'next/link'

interface Props {
  analise: AnaliseCompleta
  editalId?: string | null
}

const recomendacaoConfig = {
  candidatar: {
    label: 'Candidatar',
    icon: CheckCircle2,
    className: 'bg-[#eaf3de] text-[#3b6d11] border-[#c0dd97]/50',
  },
  avaliar: {
    label: 'Avaliar',
    icon: AlertCircle,
    className: 'bg-[#faeeda] text-[#854f0b] border-[#fac775]/50',
  },
  ignorar: {
    label: 'Ignorar',
    icon: XCircle,
    className: 'bg-[#f3f4f6] text-[#6b7280] border-black/[0.06]',
  },
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#3b6d11' : score >= 40 ? '#854f0b' : '#9ca3af'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-[#f4f3f8] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[13px] font-bold w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

function EmpresaCard({ nome, analise }: { nome: string; analise: AnaliseEmpresa }) {
  const rec = recomendacaoConfig[analise.recomendacao]
  const RecIcon = rec.icon

  return (
    <div className="bg-white rounded-xl border border-black/[0.07] overflow-hidden">
      <div className="px-4 py-3 border-b border-black/[0.06] flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#1a1523]">{nome}</span>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${rec.className}`}>
          <RecIcon size={11} />
          {rec.label}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-2">
            Score de aderencia
          </label>
          <ScoreBar score={analise.score} />
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-1.5">
            Analise
          </label>
          <p className="text-[13px] text-[#374151] leading-relaxed">{analise.justificativa}</p>
        </div>

        {analise.pontos_fortes.length > 0 && (
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-2">
              Pontos favoraveis
            </label>
            <ul className="space-y-1.5">
              {analise.pontos_fortes.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-[#374151]">
                  <CheckCircle2 size={12} className="text-[#3b6d11] mt-0.5 flex-shrink-0" />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analise.pontos_atencao.length > 0 && (
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-2">
              Pontos de atencao
            </label>
            <ul className="space-y-1.5">
              {analise.pontos_atencao.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-[#374151]">
                  <AlertCircle size={12} className="text-[#854f0b] mt-0.5 flex-shrink-0" />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function ResultadoAnalise({ analise, editalId }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-5"
    >
      {/* Header do edital */}
      <div className="bg-white rounded-xl border border-black/[0.07] p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#1a1523] leading-snug mb-1">
              {analise.titulo}
            </h2>
            <p className="text-[12px] text-[#9ca3af] flex items-center gap-1.5">
              <Building2 size={11} />
              {analise.orgao}
            </p>
          </div>
          {editalId && (
            <Link
              href={`/editais/${editalId}`}
              className="flex-shrink-0 flex items-center gap-1.5 text-[12px] text-[#46347F] font-medium hover:opacity-80 transition-opacity"
            >
              Ver edital
              <ExternalLink size={11} />
            </Link>
          )}
        </div>

        <p className="text-[13px] text-[#374151] leading-relaxed mb-4 pb-4 border-b border-black/[0.06]">
          {analise.resumo_executivo}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {analise.valor_formatado && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#6b7280]">
              <Banknote size={12} className="text-[#9ca3af]" />
              {analise.valor_formatado}
            </span>
          )}
          {analise.prazo_formatado && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#6b7280]">
              <Calendar size={12} className="text-[#9ca3af]" />
              {analise.prazo_formatado}
            </span>
          )}
          {analise.regiao?.length > 0 && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#6b7280]">
              <MapPin size={12} className="text-[#9ca3af]" />
              {analise.regiao.join(', ')}
            </span>
          )}
          {analise.porte_empresa?.length > 0 && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#6b7280]">
              <Users size={12} className="text-[#9ca3af]" />
              {analise.porte_empresa.join(', ')}
            </span>
          )}
          {analise.contrapartida && analise.contrapartida_percentual && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#854f0b]">
              <AlertCircle size={12} />
              Contrapartida {analise.contrapartida_percentual}%
            </span>
          )}
        </div>
      </div>

      {/* Cards das empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <EmpresaCard nome="NexIA Lab" analise={analise.nexia} />
        <EmpresaCard nome="NCT Informatica" analise={analise.nct} />
      </div>

      {/* Proximos passos */}
      {analise.proximos_passos?.length > 0 && (
        <div className="bg-white rounded-xl border border-black/[0.07] overflow-hidden">
          <div className="px-4 py-3 border-b border-black/[0.06]">
            <span className="text-[13px] font-semibold text-[#1a1523]">Proximos passos</span>
          </div>
          <div className="p-4">
            <ol className="space-y-2.5">
              {analise.proximos_passos.map((passo, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#f0edf8] text-[#46347F] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-[#374151] leading-relaxed">{passo}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Documentos */}
      {analise.documentos_exigidos?.length > 0 && (
        <div className="bg-white rounded-xl border border-black/[0.07] overflow-hidden">
          <div className="px-4 py-3 border-b border-black/[0.06]">
            <span className="text-[13px] font-semibold text-[#1a1523]">Documentos tipicamente exigidos</span>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {analise.documentos_exigidos.map((doc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#f4f3f8] text-[#6b7280] border border-black/[0.06]"
                >
                  <FileText size={10} />
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
