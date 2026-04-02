'use client'
import { useState } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { AnalisadorForm } from '@/components/analisador/AnalisadorForm'
import { ResultadoAnalise } from '@/components/analisador/ResultadoAnalise'
import type { AnaliseCompleta } from '@/types'

export default function AnalisarPage() {
  const [resultado, setResultado] = useState<AnaliseCompleta | null>(null)
  const [editalId, setEditalId] = useState<string | null>(null)

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[#1a1523] tracking-[-0.03em]">
          Analisar Edital
        </h1>
        <p className="text-[13px] text-[#6b7280] mt-1">
          Cole o texto do edital e a IA avalia o fit para NexIA Lab e NCT Informatica
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnalisadorForm
          onResult={(analise, id) => {
            setResultado(analise)
            setEditalId(id ?? null)
          }}
        />
        {resultado && (
          <ResultadoAnalise analise={resultado} editalId={editalId} />
        )}
      </div>
    </PageTransition>
  )
}
