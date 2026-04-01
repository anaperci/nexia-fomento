'use client'
import type { Edital } from '@/types'
import Link from 'next/link'

interface Props {
  editais: Edital[]
}

export function EditaisRecentes({ editais }: Props) {
  return (
    <div className="bg-white rounded-xl border border-black/[0.07]">
      <div className="px-5 py-3.5 border-b border-black/[0.06] flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#1a1523]">Maior aderencia</span>
        <Link href="/editais" className="text-[12px] text-[#46347F] font-medium hover:opacity-80">
          Ver todos &rarr;
        </Link>
      </div>
      <div className="divide-y divide-black/[0.04]">
        {editais.map(edital => (
          <Link key={edital.id} href={`/editais/${edital.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#f9f8fc] transition-colors block">
            {edital.score_aderencia != null && (
              <div
                className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 text-[12px] font-bold"
                style={{
                  backgroundColor: edital.score_aderencia >= 75 ? '#eaf3de' : '#faeeda',
                  color: edital.score_aderencia >= 75 ? '#3b6d11' : '#854f0b'
                }}
              >
                {edital.score_aderencia}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1a1523] truncate">{edital.titulo}</p>
              <p className="text-[11px] text-[#9ca3af]">{edital.orgao}</p>
            </div>
          </Link>
        ))}
        {editais.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-[13px] text-[#9ca3af]">Nenhum edital coletado ainda.</p>
            <Link href="/fontes" className="inline-block mt-3 text-[13px] font-medium text-[#46347F] hover:opacity-80">
              Iniciar coleta &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
