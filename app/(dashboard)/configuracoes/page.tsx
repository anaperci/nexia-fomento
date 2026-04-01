'use client'
import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { Building2, Save } from 'lucide-react'
import type { PerfilEmpresa } from '@/types'

export default function ConfiguracoesPage() {
  const [perfil, setPerfil] = useState<Partial<PerfilEmpresa>>({
    nome: '',
    cnpj: '',
    setor: [],
    porte: undefined,
    regiao: '',
    areas_interesse: [],
    palavras_chave: [],
  })
  const [saving, setSaving] = useState(false)
  const [setorInput, setSetorInput] = useState('')
  const [areasInput, setAreasInput] = useState('')
  const [kwInput, setKwInput] = useState('')

  useEffect(() => {
    fetch('/api/fontes').then(r => r.json()).catch(() => {})
  }, [])

  async function salvar() {
    setSaving(true)
    // TODO: save to supabase
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">Configuracoes</h1>
        <p className="text-[13px] text-[#6b7280] mt-1">Perfil da empresa para calculo de aderencia</p>
      </div>

      <div className="bg-white rounded-xl border border-black/[0.07] p-6 max-w-2xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-[8px] bg-[#f0edf8] flex items-center justify-center">
            <Building2 size={16} className="text-[#46347F]" />
          </div>
          <h2 className="text-[16px] font-semibold text-[#1a1523]">Perfil da Empresa</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] block mb-1.5">Nome da empresa</label>
            <input
              value={perfil.nome}
              onChange={e => setPerfil(p => ({ ...p, nome: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] block mb-1.5">CNPJ</label>
              <input
                value={perfil.cnpj}
                onChange={e => setPerfil(p => ({ ...p, cnpj: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] block mb-1.5">Porte</label>
              <select
                value={perfil.porte || ''}
                onChange={e => setPerfil(p => ({ ...p, porte: e.target.value as PerfilEmpresa['porte'] }))}
                className="w-full h-9 px-3 rounded-lg border border-black/[0.08] text-[13px] text-[#6b7280] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20"
              >
                <option value="">Selecione</option>
                <option value="mei">MEI</option>
                <option value="micro">Microempresa</option>
                <option value="pequena">Pequena Empresa</option>
                <option value="media">Media Empresa</option>
                <option value="grande">Grande Empresa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] block mb-1.5">Regiao</label>
            <input
              value={perfil.regiao}
              onChange={e => setPerfil(p => ({ ...p, regiao: e.target.value }))}
              placeholder="Ex: sudeste, nacional..."
              className="w-full h-9 px-3 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] placeholder:text-[#9ca3af] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] block mb-1.5">Areas de interesse (separadas por virgula)</label>
            <input
              value={areasInput}
              onChange={e => setAreasInput(e.target.value)}
              onBlur={() => setPerfil(p => ({ ...p, areas_interesse: areasInput.split(',').map(s => s.trim()).filter(Boolean) }))}
              placeholder="Ex: inteligencia artificial, biotecnologia, IoT..."
              className="w-full h-9 px-3 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] placeholder:text-[#9ca3af] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] block mb-1.5">Palavras-chave (separadas por virgula)</label>
            <input
              value={kwInput}
              onChange={e => setKwInput(e.target.value)}
              onBlur={() => setPerfil(p => ({ ...p, palavras_chave: kwInput.split(',').map(s => s.trim()).filter(Boolean) }))}
              placeholder="Ex: startup, SaaS, deep tech..."
              className="w-full h-9 px-3 rounded-lg border border-black/[0.08] text-[13px] text-[#1a1523] placeholder:text-[#9ca3af] bg-[#f9f8fc] focus:outline-none focus:ring-2 focus:ring-[#46347F]/20 focus:border-[#c4b8e8]"
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-black/[0.06]">
          <button
            onClick={salvar}
            disabled={saving}
            className="flex items-center gap-2 bg-[#46347F] hover:bg-[#3a2d6e] disabled:opacity-60 text-white rounded-lg h-9 px-4 text-[13px] font-medium transition-colors"
          >
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      </div>
    </PageTransition>
  )
}
