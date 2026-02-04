"use client"

import { Database, FlaskConical } from "lucide-react"

type DataMode = "mock" | "database"

interface DataModeToggleProps {
  mode: DataMode
  onModeChange: (mode: DataMode) => void
  isConnected?: boolean
}

export function DataModeToggle({ mode, onModeChange, isConnected }: DataModeToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <button
          onClick={() => onModeChange("mock")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "mock" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          Mock Data
        </button>
        <button
          onClick={() => onModeChange("database")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "database"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="h-4 w-4" />
          Database
        </button>
      </div>
      {mode === "database" && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isConnected ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
          }`}
        >
          {isConnected ? "Connected" : "Requires Vercel deployment"}
        </span>
      )}
    </div>
  )
}
