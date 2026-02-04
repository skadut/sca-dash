'use client'

import Link from "next/link"

import { Shield, Grid3x3, Key, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeMenu?: string
  onMenuChange?: (menu: string) => void
}

export function Sidebar({ activeMenu = 'dashboard', onMenuChange }: SidebarProps) {
  const menuItems = [
    {
      category: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Grid3x3 },
        { id: 'inventory', label: 'Key Inventory', icon: Key },
        { id: 'certificates', label: 'Certificate Access', icon: FileText },
      ],
    },
  ]

  return (
    <aside className="w-64 border-r border-border/50 bg-card sticky top-0 h-screen">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">HSM Vault</h2>
              <p className="text-xs text-muted-foreground">v2.4.1</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
          {menuItems.map((section) => (
            <div key={section.category}>
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.category}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeMenu === item.id

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onMenuChange?.(item.id)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/50 p-4">
          <p className="text-xs text-muted-foreground text-center">
            Connected • All Systems Online
          </p>
        </div>
      </div>
    </aside>
  )
}
