'use client'
import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { motion } from 'framer-motion'
import { Radio, RefreshCw, CheckCircle2, AlertCircle, Clock, FileText, Sparkles } from 'lucide-react'

interface Fonte {
  id: string
  nome: string
  url: string
  tipo: string
  ativa: boolean
  ultima_coleta: string | null
  total_coletados: number
}

interface ResultadoColeta {
  coletados: number
  novos: number
  atualizados: number
  analisados: number
  erros: number
  detalhes: Array<{ titulo: string; status: string; metodo?: string }>
}

export default function FontesPage() {
  const [fontes, setFontes] = useState<Fonte[]>([])
  const [coletando, setColetando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoColeta | null>(null)
  const [progresso, setProgresso] = useState('')
  const [modo, setModo] = useState<'completo' | 'rapido'>('completo')

  async function carregarFontes() {
    const res = await fetch('/api/fontes')
    const data = await res.json()
    setFontes(data.fontes || [])
  }

  async function iniciarColeta() {
    setColetando(true)
    setResultado(null)
    setProgresso('Iniciando coleta...')

    const mensagens = [
      'Acessando listagem da FINEP...',
      'Encontrando editais abertos...',
      'Baixando PDFs dos editais...',
      'Extraindo texto dos documentos...',
      'Analisando com IA (NexIA + NCT)...',
      'Coletando FAPESP...',
      'Salvando no banco de dados...',
    ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % mensagens.length
      setProgresso(mensagens[idx])
    }, 4000)

    try {
      const res = await fetch(`/api/coletar?modo=${modo}`, { method: 'POST' })
      const data = await res.json()
      setResultado(data)
      await carregarFontes()
    } finally {
      clearInterval(interval)
      setColetando(false)
      setProgresso('')
    }
  }

  useEffect(() => { carregarFontes() }, [])

  const metodoLabel: Record<string, { label: string; color: string }> = {
    texto:   { label: 'PDF texto',     color: 'bg-[#eaf3de] text-[#3b6d11]' },
    nativo:  { label: 'PDF escaneado', color: 'bg-[#e6f1fb] text-[#185fa5]' },
    sem_pdf: { label: 'Sem PDF',       color: 'bg-[#faeeda] text-[#854f0b]' },
    erro:    { label: 'Erro',          color: 'bg-[#fcebeb] text-[#a32d2d]' },
    descartado: { label: 'Irrelevante', color: 'bg-[#f3f4f6] text-[#9ca3af]' },
  }

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">Fontes</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">
            Coleta automatica com extracao de PDF e analise IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={modo}
            onChange={e => setModo(e.target.value as 'completo' | 'rapido')}
            disabled={coletando}
            className="h-9 rounded-lg border border-black/[0.08] text-[12px] text-[#6b7280] bg-[#f9f8fc] px-2 focus:outline-none"
          >
            <option value="completo">Completo (PDF + IA)</option>
            <option value="rapido">Rapido (sem PDF)</option>
          </select>
          <motion.button
            onClick={iniciarColeta}
            disabled={coletando}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-[#46347F] hover:bg-[#3a2d6e] disabled:opacity-60 text-white rounded-lg h-9 px-4 text-[13px] font-medium transition-colors"
          >
            <RefreshCw size={14} className={coletando ? 'animate-spin' : ''} />
            {coletando ? 'Coletando...' : 'Iniciar coleta'}
          </motion.button>
        </div>
      </div>

      {coletando && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f0edf8] border border-[#c4b8e8] rounded-xl px-5 py-4 mb-5 flex items-center gap-3"
        >
          <div className="w-7 h-7 rounded-full border-2 border-[#46347F] border-t-transparent animate-spin flex-shrink-0" />
          <div>
            <p className="text-[13px] font-medium text-[#46347F]">{progresso}</p>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">
              {modo === 'completo'
                ? 'Isso pode levar alguns minutos — baixando PDFs e analisando cada edital com IA'
                : 'Coleta rapida — sem download de PDF'}
            </p>
          </div>
        </motion.div>
      )}

      {resultado && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-black/[0.07] overflow-hidden mb-5"
        >
          <div className="px-5 py-3.5 border-b border-black/[0.06] flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#3b6d11]" />
            <span className="text-[13px] font-semibold text-[#1a1523]">Coleta concluida</span>
          </div>

          <div className="grid grid-cols-5 divide-x divide-black/[0.06]">
            {[
              { label: 'Coletados',   value: resultado.coletados },
              { label: 'Novos',       value: resultado.novos },
              { label: 'Atualizados', value: resultado.atualizados },
              { label: 'Analisados',  value: resultado.analisados },
              { label: 'Erros',       value: resultado.erros },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3 text-center">
                <p className="text-[11px] text-[#9ca3af] uppercase tracking-[0.06em] mb-1">{label}</p>
                <p className="text-[20px] font-bold text-[#1a1523]">{value}</p>
              </div>
            ))}
          </div>

          {resultado.detalhes.length > 0 && (
            <div className="border-t border-black/[0.06]">
              <div className="px-5 py-2.5 bg-[#f9f8fc]">
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af]">
                  Editais processados
                </p>
              </div>
              <div className="divide-y divide-black/[0.04] max-h-64 overflow-y-auto">
                {resultado.detalhes.map((d, i) => {
                  const m = d.metodo ? metodoLabel[d.metodo] : null
                  return (
                    <div key={i} className="px-5 py-2.5 flex items-center gap-3">
                      <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        d.status === 'novo' ? 'bg-[#eaf3de] text-[#3b6d11]' : 'bg-[#f3f4f6] text-[#6b7280]'
                      }`}>
                        {d.status === 'novo' ? 'Novo' : 'Existente'}
                      </span>
                      <p className="text-[12px] text-[#374151] flex-1 truncate">{d.titulo}</p>
                      {m && (
                        <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${m.color}`}>
                          {m.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Lista de fontes */}
      <div className="bg-white rounded-xl border border-black/[0.07] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-black/[0.06]">
          <span className="text-[13px] font-semibold text-[#1a1523]">Fontes configuradas</span>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {fontes.map(fonte => (
            <div key={fonte.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-[8px] bg-[#f0edf8] flex items-center justify-center flex-shrink-0">
                <Radio size={14} className="text-[#46347F]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-semibold text-[#1a1523]">{fonte.nome}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    fonte.ativa ? 'bg-[#eaf3de] text-[#3b6d11]' : 'bg-[#f3f4f6] text-[#9ca3af]'
                  }`}>
                    {fonte.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#e6f1fb] text-[#185fa5]">
                    {fonte.tipo}
                  </span>
                </div>
                <p className="text-[11px] text-[#9ca3af] truncate">{fonte.url}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {fonte.ultima_coleta ? (
                  <>
                    <p className="text-[12px] font-medium text-[#374151]">
                      {fonte.total_coletados} editais
                    </p>
                    <p className="text-[11px] text-[#9ca3af] flex items-center gap-1 justify-end mt-0.5">
                      <Clock size={10} />
                      {new Date(fonte.ultima_coleta).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-[#9ca3af]">Nunca coletado</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
