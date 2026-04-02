'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, Radio, Bell, Settings, Zap, Sparkles
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/editais',   label: 'Editais',   icon: FileText },
  { href: '/analisar',  label: 'Analisar',  icon: Sparkles },
  { href: '/fontes',    label: 'Fontes',    icon: Radio },
  { href: '/alertas',   label: 'Alertas',   icon: Bell },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#46347F] flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-white/[0.15] flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-white text-[15px] font-bold">
            NexIA <span className="opacity-50">Fomento</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-[8px] bg-white/[0.15]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className={`relative flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/[0.06]'
              }`}>
                <Icon size={15} />
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/[0.08]">
        <Link href="/configuracoes" className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-white/60 hover:text-white/90 hover:bg-white/[0.06] text-[13px] transition-colors">
          <Settings size={15} />
          Configuracoes
        </Link>
      </div>
    </aside>
  )
}
