"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import type { Key } from "@/lib/types"
import { ShieldCheck, ShieldX } from "lucide-react"

interface KeySecretRelationshipProps {
  keys: Key[]
}

export function KeySecretRelationship({ keys }: KeySecretRelationshipProps) {
  // Count keys with and without secrets
  const withSecret = keys.filter((k) => k.secret_data && k.secret_data.trim() !== "").length
  const withoutSecret = keys.length - withSecret

  const data = [
    { name: "With Secret", value: withSecret, color: "#10b981" },
    { name: "Without Secret", value: withoutSecret, color: "#6b7280" },
  ]

  const percentage = keys.length > 0 ? ((withSecret / keys.length) * 100).toFixed(1) : "0"

  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Key-Secret Relationship</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Keys with associated secret data</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} keys`, "Count"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">With Secret</p>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">{withSecret}</p>
            <p className="text-xs text-muted-foreground mt-1">{percentage}% of total keys</p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-500/10 border border-zinc-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldX className="h-4 w-4 text-zinc-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Without Secret</p>
            </div>
            <p className="text-2xl font-bold font-mono text-zinc-400">{withoutSecret}</p>
            <p className="text-xs text-muted-foreground mt-1">{(100 - parseFloat(percentage)).toFixed(1)}% of total keys</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
