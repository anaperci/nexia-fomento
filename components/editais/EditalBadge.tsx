import type { StatusEdital, Modalidade } from '@/types'

type BadgeType = 'status' | 'modalidade' | 'area'

const statusConfig: Record<StatusEdital, { label: string; className: string }> = {
  ativo:     { label: 'Aberto',    className: 'bg-[#eaf3de] text-[#3b6d11]' },
  vencendo:  { label: 'Vencendo',  className: 'bg-[#faeeda] text-[#854f0b]' },
  encerrado: { label: 'Encerrado', className: 'bg-[#fcebeb] text-[#a32d2d]' },
  suspenso:  { label: 'Suspenso',  className: 'bg-[#f3f4f6] text-[#6b7280]' },
}

const modalidadeConfig: Record<Modalidade, { label: string }> = {
  subvencao: { label: 'Subvencao' },
  credito:   { label: 'Credito' },
  premio:    { label: 'Premio' },
  bolsa:     { label: 'Bolsa' },
  outro:     { label: 'Outro' },
}

interface Props {
  type: BadgeType
  value: string
}

export function EditalBadge({ type, value }: Props) {
  if (type === 'status') {
    const config = statusConfig[value as StatusEdital]
    if (!config) return null
    const isVencendo = value === 'vencendo'
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.className}`}>
        {isVencendo && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
          </span>
        )}
        {config.label}
      </span>
    )
  }

  if (type === 'modalidade') {
    const config = modalidadeConfig[value as Modalidade]
    return (
      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e6f1fb] text-[#185fa5]">
        {config?.label || value}
      </span>
    )
  }

  return (
    <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f0edf8] text-[#46347F]">
      {value}
    </span>
  )
}
