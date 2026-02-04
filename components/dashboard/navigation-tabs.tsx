"use client"

import { BarChart3, ShieldCheck } from "lucide-react"

type TabType = "status" | "graph"

interface NavigationTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: "status" as const, label: "Status", icon: ShieldCheck },
    { id: "graph" as const, label: "Graph", icon: BarChart3 },
  ]

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
