export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/layout/PageTransition'
import { EditalBadge } from '@/components/editais/EditalBadge'
import { ScoreGauge } from '@/components/editais/ScoreGauge'
import { ArrowLeft, ExternalLink, Calendar, Building2, Users, MapPin, DollarSign, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditalDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const { data: edital } = await supabase
    .from('editais')
    .select('*, fontes(nome)')
    .eq('id', id)
    .single()

  if (!edital) notFound()

  const prazoFormatado = edital.prazo_submissao
    ? new Date(edital.prazo_submissao).toLocaleDateString('pt-BR')
    : null

  return (
    <PageTransition>
      <Link href="/editais" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-[#46347F] transition-colors mb-6">
        <ArrowLeft size={14} />
        Voltar aos editais
      </Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Header */}
          <div className="bg-white rounded-xl border border-black/[0.07] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-[20px] font-bold text-[#1a1523] tracking-[-0.02em] leading-tight">
                {edital.titulo}
              </h1>
              {edital.url_original && (
                <a
                  href={edital.url_original}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] text-[#46347F] font-medium hover:opacity-80 flex-shrink-0"
                >
                  <ExternalLink size={12} />
                  Abrir original
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <EditalBadge type="status" value={edital.status} />
              {edital.modalidade && <EditalBadge type="modalidade" value={edital.modalidade} />}
              {edital.areas_tematicas?.map((area: string) => (
                <EditalBadge key={area} type="area" value={area} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {edital.orgao && (
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <Building2 size={13} className="text-[#9ca3af]" />
                  <span>{edital.orgao}</span>
                </div>
              )}
              {prazoFormatado && (
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <Calendar size={13} className="text-[#9ca3af]" />
                  <span>Prazo: {prazoFormatado}</span>
                </div>
              )}
              {(edital.valor_minimo || edital.valor_maximo) && (
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <DollarSign size={13} className="text-[#9ca3af]" />
                  <span>
                    {edital.valor_minimo && `R$ ${Number(edital.valor_minimo).toLocaleString('pt-BR')}`}
                    {edital.valor_minimo && edital.valor_maximo && ' - '}
                    {edital.valor_maximo && `R$ ${Number(edital.valor_maximo).toLocaleString('pt-BR')}`}
                  </span>
                </div>
              )}
              {edital.regiao?.length > 0 && (
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <MapPin size={13} className="text-[#9ca3af]" />
                  <span>{edital.regiao.join(', ')}</span>
                </div>
              )}
              {edital.publico_alvo?.length > 0 && (
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <Users size={13} className="text-[#9ca3af]" />
                  <span>{edital.publico_alvo.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumo IA */}
          {edital.resumo_ia && (
            <div className="bg-white rounded-xl border border-black/[0.07] p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-[6px] bg-[#f0edf8] flex items-center justify-center">
                  <Sparkles size={13} className="text-[#46347F]" />
                </div>
                <h2 className="text-[14px] font-semibold text-[#1a1523]">Resumo IA</h2>
              </div>
              <p className="text-[13px] text-[#374151] leading-relaxed">{edital.resumo_ia}</p>
            </div>
          )}

          {/* Proximos passos */}
          {edital.proximos_passos?.length > 0 && (
            <div className="bg-white rounded-xl border border-black/[0.07] p-6">
              <h2 className="text-[14px] font-semibold text-[#1a1523] mb-3">Proximos passos</h2>
              <ol className="space-y-2">
                {edital.proximos_passos.map((passo: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                    <span className="w-5 h-5 rounded-full bg-[#f0edf8] flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-[#46347F]">
                      {i + 1}
                    </span>
                    {passo}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Descricao */}
          {edital.descricao && (
            <div className="bg-white rounded-xl border border-black/[0.07] p-6">
              <h2 className="text-[14px] font-semibold text-[#1a1523] mb-3">Descricao completa</h2>
              <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">{edital.descricao}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {edital.score_aderencia != null && (
            <div className="bg-white rounded-xl border border-black/[0.07] p-5 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-3">Aderencia</p>
              <ScoreGauge score={edital.score_aderencia} size="md" />
            </div>
          )}

          {edital.porte_empresa?.length > 0 && (
            <div className="bg-white rounded-xl border border-black/[0.07] p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-2">Porte elegivel</p>
              <div className="flex flex-wrap gap-1.5">
                {edital.porte_empresa.map((p: string) => (
                  <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f0edf8] text-[#46347F]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-black/[0.07] p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-2">Fonte</p>
            <p className="text-[13px] font-medium text-[#1a1523]">{edital.fontes?.nome || 'Desconhecida'}</p>
            <p className="text-[11px] text-[#9ca3af] mt-1">
              Coletado em {new Date(edital.coletado_em).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
