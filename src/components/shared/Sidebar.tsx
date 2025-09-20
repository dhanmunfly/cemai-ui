import React from 'react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/services/uiStore'

const NavLink: React.FC<{ href: string; children: React.ReactNode } & React.HTMLAttributes<HTMLAnchorElement>> = ({ href, className, children, ...props }) => (
  <a href={href} className={cn('px-3 py-2 rounded-md text-sm text-white/80 hover:bg-white/10 transition-colors', className)} {...props}>{children}</a>
)

const Sidebar: React.FC = () => {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)
  React.useEffect(() => {
    const applyWidth = () => {
      try {
        const lg = window.matchMedia('(min-width: 1024px)').matches
        const width = lg ? (collapsed ? '4rem' : '16rem') : '0rem'
        document.documentElement.style.setProperty('--sidebar-w', width)
      } catch {}
    }
    applyWidth()
    const mql = window.matchMedia('(min-width: 1024px)')
    const listener = () => applyWidth()
    mql.addEventListener?.('change', listener)
    window.addEventListener('resize', listener)
    return () => {
      mql.removeEventListener?.('change', listener)
      window.removeEventListener('resize', listener)
    }
  }, [collapsed])
  return (
    <aside className={cn('hidden lg:block fixed left-0 top-0 h-full border-r backdrop-blur p-4 transition-all', 'border-[rgb(var(--color-border))]/40', 'bg-[rgb(var(--color-surface))]/70', collapsed ? 'w-16' : 'w-56')}>
      <button onClick={toggle} className="mb-4 text-white/70 hover:text-white text-sm">{collapsed ? '»' : '«'}</button>
      <div className={cn('text-white font-semibold mb-4', collapsed && 'text-center')}>{collapsed ? 'C' : 'CemAI'}</div>
      <nav className="flex flex-col gap-1">
        <NavLink href="/">{collapsed ? 'D' : 'Dashboard'}</NavLink>
        <NavLink href="/history">{collapsed ? 'H' : 'Decision History'}</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar


