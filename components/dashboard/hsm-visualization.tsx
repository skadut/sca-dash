'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Certificate } from '@/lib/types'

interface HSMVisualizationProps {
  certificates: Certificate[]
}

export function HSMVisualization({ certificates }: HSMVisualizationProps) {
  // Calculate HSM type distribution
  const hsmDistribution = certificates.reduce(
    (acc, cert) => {
      const hsm = cert.hsm || 'Unknown'
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

  // Calculate HSM status breakdown
  const hsmStatusBreakdown = certificates.reduce(
    (acc, cert) => {
      const hsm = cert.hsm || 'Unknown'
      const existing = acc.find((item) => item.hsm === hsm)

      let status = 'active'
      if (cert.revoked_app_status) status = 'revoked'
      else if (cert.expired_date && new Date(cert.expired_date.slice(0, 4) + '-' + cert.expired_date.slice(4, 6) + '-' + cert.expired_date.slice(6, 8)) < new Date())
        status = 'expired'

      if (existing) {
        existing[status as keyof typeof existing] = (existing[status as keyof typeof existing] || 0) + 1
      } else {
        acc.push({
          hsm,
          active: status === 'active' ? 1 : 0,
          revoked: status === 'revoked' ? 1 : 0,
          expired: status === 'expired' ? 1 : 0,
        })
      }
      return acc
    },
    [] as Array<{ hsm: string; active: number; revoked: number; expired: number }>
  )

  const COLORS = {
    'SPBE': '#06b6d4',
    'IIV': '#8b5cf6',
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">HSM Type Distribution</CardTitle>
        <CardDescription className="text-sm">Overview of certificates by HSM type and status</CardDescription>
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
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {hsmDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value} certificates`}
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
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">
                  {((item.value / certificates.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
