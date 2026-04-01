'use client'
import { Calendar } from 'lucide-react'
import type { Edital } from '@/types'
import Link from 'next/link'

interface Props {
  editais: Edital[]
}

export function PrazoTimeline({ editais }: Props) {
  const comPrazo = editais
    .filter(e => e.prazo_submissao)
    .sort((a, b) => new Date(a.prazo_submissao!).getTime() - new Date(b.prazo_submissao!).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white rounded-xl border border-black/[0.07]">
      <div className="px-5 py-3.5 border-b border-black/[0.06]">
        <span className="text-[13px] font-semibold text-[#1a1523]">Prazos proximos</span>
      </div>
      <div className="p-5 space-y-3">
        {comPrazo.map(edital => {
          const dias = Math.ceil((new Date(edital.prazo_submissao!).getTime() - Date.now()) / 86400000)
          const urgente = dias <= 7
          return (
            <Link key={edital.id} href={`/editais/${edital.id}`} className="flex items-center gap-3 group block">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${urgente ? 'bg-[#fcebeb]' : 'bg-[#faeeda]'}`}>
                <Calendar size={13} className={urgente ? 'text-[#a32d2d]' : 'text-[#854f0b]'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#1a1523] truncate group-hover:text-[#46347F] transition-colors">
                  {edital.titulo}
                </p>
                <p className="text-[11px] text-[#9ca3af]">
                  {new Date(edital.prazo_submissao!).toLocaleDateString('pt-BR')}
                  {dias > 0 && <span className={`ml-1 font-medium ${urgente ? 'text-[#a32d2d]' : 'text-[#854f0b]'}`}>({dias}d)</span>}
                </p>
              </div>
            </Link>
          )
        })}
        {comPrazo.length === 0 && (
          <p className="text-[12px] text-[#9ca3af] text-center py-4">Nenhum prazo proximo.</p>
        )}
      </div>
    </div>
  )
}
