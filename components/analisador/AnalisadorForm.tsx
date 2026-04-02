'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Link, FileText, Loader2 } from 'lucide-react'
import type { AnaliseCompleta } from '@/types'

interface Props {
  onResult: (analise: AnaliseCompleta, editalId?: string) => void
}

export function AnalisadorForm({ onResult }: Props) {
  const [modo, setModo] = useState<'texto' | 'url'>('texto')
  const [texto, setTexto] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function analisar() {
    if (modo === 'texto' && !texto.trim()) return
    if (modo === 'url' && !url.trim()) return

    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          modo === 'texto' ? { texto } : { url }
        ),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao analisar o edital.')
      }

      const data = await res.json()
      onResult(data, data.edital_id)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-black/[0.07] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-black/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-[8px] bg-[#f0edf8] flex items-center justify-center">
          <Sparkles size={14} className="text-[#46347F]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#1a1523]">Analise com IA</p>
          <p className="text-[11px] text-[#9ca3af]">Powered by Claude Opus</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-1 p-1 bg-[#f4f3f8] rounded-lg w-fit mb-5">
          {([
            { key: 'texto' as const, label: 'Colar texto', icon: FileText },
            { key: 'url' as const, label: 'Usar URL', icon: Link },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setModo(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                modo === key
                  ? 'bg-white text-[#1a1523] shadow-sm border border-black/[0.06]'
                  : 'text-[#6b7280] hover:text-[#1a1523]'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {modo === 'texto' ? (
          <div className="mb-4">
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-2">
              Texto do edital
            </label>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Cole aqui o texto completo do edital, chamada publica ou descricao da oportunidade..."
              rows={10}
              className="w-full px-3 py-2.5 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] placeholder:text-[#9ca3af] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8] resize-y leading-relaxed"
            />
            <p className="text-[11px] text-[#9ca3af] mt-1.5">
              {texto.length.toLocaleString('pt-BR')} caracteres
              {texto.length > 5000 && ' — Otimo, mais contexto = analise mais precisa'}
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-2">
              URL do edital
            </label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.finep.gov.br/chamadas-publicas/..."
              className="w-full px-3 h-10 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] placeholder:text-[#9ca3af] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8]"
            />
            <p className="text-[11px] text-[#9ca3af] mt-1.5">
              O sistema vai tentar extrair o texto da pagina automaticamente
            </p>
          </div>
        )}

        {erro && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-[#fcebeb] border border-[#f09595]/40">
            <p className="text-[12px] text-[#a32d2d]">{erro}</p>
          </div>
        )}

        <motion.button
          onClick={analisar}
          disabled={loading || (modo === 'texto' ? !texto.trim() : !url.trim())}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className="flex items-center gap-2 bg-[#46347F] hover:bg-[#3a2d6e] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg h-10 px-5 text-[13px] font-medium transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analisando com IA...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Analisar edital
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
