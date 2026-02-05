"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
      {/* Toggle Buttons */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={activeView === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("overview")}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeView === "traffic" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("traffic")}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Traffic Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <div className="relative min-h-[500px]">
        {activeView === "overview" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <KeyInventoryStats keys={keys} />
            <KeyInsights keys={keys} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <KeyTrafficGraph keys={keys} />
          </div>
        )}
      </div>
    </div>
  )
}
