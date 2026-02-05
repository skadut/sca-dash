'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Key } from '@/lib/types'

interface KeyHSMVisualizationProps {
  keys: Key[]
}

export function KeyHSMVisualization({ keys }: KeyHSMVisualizationProps) {
  // Calculate HSM type distribution for keys
  const hsmDistribution = keys.reduce(
    (acc, key) => {
      const hsm = key.hsm || 'Unknown'
      const existing = acc.find((item) => item.name === hsm)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: hsm, value: 1 })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>
  )

  const COLORS = {
    'klavis-spbe': '#06b6d4',
    'Klavis-SPBE': '#06b6d4',
    'klavis-iiv': '#8b5cf6',
    'Klavis-IIV': '#8b5cf6',
    'thales-luna': '#f59e0b',
    'Thales-Luna': '#f59e0b',
    'Unknown': '#6b7280',
  }

  const getColor = (name: string) => {
    const normalized = name.toLowerCase()
    if (normalized.includes('spbe')) return COLORS['klavis-spbe']
    if (normalized.includes('iiv')) return COLORS['klavis-iiv']
    if (normalized.includes('thales') || normalized.includes('luna')) return COLORS['thales-luna']
    return COLORS[name as keyof typeof COLORS] || '#6b7280'
  }

  const getDisplayName = (name: string) => {
    const normalized = name.toLowerCase()
    if (normalized.includes('spbe')) return 'Klavis-SPBE'
    if (normalized.includes('iiv')) return 'Klavis-IIV'
    if (normalized.includes('thales') || normalized.includes('luna')) return 'Thales-Luna'
    return name
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Key HSM Type</CardTitle>
        <CardDescription className="text-sm">Overview of keys by HSM type distribution</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-center mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hsmDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${getDisplayName(name)}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {hsmDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value} keys`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="space-y-3">
          {hsmDistribution.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getColor(item.name) }}
                />
                <span className="font-medium font-sans">{getDisplayName(item.name)}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono">{item.value}</p>
                <p className="text-xs text-muted-foreground">
                  {((item.value / keys.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
