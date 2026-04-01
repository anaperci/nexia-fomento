'use client'
import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
}

export function MetricCard({ label, value, suffix = '', icon: Icon, delta, deltaType = 'neutral' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v).toString()
      }
    })
    return controls.stop
  }, [value])

  const deltaColor = {
    positive: 'text-[#3b6d11]',
    negative: 'text-[#a32d2d]',
    neutral:  'text-[#9ca3af]'
  }[deltaType]

  return (
    <div className="bg-white rounded-xl border border-black/[0.07] p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-[8px] bg-[#f0edf8] flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[#46347F]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af] mb-0.5">{label}</p>
        <p className="text-[22px] font-bold text-[#1a1523] leading-none">
          <span ref={ref}>{value}</span>
          {suffix && <span className="text-[14px] text-[#9ca3af] ml-0.5">{suffix}</span>}
        </p>
        {delta && (
          <p className={`text-[11px] mt-1 ${deltaColor}`}>{delta}</p>
        )}
      </div>
    </div>
  )
}
