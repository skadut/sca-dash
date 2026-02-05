"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Certificate, Key } from "@/lib/types"

interface CombinedHSMVisualizationProps {
  certificates: Certificate[]
  keys: Key[]
}

export function CombinedHSMVisualization({ certificates, keys }: CombinedHSMVisualizationProps) {
  // Calculate HSM type distribution
  const hsmTypes = new Set([
    ...certificates.map((c) => c.hsm || "Unknown"),
    ...keys.map((k) => k.hsm || "Unknown"),
  ])

  const data = Array.from(hsmTypes).map((hsm) => {
    const certCount = certificates.filter((c) => (c.hsm || "Unknown") === hsm).length
    const keyCount = keys.filter((k) => (k.hsm || "Unknown") === hsm).length

    return {
      name: getDisplayName(hsm),
      certificates: certCount,
      keys: keyCount,
      hsm,
    }
  })

  const COLORS = {
    certificates: "#06b6d4",
    keys: "#8b5cf6",
  }

  function getDisplayName(name: string) {
    const normalized = name.toLowerCase()
    if (normalized.includes("spbe")) return "Klavis-SPBE"
    if (normalized.includes("iiv")) return "Klavis-IIV"
    if (normalized.includes("thales") || normalized.includes("luna")) return "Thales-Luna"
    return name
  }

  function getHSMColor(name: string) {
    const normalized = name.toLowerCase()
    if (normalized.includes("spbe")) return "#06b6d4"
    if (normalized.includes("iiv")) return "#8b5cf6"
    if (normalized.includes("thales") || normalized.includes("luna")) return "#f59e0b"
    return "#6b7280"
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">HSM Type Distribution</CardTitle>
        <CardDescription className="text-sm">Certificates and Keys by HSM type</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (value === "certificates" ? "Certificates" : "Keys")}
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="certificates" fill={COLORS.certificates} radius={[4, 4, 0, 0]} />
            <Bar dataKey="keys" fill={COLORS.keys} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="mt-6 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getHSMColor(item.hsm) }} />
                <span className="font-medium text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Certificates</p>
                  <p className="font-bold font-mono text-cyan-400">{item.certificates}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Keys</p>
                  <p className="font-bold font-mono text-purple-400">{item.keys}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
