import { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="text-center py-20">
      <div className="w-12 h-12 rounded-xl bg-[#f0edf8] flex items-center justify-center mx-auto mb-3">
        <Icon size={20} className="text-[#46347F]/40" />
      </div>
      <p className="text-[14px] font-medium text-[#1a1523] mb-1">{title}</p>
      <p className="text-[12px] text-[#9ca3af] mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#46347F] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#3a2d6e] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
