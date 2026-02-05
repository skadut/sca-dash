"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { KeyInventoryStats } from "@/components/dashboard/key-inventory"
import { KeyInsights } from "@/components/dashboard/key-insights"
import { KeyTrafficGraph } from "@/components/dashboard/key-traffic-graph"
import { BarChart3, Grid3x3 } from "lucide-react"
import type { Key } from "@/lib/types"

interface KeyInventoryToggleProps {
  keys: Key[]
}

export function KeyInventoryToggle({ keys }: KeyInventoryToggleProps) {
  const [activeView, setActiveView] = useState<"overview" | "traffic">("overview")

  return (
    <div className="space-y-6">
      {/* Toggle Switch - Modern Segmented Control */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="inline-flex w-full max-w-md rounded-lg bg-muted/50 p-1 mx-auto gap-1">
            {/* Overview Button */}
            <button
              onClick={() => setActiveView("overview")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${
                activeView === "overview"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              Overview
            </button>

            {/* Traffic Analysis Button */}
            <button
              onClick={() => setActiveView("traffic")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${
                activeView === "traffic"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Traffic Analysis
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections - Fixed Height with Smooth Transition */}
      <div className="relative h-full min-h-[600px] overflow-hidden">
        {/* Overview Section */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeView === "overview"
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-full pointer-events-none"
          }`}
        >
          <div className="space-y-6">
            <KeyInventoryStats keys={keys} />
            <KeyInsights keys={keys} />
          </div>
        </div>

        {/* Traffic Analysis Section */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeView === "traffic"
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 -translate-x-full pointer-events-none"
          }`}
        >
          <KeyTrafficGraph keys={keys} />
        </div>
      </div>
    </div>
  )
}
